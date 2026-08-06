import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Polygon, Rect, Circle as SvgCircle, Line } from "react-native-svg";
import api from "../api/axios";

const { width } = Dimensions.get("window");

// ---------- Helper to Clean Raw Markdown Asterisks ----------
const cleanMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Removes ** bold markers
    .replace(/\*(.*?)\*/g, "$1")     // Removes * italic markers
    .replace(/__(.*?)__/g, "$1")     // Removes __ underline markers
    .replace(/###\s?/g, "")          // Removes headers
    .replace(/##\s?/g, "")
    .replace(/#\s?/g, "");
};

// ---------- Campio Brand Marks ----------
function CampioMark({ size = 20, color = "#a855f7" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Polygon points="16,6 27,11.5 16,17 5,11.5" fill={color} />
      <Rect x="10.5" y="11.5" width="11" height="4" rx="1.2" fill={color} />
      <Line x1="16" y1="17" x2="16" y2="23" stroke={color} strokeWidth="1.6" />
      <SvgCircle cx="16" cy="24.3" r="1.7" fill={color} />
    </Svg>
  );
}

function UserGlyph({ size = 16, color = "#6366f1" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <SvgCircle cx="16" cy="12" r="6" fill={color} />
      <Path d="M4 28c0-7 5-11 12-11s12 4 12 11" fill={color} />
    </Svg>
  );
}

// ---------- Animated Typing Bubble ----------
function TypingBubble() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -5,
            duration: 280,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(280),
        ])
      ).start();

    animateDot(dot1, 0);
    animateDot(dot2, 140);
    animateDot(dot3, 280);
  }, []);

  return (
    <View style={styles.bubbleRow}>
      <View style={styles.avatarBot}>
        <CampioMark size={15} color="#a855f7" />
      </View>
      <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}

// ---------- Message Bubble Component ----------
function MessageBubble({ item }) {
  const anim = useRef(new Animated.Value(0)).current;
  const isUser = item.sender === "user";

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });

  // Clean the text to remove any raw markdown artifacts
  const formattedText = cleanMarkdown(item.text);

  return (
    <View style={[styles.bubbleRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
      {!isUser && (
        <View style={styles.avatarBot}>
          <CampioMark size={15} color="#a855f7" />
        </View>
      )}
      <Animated.View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          { opacity: anim, transform: [{ translateY }, { scale }] },
        ]}
      >
        <Text style={isUser ? styles.userText : styles.botText}>{formattedText}</Text>
        {item.time ? (
          <Text style={isUser ? styles.userTime : styles.botTime}>{item.time}</Text>
        ) : null}
      </Animated.View>
      {isUser && (
        <View style={styles.avatarUser}>
          <UserGlyph size={14} color="#ffffff" />
        </View>
      )}
    </View>
  );
}

// ---------- Launcher Component ----------
const LAUNCHER_PHRASES = ["Hey there! 👋", "Need assistance? 💡", "Ask Campio! 🚀", "Got questions?"];

export function ChatbotLauncher({ onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const runCycle = () => {
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
        timerRef.current = setTimeout(() => {
          Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            setPhraseIndex((i) => (i + 1) % LAUNCHER_PHRASES.length);
            timerRef.current = setTimeout(runCycle, 1200);
          });
        }, 2400);
      });
    };
    timerRef.current = setTimeout(runCycle, 600);
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <View style={styles.launcherWrap}>
      <Animated.View style={[styles.launcherBubble, { opacity: fade }]} pointerEvents="none">
        <Text style={styles.launcherBubbleText}>{LAUNCHER_PHRASES[phraseIndex]}</Text>
      </Animated.View>
      <TouchableOpacity style={styles.launcherBtnWrap} onPress={onPress} activeOpacity={0.88}>
        <Animated.View style={[styles.launcherRing, { transform: [{ scale: pulse }] }]} />
        <View style={styles.launcherBtn}>
          <CampioMark size={28} color="#ffffff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ---------- Main Screen ----------
export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! I'm Campio, your smart campus navigation and assistant companion. How can I help you today?",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Navigation tabs state for quick guidance
  const [activeTab, setActiveTab] = useState("All");
  const quickNavItems = ["All", "Faculty", "Courses", "Schedule", "Campus"];

  const listRef = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserId(parsed.userId);
        }
      } catch (e) {
        console.log("Failed to load user from storage", e);
      }
    })();
  }, []);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(showEvt, scrollToEnd);
    return () => sub.remove();
  }, []);

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const sendMessage = useCallback(async (textToSend) => {
    const messageText = typeof textToSend === "string" ? textToSend : input;
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now().toString(), sender: "user", text: trimmed, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);
    scrollToEnd();

    try {
      const res = await api.post("/chatbot/ask", { message: trimmed, userId });
      const rawBotText = res?.data?.data?.response ?? "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { id: Date.now().toString() + "_bot", sender: "bot", text: rawBotText, time: formatTime() }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_err", sender: "bot", text: "I couldn't reach the server. Please check your connection.", time: formatTime() },
      ]);
    } finally {
      setIsTyping(false);
      scrollToEnd();
    }
  }, [input, userId]);

  const handleQuickNavSelect = (tab) => {
    setActiveTab(tab);
    if (tab === "All") return;
    
    const promptMap = {
      Faculty: "Can you help me find faculty details?",
      Courses: "What courses are available this semester?",
      Schedule: "Where can I view my academic schedule?",
      Campus: "Tell me about campus facilities and layout.",
    };
    if (promptMap[tab]) {
      sendMessage(promptMap[tab]);
    }
  };

  const headerTranslate = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Modern Vibrant Dark Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerTranslate }] }]}>
          <View style={styles.headerGlow} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation?.goBack ? navigation.goBack() : null}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Campio AI Assistant</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, isTyping && styles.statusDotTyping]} />
                <Text style={styles.headerSubtitle}>{isTyping ? "Generating thoughts..." : "Online & Ready"}</Text>
              </View>
            </View>

            <View style={styles.headerAvatarWrap}>
              <CampioMark size={20} color="#a855f7" />
            </View>
          </View>

          {/* Appearing App-like Navigation Filter Pills */}
          <View style={styles.navBarContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={quickNavItems}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.navBarContent}
              renderItem={({ item }) => {
                const isActive = activeTab === item;
                return (
                  <TouchableOpacity
                    style={[styles.navPill, isActive && styles.navPillActive]}
                    onPress={() => handleQuickNavSelect(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.navPillText, isActive && styles.navPillTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Animated.View>

        {/* Message Feed */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={({ item }) => <MessageBubble item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={isTyping ? <TypingBubble /> : null}
        />

        {/* Rich Input Bar */}
        <View style={styles.inputContainerWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask Campio anything..."
              placeholderTextColor="#64748b"
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
              onPress={() => sendMessage()} 
              disabled={!input.trim()} 
              activeOpacity={0.85}
            >
              <Text style={[styles.sendIcon, !input.trim() && styles.sendIconDisabled]}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Modern Vibrant Dark Theme Palette ----------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0b0f19" 
  },
  header: {
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingTop: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerGlow: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(168, 85, 247, 0.12)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: "#f3f4f6",
    fontWeight: "600",
    marginTop: -2,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: { 
    color: "#f9fafb", 
    fontSize: 16, 
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 2 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: "#10b981" 
  },
  statusDotTyping: { 
    backgroundColor: "#a855f7" 
  },
  headerSubtitle: { 
    color: "#9ca3af", 
    fontSize: 12, 
    marginLeft: 6,
    fontWeight: "500",
  },
  headerAvatarWrap: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: "#1f2937", 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 1,
    borderColor: "#374151",
  },

  // Navigation Filter Pills
  navBarContainer: {
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    backgroundColor: "#111827",
  },
  navBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  navPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 6,
  },
  navPillActive: {
    backgroundColor: "#6366f1",
    borderColor: "#818cf8",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  navPillText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },
  navPillTextActive: {
    color: "#ffffff",
  },

  list: { 
    padding: 16, 
    paddingBottom: 24 
  },
  bubbleRow: { 
    flexDirection: "row", 
    alignItems: "flex-end", 
    marginVertical: 6 
  },

  avatarBot: { 
    width: 28, 
    height: 28, 
    borderRadius: 10, 
    backgroundColor: "#1f2937", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: "#374151" 
  },
  avatarUser: { 
    width: 28, 
    height: 28, 
    borderRadius: 10, 
    backgroundColor: "#6366f1", 
    alignItems: "center", 
    justifyContent: "center", 
    marginLeft: 8,
  },

  bubble: { 
    maxWidth: width * 0.72, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: { 
    backgroundColor: "#6366f1", 
    borderBottomRightRadius: 4,
  },
  botBubble: { 
    backgroundColor: "#131c31", 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: "#1f2937",
  },
  userText: { 
    color: "#ffffff", 
    fontSize: 15, 
    lineHeight: 22, 
    fontWeight: "500" 
  },
  botText: { 
    color: "#f3f4f6", 
    fontSize: 15, 
    lineHeight: 22,
    fontWeight: "400",
  },
  userTime: { 
    color: "rgba(255,255,255,0.7)", 
    fontSize: 10, 
    marginTop: 4, 
    textAlign: "right",
    fontWeight: "500",
  },
  botTime: { 
    color: "#6b7280", 
    fontSize: 10, 
    marginTop: 4,
    fontWeight: "500",
  },

  typingBubble: { 
    flexDirection: "row", 
    alignItems: "center", 
    width: 64, 
    paddingVertical: 16,
    justifyContent: "center",
  },
  typingDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: "#a855f7", 
    marginHorizontal: 3, 
    opacity: 0.9,
  },

  inputContainerWrapper: {
    backgroundColor: "#0b0f19",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 4 : 12,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  inputRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#131c31",
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  input: { 
    flex: 1, 
    color: "#f9fafb", 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    fontSize: 15,
  },
  sendBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: "#6366f1", 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: { 
    backgroundColor: "#1f2937",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: { 
    color: "#ffffff", 
    fontSize: 18, 
    fontWeight: "700",
  },
  sendIconDisabled: {
    color: "#4b5563",
  },

  // Launcher Styles
  launcherWrap: { 
    position: "absolute", 
    bottom: 24, 
    right: 20, 
    alignItems: "flex-end",
    zIndex: 99,
  },
  launcherBtnWrap: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  launcherBubble: {
    backgroundColor: "#131c31",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderBottomRightRadius: 2,
    marginBottom: 8,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  launcherBubbleText: { 
    color: "#f3f4f6", 
    fontSize: 13, 
    fontWeight: "600" 
  },
  launcherRing: { 
    position: "absolute", 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: "rgba(168, 85, 247, 0.2)" 
  },
  launcherBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: "#6366f1", 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 2, 
    borderColor: "rgba(255,255,255,0.15)", 
    shadowColor: "#6366f1", 
    shadowOpacity: 0.4, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});