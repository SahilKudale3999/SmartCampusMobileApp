import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  TextInput,
  RefreshControl,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import api from "../../api/axios";

export default function ProfileScreen({ navigation }) {
  const [profileData, setProfileData] = useState({
    userId: null,
    fullName: "Student",
    email: "student@college.edu",
    role: "STUDENT",
    studentId: "---",
    rollNo: "---",
    phone: "---",
    courseName: "General Course",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit Profile Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // Animation for interactive elements
  const scaleAnim = useState(new Animated.Value(1))[0];

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Success Popup States
  const [successVisible, setSuccessVisible] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const successIconScale = useState(new Animated.Value(0))[0];
  const successCardScale = useState(new Animated.Value(0.85))[0];
  const successCardOpacity = useState(new Animated.Value(0))[0];
  const successRingScale = useState(new Animated.Value(0.6))[0];
  const successRingOpacity = useState(new Animated.Value(0.6))[0];

  const showSuccess = (title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessVisible(true);

    successCardScale.setValue(0.85);
    successCardOpacity.setValue(0);
    successIconScale.setValue(0);
    successRingScale.setValue(0.6);
    successRingOpacity.setValue(0.6);

    Animated.parallel([
      Animated.timing(successCardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(successCardScale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(successIconScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(120),
        Animated.parallel([
          Animated.timing(successRingScale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(successRingOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  };

  const hideSuccess = () => {
    Animated.parallel([
      Animated.timing(successCardOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(successCardScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
    ]).start(() => setSuccessVisible(false));
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        
        const courseMap = {
          1: "Bachelor of Computer Applications",
          2: "B.Sc. Information Technology",
          3: "Master of Computer Applications",
          4: "Bachelor of Business Administration",
          5: "B.Tech Computer Science"
        };

        const resolvedCourseName = 
          parsed.courseName || 
          parsed.course_name || 
          courseMap[parsed.courseId] || 
          (parsed.courseId ? `Course ID: ${parsed.courseId}` : "General Course");

        setProfileData({
          userId: parsed.userId || parsed.id || null,
          fullName: parsed.fullName || "Student",
          email: parsed.email || parsed.username || "student@college.edu",
          role: parsed.role || "STUDENT",
          studentId: parsed.studentId ? String(parsed.studentId) : "---",
          rollNo: parsed.rollNo || parsed.roll_no || (parsed.studentId ? `STU-${parsed.studentId}` : "---"),
          phone: parsed.phoneNo || parsed.phone || "Not Provided",
          courseName: resolvedCourseName,
        });

        setFullName(parsed.fullName || "");
        setPhoneNo(parsed.phoneNo || parsed.phone || "");
      }
    } catch (error) {
      console.log("Error loading profile from storage:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData(true);
  };

  // Helper to grab initials for a custom avatar badge
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleProfileUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name cannot be empty.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const endpoint = profileData.userId ? `/users/${profileData.userId}` : `/users/profile`;

      // Backend's UserRequest DTO requires email and role (@NotBlank / @NotNull),
      // even though this is a "profile" update. We send the existing values back
      // unchanged so the update only actually changes fullName and phoneNo.
      const response = await api.put(endpoint, {
        fullName: fullName.trim(),
        phoneNo: phoneNo.trim(),
        email: profileData.email,
        role: profileData.role,
      });

      const updatedUserPayload = response.data.data || response.data;
      
      const existingUserStr = await AsyncStorage.getItem("user");
      const existingUser = existingUserStr ? JSON.parse(existingUserStr) : {};
      const mergedUser = { ...existingUser, ...updatedUserPayload, fullName: fullName.trim(), phoneNo: phoneNo.trim() };

      await AsyncStorage.setItem("user", JSON.stringify(mergedUser));

      setProfileData((prev) => ({
        ...prev,
        fullName: fullName.trim(),
        phone: phoneNo.trim() || "Not Provided",
      }));

      setEditModalVisible(false);
      showSuccess("Profile Updated", "Your details have been saved successfully.");
    } catch (error) {
      console.log("Error updating profile:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    Alert.alert(
      "Notifications", 
      value ? "Push notifications are now active! 🔔" : "Push notifications paused. 🔕"
    );
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setUpdating(true);
    try {
      const endpoint = profileData.userId ? `/users/${profileData.userId}/password` : `/users/password`;
      await api.put(endpoint, {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      setModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Password Updated", "Your account is secured with the new password.");
    } catch (error) {
      console.log("Error updating password:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to update password. Please verify your current password.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Leaving So Soon? 👋",
      "Are you sure you want to log out of your smart campus account?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("user");
              try {
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
              } catch (err) {
                navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
              }
            } catch (error) {
              console.log("Error during logout:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loaderText}>Loading your smart profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary || "#2563EB"} />
      }
    >
      {/* Interactive Header Card with Dynamic Initials Badge */}
      <Animated.View style={[styles.profileHeaderCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(profileData.fullName)}</Text>
          <View style={styles.onlineBadge} />
        </View>

        <Text style={styles.profileName} numberOfLines={1} adjustsFontSizeToFit>
          {profileData.fullName}
        </Text>
        <Text style={styles.profileId}>Roll No: {profileData.rollNo}</Text>
        
        <View style={styles.deptBadge}>
          <Ionicons name="school" size={13} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={styles.deptBadgeText}>{profileData.courseName}</Text>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>STUDENT</Text>
            <Text style={styles.heroStatLabel}>Role</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={[styles.heroStatValue, { color: "#16A34A" }]}>Online</Text>
            <Text style={styles.heroStatLabel}>Status</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={[styles.heroStatValue, { color: "#4F46E5" }]}>Verified</Text>
            <Text style={styles.heroStatLabel}>Access</Text>
          </View>
        </View>
      </Animated.View>

      {/* Contact & Credentials Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Contact & Credentials</Text>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              animatePress();
              setFullName(profileData.fullName);
              setPhoneNo(profileData.phone === "Not Provided" ? "" : profileData.phone);
              setEditModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="mail" size={18} color="#2563EB" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profileData.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="call" size={18} color="#16A34A" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profileData.phone}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#FDF4FF" }]}>
              <Ionicons name="id-card" size={18} color="#C026D3" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Student Unique ID</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profileData.studentId}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Campus Insights */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Campus Quick Insights</Text>
        <View style={styles.insightsCard}>
          <View style={styles.insightRow}>
            <View style={[styles.insightIconBox, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="flash" size={20} color="#4F46E5" />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Cloud Sync</Text>
              <Text style={styles.insightDesc}>Connected & Fully Synced</Text>
            </View>
            <View style={styles.liveIndicator} />
          </View>

          <View style={styles.divider} />

          <View style={styles.insightRow}>
            <View style={[styles.insightIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="book" size={20} color="#0284C7" />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Current Semester</Text>
              <Text style={styles.insightDesc}>Spring 2026 Active Session</Text>
            </View>
            <Text style={styles.termBadgeText}>TERM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightRow}>
            <View style={[styles.insightIconBox, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="shield-checkmark" size={20} color="#059669" />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Token Shield</Text>
              <Text style={styles.insightDesc}>Secured via JWT Session</Text>
            </View>
            <Text style={styles.secureBadgeText}>SECURE</Text>
          </View>
        </View>
      </View>

      {/* Preferences & Security */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Preferences & Security</Text>
        
        <View style={styles.menuItemCard}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="notifications" size={18} color="#D97706" />
            </View>
            <Text style={styles.menuText}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
            thumbColor={notificationsEnabled ? "#2563EB" : "#F1F5F9"}
          />
        </View>

        <TouchableOpacity 
          style={styles.menuItemCardTouchable} 
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="lock-closed" size={18} color="#9333EA" />
            </View>
            <Text style={styles.menuText}>Change Security Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        activeOpacity={0.85}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={18} color="#DC2626" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out of Account</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phoneNo}
              onChangeText={setPhoneNo}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={handleProfileUpdate}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Update Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#94A3B8"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              placeholder="Min 6 characters required"
              placeholderTextColor="#94A3B8"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              placeholder="Re-enter new password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={handlePasswordUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Animated Success Popup */}
      <Modal
        animationType="none"
        transparent={true}
        visible={successVisible}
        onRequestClose={hideSuccess}
      >
        <View style={styles.successOverlay}>
          <Animated.View 
            style={[
              styles.successCard, 
              { opacity: successCardOpacity, transform: [{ scale: successCardScale }] }
            ]}
          >
            <View style={styles.successIconWrap}>
              <Animated.View 
                style={[
                  styles.successRing,
                  { opacity: successRingOpacity, transform: [{ scale: successRingScale }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.successIconCircle,
                  { transform: [{ scale: successIconScale }] }
                ]}
              >
                <Ionicons name="checkmark" size={34} color="#FFFFFF" />
              </Animated.View>
            </View>

            <Text style={styles.successTitle}>{successTitle}</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>

            <TouchableOpacity 
              style={styles.successButton}
              activeOpacity={0.85}
              onPress={hideSuccess}
            >
              <Text style={styles.successButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  profileHeaderCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    marginBottom: 20,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    width: "100%",
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary || "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#DBEAFE",
    position: "relative",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    width: "100%",
  },
  profileId: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  deptBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F1F5F9",
  },
  sectionContainer: {
    marginBottom: 20,
    width: "100%",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  editProfileButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  insightsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  insightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  insightDesc: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },
  liveIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  secureBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  termBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284C7",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  menuItemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItemCardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 15,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    elevation: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 22,
    padding: 22,
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  submitButton: {
    backgroundColor: Colors.primary || "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  successIconWrap: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  successRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#BBF7D0",
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#16A34A",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  successTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  successButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 40,
    marginTop: 22,
    elevation: 2,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});