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
  Image,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";
import api from "../../api/axios";
import { getFacultyDashboard } from "../../api/facultyApi";
import { getSubjectsByFaculty, createSubject } from "../../api/subjectApi";
import { getAllCourses } from "../../api/courseApi";

const AVATAR_STORAGE_KEY = "facultyAvatar";

const AVATAR_OPTIONS = [
  { id: "1", style: "personas", seed: "ProfKabir", label: "Professor" },
  { id: "2", style: "personas", seed: "DeanSneha", label: "Dean" },
  { id: "3", style: "micah", seed: "LecturerArjun", label: "Lecturer" },
  { id: "4", style: "micah", seed: "MentorMeera", label: "Mentor" },
  { id: "5", style: "avataaars", seed: "InstructorVikas", label: "Instructor" },
  { id: "6", style: "avataaars", seed: "ScholarNisha", label: "Scholar" },
  { id: "7", style: "notionists", seed: "ResearcherRohan", label: "Researcher" },
  { id: "8", style: "notionists", seed: "DeptHeadPriya", label: "Dept Head" },
  { id: "9", style: "big-smile", seed: "AdvisorAiden", label: "Advisor" },
];

const getAvatarUrl = (style, seed) =>
  `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}`;

export default function FacultyProfileScreen({ navigation }) {
  const [profileData, setProfileData] = useState({
    userId: null,
    facultyId: null,
    fullName: "Faculty",
    email: "faculty@university.edu",
    role: "FACULTY",
    department: "General Department",
    phone: "---",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [stats, setStats] = useState({ subjectCount: 0, studentCount: 0, noticeCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [creatingSubject, setCreatingSubject] = useState(false);

  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [department, setDepartment] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const scaleAnim = useState(new Animated.Value(1))[0];
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

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
      loadSavedAvatar();
    }, [])
  );

  const loadSavedAvatar = async () => {
    try {
      const saved = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) setSelectedAvatar(JSON.parse(saved));
    } catch (error) {
      console.log("Error loading saved avatar:", error);
    }
  };

  const handleSelectAvatar = async (option) => {
    try {
      setSelectedAvatar(option);
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(option));
      setAvatarPickerVisible(false);
    } catch (error) {
      console.log("Error saving avatar:", error);
    }
  };

  const loadUserData = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    let facultyId = null;
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        facultyId = parsed.facultyId ?? null;
        setProfileData({
          userId: parsed.userId || parsed.id || null,
          facultyId,
          fullName: parsed.fullName || "Faculty",
          email: parsed.email || parsed.username || "faculty@university.edu",
          role: parsed.role || "FACULTY",
          department: parsed.department || "General Department",
          phone: parsed.phoneNo || parsed.phone || "Not Provided",
        });
        setFullName(parsed.fullName || "");
        setPhoneNo(parsed.phoneNo || parsed.phone || "");
        setDepartment(parsed.department || "");
      }
    } catch (error) {
      console.log("Error loading profile from storage:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    loadDashboardStats(facultyId);
    loadSubjects(facultyId);
  };

  const loadDashboardStats = async (facultyId) => {
    if (!facultyId) {
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    try {
      const response = await getFacultyDashboard(facultyId);
      const dashboard = response.data?.data || response.data || {};
      setStats({
        subjectCount: dashboard.subjectCount ?? 0,
        studentCount: dashboard.studentCount ?? 0,
        noticeCount: dashboard.noticeCount ?? 0,
      });
      if (dashboard.department) {
        setProfileData((prev) => ({ ...prev, department: dashboard.department }));
      }
    } catch (error) {
      console.log("Error loading faculty dashboard:", error.response?.data || error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadSubjects = async (facultyId) => {
    if (!facultyId) {
      setSubjectsLoading(false);
      return;
    }
    setSubjectsLoading(true);
    try {
      const response = await getSubjectsByFaculty(facultyId);
      const list = response.data?.data || response.data || [];
      setSubjects(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log("Error loading subjects:", error.response?.data || error.message);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await getAllCourses();
      const list = response.data?.data || response.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log("Error loading courses:", error.response?.data || error.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const openAddSubjectModal = () => {
    animatePress();
    setNewSubjectName("");
    setSelectedCourseId(null);
    setAddSubjectModalVisible(true);
    loadCourses();
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      Alert.alert("Error", "Subject name cannot be empty.");
      return;
    }
    if (!selectedCourseId) {
      Alert.alert("Error", "Please select a course.");
      return;
    }
    if (!profileData.facultyId) {
      Alert.alert("Error", "Faculty ID not found. Please log in again.");
      return;
    }
    setCreatingSubject(true);
    try {
      await createSubject({
        subjectName: newSubjectName.trim(),
        courseId: selectedCourseId,
        facultyId: profileData.facultyId,
      });
      setAddSubjectModalVisible(false);
      await loadSubjects(profileData.facultyId);
      setStats((prev) => ({ ...prev, subjectCount: prev.subjectCount + 1 }));
      showSuccess("Subject Added", "The new subject now appears under My Subjects.");
    } catch (error) {
      console.log("Error creating subject:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to add subject. Please try again.");
    } finally {
      setCreatingSubject(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData(true);
  };

  const getInitials = (name) => {
    if (!name) return "FA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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
      const response = await api.put(endpoint, {
        fullName: fullName.trim(),
        phoneNo: phoneNo.trim(),
        department: department.trim(),
        email: profileData.email,
        role: profileData.role,
      });
      const updatedUserPayload = response.data.data || response.data;
      const existingUserStr = await AsyncStorage.getItem("user");
      const existingUser = existingUserStr ? JSON.parse(existingUserStr) : {};
      const mergedUser = {
        ...existingUser,
        ...updatedUserPayload,
        fullName: fullName.trim(),
        phoneNo: phoneNo.trim(),
        department: department.trim(),
      };
      await AsyncStorage.setItem("user", JSON.stringify(mergedUser));
      setProfileData((prev) => ({
        ...prev,
        fullName: fullName.trim(),
        phone: phoneNo.trim() || "Not Provided",
        department: department.trim() || "General Department",
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
    Alert.alert("Notifications", value ? "Push notifications are now active! 🔔" : "Push notifications paused. 🔕");
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
      await api.put(endpoint, { currentPassword, newPassword });
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
        <ActivityIndicator size="large" color={Colors.primary || "#1E3A8A"} />
        <Text style={styles.loaderText}>Loading your faculty profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary || "#1E3A8A"} />}
    >
      <Animated.View style={[styles.profileHeaderCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => { animatePress(); setAvatarPickerVisible(true); }}>
            <View>
              <LinearGradient colors={["#1E3A8A", "#3B82F6", "#0F172A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarRing}>
                <View style={styles.avatarInnerGap}>
                  <View style={styles.avatarContainer}>
                    {selectedAvatar ? (
                      <Image source={{ uri: getAvatarUrl(selectedAvatar.style, selectedAvatar.seed) }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{getInitials(profileData.fullName)}</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.onlineBadge} />
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerDetailsColumn}>
            <Text style={styles.profileName} numberOfLines={1} adjustsFontSizeToFit>{profileData.fullName}</Text>
            <Text style={styles.profileId}>{profileData.role}</Text>
            <View style={styles.deptBadge}>
              <Ionicons name="school" size={13} color="#1E3A8A" style={{ marginRight: 4 }} />
              <Text style={styles.deptBadgeText} numberOfLines={1}>{profileData.department}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>FACULTY</Text>
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

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Academic Metrics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="book-outline" size={18} color="#1E3A8A" />
            {statsLoading ? <ActivityIndicator size="small" color="#1E3A8A" style={{ marginTop: 4 }} /> : <Text style={styles.statValue}>{stats.subjectCount}</Text>}
            <Text style={styles.statLabel}>Active Subjects</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="megaphone-outline" size={18} color="#1E3A8A" />
            {statsLoading ? <ActivityIndicator size="small" color="#1E3A8A" style={{ marginTop: 4 }} /> : <Text style={styles.statValue}>{stats.noticeCount}</Text>}
            <Text style={styles.statLabel}>Notices Sent</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="people-outline" size={18} color="#1E3A8A" />
            {statsLoading ? <ActivityIndicator size="small" color="#1E3A8A" style={{ marginTop: 4 }} /> : <Text style={styles.statValue}>{stats.studentCount}</Text>}
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Subjects</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={openAddSubjectModal}>
            <Ionicons name="add-circle-outline" size={14} color="#1E3A8A" style={{ marginRight: 4 }} />
            <Text style={styles.editProfileButtonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        {subjectsLoading ? (
          <ActivityIndicator size="small" color="#1E3A8A" style={{ marginVertical: 12 }} />
        ) : subjects.length === 0 ? (
          <View style={styles.emptySubjectsCard}>
            <Ionicons name="book-outline" size={22} color="#94A3B8" />
            <Text style={styles.emptySubjectsText}>No subjects assigned yet. Tap "Add Subject" to create one.</Text>
          </View>
        ) : (
          <View style={styles.infoCard}>
            {subjects.map((subject, index) => (
              <View key={subject.subjectId ?? subject.id ?? index}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="book" size={18} color="#1E3A8A" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoValue}>{subject.subjectName}</Text>
                    {!!subject.courseName && <Text style={styles.infoLabel}>{subject.courseName}</Text>}
                  </View>
                </View>
                {index < subjects.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Contact & Credentials</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => {
              animatePress();
              setFullName(profileData.fullName);
              setPhoneNo(profileData.phone === "Not Provided" ? "" : profileData.phone);
              setDepartment(profileData.department);
              setEditModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={14} color="#1E3A8A" style={{ marginRight: 4 }} />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="mail" size={18} color="#1E3A8A" />
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
            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="business" size={18} color="#D97706" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{profileData.department}</Text>
            </View>
          </View>
        </View>
      </View>

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
            thumbColor={notificationsEnabled ? "#1E3A8A" : "#F1F5F9"}
          />
        </View>
        <TouchableOpacity style={styles.menuItemCardTouchable} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="lock-closed" size={18} color="#9333EA" />
            </View>
            <Text style={styles.menuText}>Change Security Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color="#DC2626" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out of Account</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      <Modal animationType="slide" transparent={true} visible={avatarPickerVisible} onRequestClose={() => setAvatarPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Choose Your Avatar</Text>
              <TouchableOpacity onPress={() => setAvatarPickerVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={AVATAR_OPTIONS}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
              renderItem={({ item }) => {
                const isSelected = selectedAvatar?.style === item.style && selectedAvatar?.seed === item.seed;
                return (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelectAvatar(item)} style={[styles.avatarOptionWrap, isSelected && styles.avatarOptionWrapSelected]}>
                    <Image source={{ uri: getAvatarUrl(item.style, item.seed) }} style={styles.avatarOptionImage} />
                    {isSelected && (
                      <View style={styles.avatarOptionCheck}>
                        <Ionicons name="checkmark-circle" size={18} color="#1E3A8A" />
                      </View>
                    )}
                    <Text style={styles.avatarOptionLabel} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.textInput} placeholder="Enter full name" placeholderTextColor="#94A3B8" value={fullName} onChangeText={setFullName} />
            <Text style={styles.inputLabel}>Department</Text>
            <TextInput style={styles.textInput} placeholder="Enter department" placeholderTextColor="#94A3B8" value={department} onChangeText={setDepartment} />
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.textInput} placeholder="Enter phone number" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={phoneNo} onChangeText={setPhoneNo} />
            <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleProfileUpdate} disabled={updatingProfile}>
              {updatingProfile ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Update Password</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput style={styles.textInput} secureTextEntry placeholder="Enter current password" placeholderTextColor="#94A3B8" value={currentPassword} onChangeText={setCurrentPassword} />
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput style={styles.textInput} secureTextEntry placeholder="Min 6 characters required" placeholderTextColor="#94A3B8" value={newPassword} onChangeText={setNewPassword} />
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput style={styles.textInput} secureTextEntry placeholder="Re-enter new password" placeholderTextColor="#94A3B8" value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handlePasswordUpdate} disabled={updating}>
              {updating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={addSubjectModalVisible} onRequestClose={() => setAddSubjectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add New Subject</Text>
              <TouchableOpacity onPress={() => setAddSubjectModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Subject Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Data Structures"
              placeholderTextColor="#94A3B8"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />

            <Text style={styles.inputLabel}>Course</Text>
            {coursesLoading ? (
              <ActivityIndicator size="small" color="#1E3A8A" style={{ marginTop: 8 }} />
            ) : courses.length === 0 ? (
              <Text style={styles.emptySubjectsText}>No courses available.</Text>
            ) : (
              <ScrollView style={styles.courseListWrap} nestedScrollEnabled>
                {courses.map((course) => {
                  const courseId = course.courseId ?? course.id;
                  const isSelected = selectedCourseId === courseId;
                  return (
                    <TouchableOpacity
                      key={courseId}
                      style={[styles.courseOptionRow, isSelected && styles.courseOptionRowSelected]}
                      onPress={() => setSelectedCourseId(courseId)}
                    >
                      <Text style={[styles.courseOptionText, isSelected && styles.courseOptionTextSelected]}>
                        {course.courseName ?? course.name}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#1E3A8A" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleCreateSubject} disabled={creatingSubject}>
              {creatingSubject ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Add Subject</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal animationType="none" transparent={true} visible={successVisible} onRequestClose={hideSuccess}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { opacity: successCardOpacity, transform: [{ scale: successCardScale }] }]}>
            <View style={styles.successIconWrap}>
              <Animated.View style={[styles.successRing, { opacity: successRingOpacity, transform: [{ scale: successRingScale }] }]} />
              <Animated.View style={[styles.successIconCircle, { transform: [{ scale: successIconScale }] }]}>
                <Ionicons name="checkmark" size={34} color="#FFFFFF" />
              </Animated.View>
            </View>
            <Text style={styles.successTitle}>{successTitle}</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <TouchableOpacity style={styles.successButton} activeOpacity={0.85} onPress={hideSuccess}>
              <Text style={styles.successButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  contentContainer: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loaderText: { marginTop: 10, color: "#64748B", fontWeight: "600" },
  profileHeaderCard: { backgroundColor: "#FFFFFF", marginTop: 10, marginBottom: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#F1F5F9", elevation: 3, shadowColor: "#0F172A", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, width: "100%" },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  headerDetailsColumn: { flex: 1, marginLeft: 16, alignItems: "flex-start" },
  avatarRing: { width: 98, height: 98, borderRadius: 49, justifyContent: "center", alignItems: "center" },
  avatarInnerGap: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  avatarContainer: { width: 82, height: 82, borderRadius: 41, backgroundColor: Colors.primary || "#1E3A8A", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#FFFFFF", fontSize: 26, fontWeight: "800" },
  onlineBadge: { position: "absolute", bottom: 4, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: "#10B981", borderWidth: 2, borderColor: "#FFFFFF" },
  editAvatarBadge: { position: "absolute", bottom: 4, left: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  avatarOptionWrap: { width: 88, alignItems: "center", paddingTop: 8, paddingBottom: 6, borderRadius: 16, borderWidth: 2, borderColor: "#F1F5F9", backgroundColor: "#F8FAFC", position: "relative" },
  avatarOptionWrapSelected: { borderColor: "#1E3A8A", backgroundColor: "#EFF6FF" },
  avatarOptionImage: { width: 60, height: 60, borderRadius: 30 },
  avatarOptionCheck: { position: "absolute", top: 4, right: 4, backgroundColor: "#FFFFFF", borderRadius: 10 },
  avatarOptionLabel: { fontSize: 10, fontWeight: "700", color: "#334155", marginTop: 6 },
  profileName: { fontSize: 20, fontWeight: "800", color: "#0F172A", textAlign: "left", width: "100%" },
  profileId: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },
  deptBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: "#DBEAFE", alignSelf: "flex-start", maxWidth: "100%" },
  deptBadgeText: { fontSize: 12, fontWeight: "700", color: "#1E3A8A", flexShrink: 1 },
  heroStatsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  heroStatItem: { alignItems: "center", flex: 1 },
  heroStatValue: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  heroStatLabel: { fontSize: 10, fontWeight: "600", color: "#64748B", marginTop: 2 },
  heroStatDivider: { width: 1, height: 24, backgroundColor: "#F1F5F9" },
  sectionContainer: { marginBottom: 20, width: "100%" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  editProfileButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#DBEAFE" },
  editProfileButtonText: { fontSize: 12, fontWeight: "700", color: "#1E3A8A" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  statBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: 17, fontWeight: "900", color: "#0F172A", marginTop: 4 },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#64748B", marginTop: 2, textAlign: "center" },
  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: "#F1F5F9", elevation: 2, shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  insightsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: "#F1F5F9", elevation: 2, shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  insightRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  insightIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  insightTextContainer: { flex: 1 },
  insightTitle: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  insightDesc: { fontSize: 11, color: "#64748B", fontWeight: "500", marginTop: 1 },
  liveIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981" },
  secureBadgeText: { fontSize: 10, fontWeight: "800", color: "#059669", backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: "hidden" },
  termBadgeText: { fontSize: 10, fontWeight: "800", color: "#0284C7", backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  infoValue: { fontSize: 14, color: "#0F172A", fontWeight: "700", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#F1F5F9" },
  emptySubjectsCard: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#F1F5F9", padding: 20, alignItems: "center" },
  emptySubjectsText: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginTop: 8, textAlign: "center" },
  courseListWrap: { maxHeight: 160, marginTop: 8, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12 },
  courseOptionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  courseOptionRowSelected: { backgroundColor: "#EFF6FF" },
  courseOptionText: { fontSize: 13, fontWeight: "600", color: "#334155" },
  courseOptionTextSelected: { color: "#1E3A8A", fontWeight: "800" },
  menuItemCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#F1F5F9", elevation: 2, shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  menuItemCardTouchable: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#F1F5F9", elevation: 2, shadowColor: "#0F172A", shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  menuLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  logoutButton: { flexDirection: "row", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5", paddingVertical: 15, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 5, elevation: 1 },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#DC2626" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContent: { backgroundColor: "#FFFFFF", width: "100%", borderRadius: 22, padding: 22, elevation: 5, shadowColor: "#0F172A", shadowOpacity: 0.15, shadowRadius: 12 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, marginTop: 10 },
  textInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0F172A" },
  submitButton: { backgroundColor: Colors.primary || "#1E3A8A", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 20, elevation: 2 },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  successOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  successCard: { backgroundColor: "#FFFFFF", borderRadius: 28, paddingVertical: 32, paddingHorizontal: 24, width: "100%", alignItems: "center", elevation: 8, shadowColor: "#0F172A", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  successIconWrap: { width: 84, height: 84, justifyContent: "center", alignItems: "center", marginBottom: 18 },
  successRing: { position: "absolute", width: 84, height: 84, borderRadius: 42, backgroundColor: "#BBF7D0" },
  successIconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#22C55E", justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#16A34A", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  successTitle: { fontSize: 19, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  successMessage: { fontSize: 13, color: "#64748B", fontWeight: "500", textAlign: "center", marginTop: 6, lineHeight: 19 },
  successButton: { backgroundColor: "#22C55E", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 40, marginTop: 22, elevation: 2 },
  successButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});