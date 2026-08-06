import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getStudentsByCourse } from "../../api/studentApi";
import { createAttendance } from "../../api/attendanceApi";

const todayISO = () => new Date().toISOString().split("T")[0];

/**
 * Helper function to detect subject type and return dynamic coding/tech icons and colors
 */
const getSubjectIconConfig = (subjectName = "") => {
  const name = subjectName.toLowerCase();

  if (name.includes("python")) return { icon: "logo-python", color: "#38BDF8", bg: "#F0F9FF" };
  if (name.includes("java") || name.includes("script") || name.includes("js"))
    return { icon: "logo-javascript", color: "#F59E0B", bg: "#FEF3C7" };
  if (name.includes("c++") || name.includes("c#") || name.includes("coding") || name.includes("program"))
    return { icon: "code-slash", color: "#6366F1", bg: "#EEF2FF" };
  if (name.includes("web") || name.includes("html") || name.includes("css") || name.includes("react"))
    return { icon: "globe-outline", color: "#0EA5E9", bg: "#E0F2FE" };
  if (name.includes("database") || name.includes("sql") || name.includes("data"))
    return { icon: "server-outline", color: "#8B5CF6", bg: "#F3E8FF" };
  if (name.includes("network") || name.includes("cloud") || name.includes("security"))
    return { icon: "terminal-outline", color: "#10B981", bg: "#D1FAE5" };
  if (name.includes("ai") || name.includes("machine") || name.includes("algo"))
    return { icon: "hardware-chip-outline", color: "#EC4899", bg: "#FCE7F3" };

  // Default tech/subject fallback
  return { icon: "code-working-outline", color: "#EF4444", bg: "#FEF2F2" };
};

export default function AttendanceScreen({ route }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ success: 0, failed: 0 });

  useFocusEffect(
    useCallback(() => {
      if (selectedSubject) {
        loadRoster(selectedSubject);
      } else {
        loadSubjects();
      }
    }, [selectedSubject])
  );

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const facultyId = parsedUser?.facultyId;
      if (!facultyId) return;

      const response = await getSubjectsByFaculty(facultyId);
      setSubjects(response.data?.data || response.data || []);
    } catch (error) {
      console.log("Error loading subjects:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoster = async (subject) => {
    setLoading(true);
    try {
      const response = await getStudentsByCourse(subject.courseId);
      const list = response.data?.data || response.data || [];
      setStudents(list);

      const defaults = {};
      list.forEach((s) => {
        defaults[s.studentId] = "PRESENT";
      });
      setStatusMap(defaults);
    } catch (error) {
      console.log("Error loading roster:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  const submitAttendance = async () => {
    if (!selectedSubject || students.length === 0) return;
    setSaving(true);

    const date = todayISO();
    const results = { success: 0, failed: 0 };

    for (const student of students) {
      try {
        await createAttendance({
          studentId: student.studentId,
          subjectId: selectedSubject.subjectId,
          status: statusMap[student.studentId] || "PRESENT",
          attendanceDate: date,
        });
        results.success += 1;
      } catch (error) {
        results.failed += 1;
        console.log(
          `Attendance failed for student ${student.studentId}:`,
          error.response?.data || error.message
        );
      }
    }

    setSaving(false);
    setModalData(results);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Fetching Records...</Text>
      </View>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                             SUBJECT SELECTION                              */
  /* -------------------------------------------------------------------------- */
  if (!selectedSubject) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.container}>
          {/* Top Banner Header */}
          <View style={styles.topHeroBanner}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="checkbox-outline" size={26} color="#EF4444" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.heroTitle}>Student Attendance</Text>
              <Text style={styles.heroSubtitle}>Select a subject to start roll call</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Assigned Subjects</Text>

          <FlatList
            data={subjects}
            keyExtractor={(item) => String(item.subjectId)}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const iconConfig = getSubjectIconConfig(item.subjectName);
              return (
                <TouchableOpacity
                  style={styles.subjectCard}
                  activeOpacity={0.75}
                  onPress={() => setSelectedSubject(item)}
                >
                  <View style={[styles.subjectIconBox, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon} size={22} color={iconConfig.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectCardTitle}>{item.subjectName}</Text>
                    <Text style={styles.subjectCardSub}>Tap to manage attendance</Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No subjects assigned to you yet</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                            STUDENT ROSTER SCREEN                           */
  /* -------------------------------------------------------------------------- */
  const presentCount = Object.values(statusMap).filter((s) => s === "PRESENT").length;
  const absentCount = students.length - presentCount;
  const activeSubjectConfig = getSubjectIconConfig(selectedSubject.subjectName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedSubject(null)}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.header} numberOfLines={1}>
              {selectedSubject.subjectName}
            </Text>
            <Text style={styles.subHeader}>Today • {todayISO()}</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: activeSubjectConfig.bg }]}>
            <Ionicons name={activeSubjectConfig.icon} size={18} color={activeSubjectConfig.color} />
          </View>
        </View>

        {/* Dynamic Counter Overview */}
        <View style={styles.statsOverviewCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#16A34A" }]}>{presentCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#EF4444" }]}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#0F172A" }]}>{students.length}</Text>
            <Text style={styles.statLabel}>Total Class</Text>
          </View>
        </View>

        {/* Student Roster List */}
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.studentId)}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = statusMap[item.studentId] || "PRESENT";
            const present = status === "PRESENT";
            return (
              <TouchableOpacity
                style={styles.studentRow}
                activeOpacity={0.8}
                onPress={() => toggleStatus(item.studentId)}
              >
                <View style={[styles.studentAvatarCircle, present ? styles.avatarPresent : styles.avatarAbsent]}>
                  <Text style={[styles.studentAvatarInitial, { color: present ? "#16A34A" : "#EF4444" }]}>
                    {item.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{item.fullName}</Text>
                  <Text style={styles.rollNo}>Roll No: {item.rollNo}</Text>
                </View>

                <View style={[styles.statusPill, present ? styles.pillPresent : styles.pillAbsent]}>
                  <Ionicons
                    name={present ? "checkmark-circle" : "close-circle"}
                    size={15}
                    color={present ? "#16A34A" : "#EF4444"}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={[styles.statusPillText, { color: present ? "#15803D" : "#B91C1C" }]}>
                    {present ? "Present" : "Absent"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No students enrolled in this course</Text>
            </View>
          }
        />

        {/* Floating Submit Action */}
        <TouchableOpacity
          style={[styles.submitButton, (saving || students.length === 0) && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          onPress={submitAttendance}
          disabled={saving || students.length === 0}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cloud-upload" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Modal Dialog */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconBox}>
                <Ionicons name="checkmark-done" size={32} color="#16A34A" />
              </View>
              <Text style={styles.modalTitle}>Attendance Recorded</Text>
              <Text style={styles.modalMessage}>
                <Text style={{ fontWeight: "700", color: "#0F172A" }}>{modalData.success}</Text> student
                {modalData.success === 1 ? "" : "s"} marked successfully
                {modalData.failed ? `, and ${modalData.failed} failed` : ""}.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                activeOpacity={0.85}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedSubject(null);
                }}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
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
  loadingText: { marginTop: 12, fontSize: 13, color: "#64748B", fontWeight: "600" },

  // Top Banner
  topHeroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  heroSubtitle: { fontSize: 12, color: "#64748B", fontWeight: "500", marginTop: 2 },
  sectionHeader: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 14 },

  // Subject Card List
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  subjectCardTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  subjectCardSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  // Navigation Header
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 6 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },
  headerBadge: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },

  // Stats Bar
  statsOverviewCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 19, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: "#F1F5F9" },

  // Roster Student Row
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  studentAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarPresent: { backgroundColor: "#DCFCE7" },
  avatarAbsent: { backgroundColor: "#FEE2E2" },
  studentAvatarInitial: { fontSize: 16, fontWeight: "800" },
  studentName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  rollNo: { fontSize: 12, color: "#64748B", marginTop: 2 },

  // Status Toggle Pills
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillPresent: { backgroundColor: "#DCFCE7" },
  pillAbsent: { backgroundColor: "#FEE2E2" },
  statusPillText: { fontSize: 12, fontWeight: "700" },

  // Submit Floating Button
  submitButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  // Empty State
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 12 },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 6, textAlign: "center" },
  modalMessage: { fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 20, lineHeight: 18 },
  modalButton: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});