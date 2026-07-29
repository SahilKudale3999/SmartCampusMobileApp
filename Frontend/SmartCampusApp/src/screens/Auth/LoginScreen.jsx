import React, { useState } from "react";
import { loginUser } from "../../api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const checkJwtTokenInConsole = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        console.log("🔑 RETRIEVED JWT TOKEN:", token);
      } else {
        console.log("⚠️ No JWT token found in AsyncStorage. Are you logged in?");
      }
    } catch (error) {
      console.log("❌ Error reading token from storage:", error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      console.log("1. Attempting login with:", email.trim());

      const request = {
        email: email.trim(),
        password,
      };

      const response = await loginUser(request);
      console.log("2. Full Server Response Object:", response);

      await checkJwtTokenInConsole();

      const storedUserStr = await AsyncStorage.getItem("user");
      if (!storedUserStr) {
        throw new Error("Login successful, but user data was not stored properly.");
      }

      const storedUser = JSON.parse(storedUserStr);
      const userRole = storedUser.role || storedUser.userRole;

      if (!userRole) {
        alert("Login successful, but could not determine user role.");
        return;
      }

      if (userRole === "STUDENT") {
        navigation.replace("Student");
      } else if (userRole === "FACULTY") {
        navigation.replace("Faculty");
      } else if (userRole === "ADMIN") {
        navigation.replace("Admin");
      } else {
        alert("Unknown user role. Please contact support.");
      }

    } catch (error) {
      console.log("❌ Login Error Caught:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Full immersive top gradient background section */}
        <LinearGradient
          colors={[Colors.primary || "#2563EB", "#1D4ED8"]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.floatingBubbleOne} />
          <View style={styles.floatingBubbleTwo} />
          
          <View style={styles.logoWrapper}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <View style={styles.badgeGlow} />
          </View>
          <Text style={styles.title}>SmartCampus</Text>
          <Text style={styles.subtitle}>Empowering Your Academic Journey</Text>
        </LinearGradient>

        {/* Floating Centered Card Container overlaps nicely with the hero header */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderIndicator} />
          <Text style={styles.cardHeading}>Sign In</Text>
          <Text style={styles.cardSubheading}>Please enter your details to continue</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="student@college.edu"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { paddingRight: 48 }]}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeBtn} 
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={18} 
                  color="#64748B" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primary || "#2563EB", "#1D4ED8"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
              <Text style={styles.footerLink}> Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
    paddingBottom: 40,
  },
  heroSection: {
    height: height * 0.42,
    paddingTop: 50,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    position: "relative",
  },
  floatingBubbleOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -30,
    left: -40,
  },
  floatingBubbleTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    bottom: 20,
    right: -50,
  },
  logoWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 2,
  },
  badgeGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 1,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -65,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderRadius: 28,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeaderIndicator: {
    width: 36,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 2,
  },
  cardSubheading: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 22,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginLeft: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 46,
    paddingRight: 16,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  eyeBtn: {
    position: "absolute",
    right: 16,
    padding: 4,
    zIndex: 5,
  },
  submitButton: {
    borderRadius: 16,
    marginTop: 10,
    overflow: "hidden",
    shadowColor: Colors.primary || "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  footerLink: {
    color: Colors.primary || "#2563EB",
    fontSize: 14,
    fontWeight: "800",
  },
});