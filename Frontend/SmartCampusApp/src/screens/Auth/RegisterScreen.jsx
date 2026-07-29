import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { registerUser } from "../../api/authApi";
import { getAllCourses } from "../../api/courseApi";
import { createStudent } from "../../api/studentApi";
import { createFaculty } from "../../api/facultyApi";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";

const { height } = Dimensions.get("window");

// Helper mapping to assign dynamic coding icons and colors based on course names
const getCourseTheme = (courseName = "") => {
  const name = courseName.toLowerCase();
  if (name.includes("react") || name.includes("native") || name.includes("frontend")) {
    return { icon: "logo-react", color: "#38BDF8", bg: "#E0F2FE" };
  } else if (name.includes("node") || name.includes("backend") || name.includes("express")) {
    return { icon: "server-outline", color: "#22C55E", bg: "#DCFCE7" };
  } else if (name.includes("python") || name.includes("data") || name.includes("ml") || name.includes("ai")) {
    return { icon: "code-slash-outline", color: "#EAB308", bg: "#FEF9C3" };
  } else if (name.includes("java") || name.includes("spring") || name.includes("enterprise")) {
    return { icon: "cafe-outline", color: "#F97316", bg: "#FFEDD5" };
  } else if (name.includes("web") || name.includes("html") || name.includes("css") || name.includes("ui")) {
    return { icon: "globe-outline", color: "#8B5CF6", bg: "#EDE9FE" };
  } else if (name.includes("flutter") || name.includes("mobile") || name.includes("app")) {
    return { icon: "phone-portrait-outline", color: "#06B6D4", bg: "#CFFAFE" };
  } else if (name.includes("database") || name.includes("sql") || name.includes("mongo")) {
    return { icon: "cube-outline", color: "#EC4899", bg: "#FCE7F3" };
  } else {
    return { icon: "laptop-outline", color: Colors.primary || "#2563EB", bg: "#EFF6FF" };
  }
};

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState("STUDENT");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Student-only fields
  const [rollNo, setRollNo] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);

  // Faculty-only field
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await getAllCourses();
      const rawData = response.data;
      let courseList = [];

      if (Array.isArray(rawData)) {
        courseList = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        courseList = rawData.data;
      }

      setCourses(courseList);
    } catch (error) {
      console.log("Course Load Error:", error.response?.data || error.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const validate = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert("Validation Error", "Please fill in all general fields.");
      return false;
    }

    if (role === "STUDENT") {
      if (!rollNo.trim()) {
        Alert.alert("Validation Error", "Please enter your roll number.");
        return false;
      }
      if (!selectedCourse) {
        Alert.alert("Validation Error", "Please choose your coding bootcamp course.");
        return false;
      }
    }

    if (role === "FACULTY" && !department.trim()) {
      Alert.alert("Validation Error", "Please enter your department.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRollNo("");
    setSelectedCourse(null);
    setDepartment("");
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const userRequest = {
        fullName: name.trim(),
        email: email.trim(),
        password,
        phoneNo: phone.trim(),
        role,
      };

      const userResponse = await registerUser(userRequest);
      console.log("Full Registration Server Response:", userResponse);

      // registerUser() already returns the parsed body, i.e.
      // { data: { token, user }, message, success }.
      // Some HTTP clients (axios etc.) wrap that again in a `.data` envelope,
      // so we normalize for both cases WITHOUT double-unwrapping.
      const responseData =
        userResponse && userResponse.success !== undefined
          ? userResponse // already the body: { data, message, success }
          : userResponse.data; // axios-style wrapper: unwrap once

      if (!responseData || responseData.success === false) {
        throw new Error(responseData?.message || "Registration failed");
      }

      // responseData is now { data: { token, user }, message, success }
      const newUserId = responseData.data?.user?.userId;
      console.log("FINAL resolved newUserId:", newUserId);

      if (!newUserId) {
        throw new Error("User ID was not returned by the server.");
      }

      const token = responseData.data?.token;

      if (token) {
        console.log("🔑 REGISTRATION JWT TOKEN:", token);
        await AsyncStorage.setItem("token", token);
      } else {
        console.log("⚠️ No token returned on registration. Backend requires manual login after registering.");
      }

      if (role === "STUDENT") {
        const studentRequest = {
          userId: newUserId,
          courseId: selectedCourse.courseId,
          rollNo: rollNo.trim(),
        };
        await createStudent(studentRequest);
      } else {
        const facultyRequest = {
          userId: newUserId,
          department: department.trim(),
        };
        await createFaculty(facultyRequest);
      }

      Alert.alert("Success", "Account created successfully!");
      resetForm();
      navigation.goBack();
    } catch (error) {
      console.log("Register Error:", error.response?.data || error.message);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Full immersive top gradient banner */}
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
              <Ionicons name="code-slash" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.badgeGlow} />
          </View>
          <Text style={styles.title}>Join SmartCampus</Text>
          <Text style={styles.subtitle}>Start your professional coding journey</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.cardHeaderIndicator} />
          <Text style={styles.cardHeading}>Create Account</Text>
          <Text style={styles.cardSubheading}>Fill out the information below</Text>

          {/* Clean Role Switcher */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleButton, role === "STUDENT" && styles.roleButtonActive]}
              onPress={() => setRole("STUDENT")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={role === "STUDENT" ? "#fff" : Colors.gray}
              />
              <Text style={[styles.roleButtonText, role === "STUDENT" && styles.roleButtonTextActive]}>
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === "FACULTY" && styles.roleButtonActive]}
              onPress={() => setRole("FACULTY")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="briefcase-outline"
                size={16}
                color={role === "FACULTY" ? "#fff" : Colors.gray}
              />
              <Text style={[styles.roleButtonText, role === "FACULTY" && styles.roleButtonTextActive]}>
                Faculty
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <CustomInput placeholder="Full Name" value={name} onChangeText={setName} />
            <CustomInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {role === "STUDENT" ? (
              <>
                <CustomInput
                  placeholder="Roll Number"
                  value={rollNo}
                  onChangeText={setRollNo}
                  autoCapitalize="characters"
                />

                {/* Enhanced Course Selector Box featuring custom dynamic icon */}
                <TouchableOpacity
                  style={styles.uniqueCourseBox}
                  onPress={() => setPickerVisible(true)}
                  disabled={loadingCourses}
                  activeOpacity={0.8}
                >
                  <View style={styles.courseBoxLeft}>
                    <View 
                      style={[
                        styles.iconCircle, 
                        { backgroundColor: selectedCourse ? getCourseTheme(selectedCourse.courseName).bg : "#EFF6FF" }
                      ]}
                    >
                      <Ionicons 
                        name={selectedCourse ? getCourseTheme(selectedCourse.courseName).icon : "code-working-outline"} 
                        size={18} 
                        color={selectedCourse ? getCourseTheme(selectedCourse.courseName).color : (Colors.primary || "#2563EB")} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseBoxLabel}>Target Coding Course</Text>
                      <Text
                        style={[
                          styles.courseBoxValue,
                          !selectedCourse && styles.pickerPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {selectedCourse ? selectedCourse.courseName : "Tap to browse tech stacks"}
                      </Text>
                    </View>
                  </View>
                  {loadingCourses ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <CustomInput
                placeholder="Department Name (e.g. Computer Science)"
                value={department}
                onChangeText={setDepartment}
              />
            )}

            <View style={styles.buttonWrapper}>
              <CustomButton
                title={loading ? "Creating Profile..." : "Create Account"}
                onPress={handleRegister}
              />
            </View>

            <TouchableOpacity
              style={styles.loginContainer}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text style={styles.login}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modern Impressive Coding Tech Stack Grid Selector Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Coding Track</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.closeIconButton}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Choose your preferred software or tech stack path</Text>

            <FlatList
              data={courses}
              keyExtractor={(item, index) => item.courseId ? item.courseId.toString() : index.toString()}
              contentContainerStyle={styles.courseGridContainer}
              renderItem={({ item }) => {
                const isSelected = selectedCourse?.courseId === item.courseId;
                const theme = getCourseTheme(item.courseName);
                
                return (
                  <TouchableOpacity
                    style={[styles.courseCardItem, isSelected && styles.courseCardItemSelected]}
                    onPress={() => {
                      setSelectedCourse(item);
                      setPickerVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View 
                      style={[
                        styles.courseCardIconContainer, 
                        { backgroundColor: isSelected ? Colors.primary || "#2563EB" : theme.bg }
                      ]}
                    >
                      <Ionicons
                        name={isSelected ? "checkmark-sharp" : theme.icon}
                        size={20}
                        color={isSelected ? "#FFFFFF" : theme.color}
                      />
                    </View>
                    <View style={styles.courseCardTextWrapper}>
                      <Text style={[styles.courseCardTitle, isSelected && styles.courseCardTitleSelected]} numberOfLines={1}>
                        {item.courseName}
                      </Text>
                      <Text style={styles.courseCardSubtext}>Professional Coding Bootcamp</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedBadgeDot}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.primary || "#2563EB"} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Ionicons name="code-slash-outline" size={32} color="#94A3B8" />
                  <Text style={styles.modalEmptyText}>No coding courses available from server</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
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
    height: height * 0.38,
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
    bottom: 10,
    right: -50,
  },
  logoWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
  title: {
    fontSize: 28,
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
    marginBottom: 18,
    fontWeight: "500",
  },
  roleToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary || "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  roleButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  formContainer: {
    width: "100%",
  },
  uniqueCourseBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  courseBoxLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  courseBoxLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  courseBoxValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
    marginTop: 2,
  },
  pickerPlaceholder: {
    color: "#94A3B8",
    fontWeight: "500",
  },
  buttonWrapper: {
    marginTop: 6,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  loginText: {
    color: "#64748B",
    fontSize: 14,
  },
  login: {
    color: Colors.primary || "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "70%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  closeIconButton: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 18,
  },
  courseGridContainer: {
    paddingBottom: 20,
  },
  courseCardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  courseCardItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: Colors.primary || "#2563EB",
  },
  courseCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  courseCardTextWrapper: {
    flex: 1,
    marginRight: 8,
  },
  courseCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  courseCardTitleSelected: {
    color: Colors.primary || "#2563EB",
  },
  courseCardSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  selectedBadgeDot: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modalEmptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 10,
    fontSize: 14,
  },
});