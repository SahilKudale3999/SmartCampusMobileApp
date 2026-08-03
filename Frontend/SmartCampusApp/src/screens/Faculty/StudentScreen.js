import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getStudentsByCourse } from "../../api/studentApi";

export default function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Success Modal & Animation States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      loadRoster();
    }, [])
  );

  const triggerSuccessModal = () => {
    setShowSuccessModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    scaleAnim.setValue(0);
  };

  // Every subject under a faculty's course shares the same student roster,
  // so we skip the subject-picker step entirely: fetch this faculty's
  // subjects just to find their course, then load that course's students directly.
  const loadRoster = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const facultyId = parsedUser?.facultyId;

      if (!facultyId) {
        setErrorMsg("Could not identify logged-in faculty.");
        setLoading(false);
        return;
      }

      const subjectsResponse = await getSubjectsByFaculty(facultyId);
      const subjects = subjectsResponse.data?.data || subjectsResponse.data || [];

      if (!subjects.length) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const primarySubject = subjects[0];
      setCourseName(primarySubject.courseName || "");

      const studentsResponse = await getStudentsByCourse(primarySubject.courseId);
      setStudents(studentsResponse.data?.data || studentsResponse.data || []);
    } catch (error) {
      console.log("Error loading roster:", error.response?.data || error.message);
      setErrorMsg("Failed to load student roster. Pull to refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Students</Text>
            <Text style={styles.subHeader}>
              {courseName ? `${courseName} \u2014 Class Roster & Directory` : "Class Roster & Directory"}
            </Text>
          </View>
        </View>

        {/* Enrolled Count Banner */}
        <View style={styles.activeSubjectBanner}>
          <View style={styles.activeSubjectBadge}>
            <Ionicons name="people-circle-outline" size={16} color="#2563EB" />
            <Text style={styles.activeSubjectBadgeText}>{courseName || "All Students"}</Text>
          </View>
          <Text style={styles.studentCountText}>{students.length} Enrolled</Text>
        </View>

        {errorMsg ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>{errorMsg}</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => String(item.studentId)}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {item.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.studentMetaRow}>
                    <Text style={styles.studentName}>{item.fullName}</Text>
                  </View>
                  <Text style={styles.rollNo}>
                    Roll No: <Text style={styles.rollNoBold}>{item.rollNo || "N/A"}</Text>
                  </Text>
                  <Text style={styles.email} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.emailButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    Linking.openURL(`mailto:${item.email}`);
                    triggerSuccessModal();
                  }}
                >
                  <Ionicons name="mail" size={18} color="#2563EB" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No students enrolled</Text>
              </View>
            }
          />
        )}

        {/* Clean Academic Success Modal */}
        <Modal visible={showSuccessModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.modalCardContent}>
                <View style={styles.successBadgeContainer}>
                  <View style={styles.successBadgeIcon}>
                    <MaterialCommunityIcons name="check-decagram" size={38} color="#2563EB" />
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>COMMUNICATION INITIATED</Text>
                </View>

                <Text style={styles.modalTitle}>Action Triggered!</Text>
                <Text style={styles.modalSubtitle}>
                  Your email client has been dispatched for this student.
                </Text>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  activeOpacity={0.85}
                  onPress={handleCloseModal}
                >
                  <LinearGradient
                    colors={["#2563EB", "#1D4ED8"]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>Back to Roster</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 6 },
  header: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },

  activeSubjectBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeSubjectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  activeSubjectBadgeText: { fontSize: 12, fontWeight: "800", color: "#1D4ED8" },
  studentCountText: { fontSize: 12, fontWeight: "700", color: "#64748B" },

  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitial: { fontSize: 16, fontWeight: "800", color: "#2563EB" },
  studentMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  studentName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  rollNo: { fontSize: 11, color: "#64748B", marginTop: 2 },
  rollNoBold: { fontWeight: "700", color: "#0F172A" },
  email: { fontSize: 11, color: "#94A3B8", marginTop: 1 },
  emailButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 12 },

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
  modalCardContent: { padding: 28, alignItems: "center" },
  successBadgeContainer: { marginBottom: 16 },
  successBadgeIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2563EB" },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#1D4ED8", letterSpacing: 0.8 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 24 },
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
  modalButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});