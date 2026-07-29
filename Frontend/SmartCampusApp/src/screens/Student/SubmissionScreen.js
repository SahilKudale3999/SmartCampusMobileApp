import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/axios";

export default function SubmissionScreen({ route, navigation }) {
  const { assignmentId, title, subjectName, deadline } = route?.params || {};

  const [link, setLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const handleSubmit = async () => {
    if (!link.trim()) {
      Alert.alert("Missing Link", "Please paste your project or document link before submitting.");
      return;
    }

    setUploading(true);

    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        Alert.alert("Session Error", "Please log in again.");
        setUploading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      const studentId = parsedUser?.studentId || parsedUser?.user?.studentId || parsedUser?.id;

      if (!studentId) {
        Alert.alert("Error", "Student ID not found in session.");
        setUploading(false);
        return;
      }

      const payload = {
        assignmentId: Number(assignmentId),
        studentId: Number(studentId),
        fileUrl: link.trim(),
        gradeScore: null,
      };

      await api.post("/submissions", payload);

      setUploading(false);
      setShowSuccessModal(true);

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      setUploading(false);
      console.error("Submission failed:", error.response?.data || error.message);
      
      let errorMessage = "Could not save to database. Please try again.";
      if (error.message === "Network Error") {
        errorMessage = "Network Error: Cannot connect to the backend server. Please check your API base URL configuration.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Submission Failed", errorMessage);
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Top Deep Blue Cinematic Header Banner */}
      <LinearGradient
        colors={["#0F172A", "#1E3A8A", "#2563EB"]}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
          <View style={styles.floatingBubbleOne} />
          <View style={styles.floatingBubbleTwo} />

          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Turn In Work</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="school-outline" size={16} color="#93C5FD" />
              <Text style={styles.heroBadgeText}>Smart Campus Portal</Text>
            </View>
            <Text style={styles.heroMainTitle}>Deploy Assignment</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Floating Assignment Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderIndicator} />
          <Text style={styles.subjectTag}>{subjectName || "Subject"}</Text>
          <Text style={styles.assignmentTitle}>{title || "Assignment Details"}</Text>
          
          {deadline && (
            <View style={styles.deadlineRow}>
              <View style={styles.deadlineIconBox}>
                <Ionicons name="time-outline" size={14} color="#2563EB" />
              </View>
              <Text style={styles.deadlineText}>Due Date: <Text style={styles.deadlineBold}>{deadline}</Text></Text>
            </View>
          )}
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Project Repository / Cloud Link</Text>
          
          <View style={[styles.inputWrapper, link.trim().length > 0 && styles.inputWrapperActive]}>
            <MaterialCommunityIcons name="link-variant" size={20} color="#2563EB" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Paste Google Drive, GitHub, or Doc link here..."
              placeholderTextColor="#94A3B8"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {link.length > 0 && (
              <TouchableOpacity onPress={() => setLink("")} style={styles.clearIconBtn}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.hintBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2563EB" />
            <Text style={styles.hintText}>
              Ensure your link sharing permissions are set to <Text style={styles.hintBold}>"Anyone with the link can view"</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Submit Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!link.trim() || uploading) && styles.disabledButton,
          ]}
          disabled={!link.trim() || uploading}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Assignment</Text>
              <Ionicons name="send" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Clean Light Theme Academic Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCardWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.modalCardContent}>
              <View style={styles.successBadgeContainer}>
                <View style={styles.successBadgeIcon}>
                  <MaterialCommunityIcons name="check-decagram" size={38} color="#22C55E" />
                </View>
              </View>

              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>ACADEMIC RECORD UPDATED</Text>
              </View>

              <Text style={styles.modalTitle}>Successfully Submitted!</Text>
              <Text style={styles.modalSubtitle}>
                Your task has been securely logged to the smart campus portal and delivered to your instructor.
              </Text>

              <TouchableOpacity
                style={styles.modalActionButton}
                activeOpacity={0.85}
                onPress={handleDone}
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalButtonText}>Return to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  heroSection: {
    width: "100%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
    paddingBottom: 35,
  },
  safeAreaHeader: {
    paddingHorizontal: 20,
  },
  floatingBubbleOne: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: -20,
    left: -30,
  },
  floatingBubbleTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    bottom: -30,
    right: -40,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroContent: {
    paddingHorizontal: 4,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  cardHeaderIndicator: {
    width: 32,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    lineHeight: 26,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  deadlineIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "500",
  },
  deadlineBold: {
    fontWeight: "700",
  },
  inputSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  inputWrapperActive: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFC",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  clearIconBtn: {
    padding: 2,
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
    fontWeight: "500",
  },
  hintBold: {
    fontWeight: "700",
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCardWrapper: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalCardContent: {
    padding: 28,
    alignItems: "center",
  },
  successBadgeContainer: {
    marginBottom: 16,
  },
  successBadgeIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});