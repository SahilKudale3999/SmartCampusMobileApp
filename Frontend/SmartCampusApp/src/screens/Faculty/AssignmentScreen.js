import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getAssignmentsBySubject, createAssignment } from "../../api/assignmentApi";

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
  return { icon: "document-text-outline", color: "#D97706", bg: "#FEF3C7" };
};

export default function AssignmentsScreen({ route }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (selectedSubject) {
        loadAssignments(selectedSubject);
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

  const loadAssignments = async (subject) => {
    setLoading(true);
    try {
      const response = await getAssignmentsBySubject(subject.subjectId);
      setAssignments(response.data?.data || response.data || []);
    } catch (error) {
      console.log("Error loading assignments:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setDeadline(todayISO());
    setModalVisible(true);
  };

  const handleCreateAssignment = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter an assignment title.");
      return;
    }
    setSaving(true);
    try {
      await createAssignment({
        subjectId: selectedSubject.subjectId,
        title: title.trim(),
        description: description.trim(),
        deadline,
      });
      setModalVisible(false);
      loadAssignments(selectedSubject);
    } catch (error) {
      console.log("Error creating assignment:", error.response?.data || error.message);
      Alert.alert("Error", "Could not create assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Fetching Coursework...</Text>
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
          {/* Top Hero Banner */}
          <View style={styles.topHeroBanner}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="journal-outline" size={26} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.heroTitle}>Manage Assignments</Text>
              <Text style={styles.heroSubtitle}>Choose a subject to review or create tasks</Text>
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
                    <Text style={styles.subjectCardSub}>Tap to view coursework & tasks</Text>
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
  /*                           ASSIGNMENTS LIST SCREEN                           */
  /* -------------------------------------------------------------------------- */
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
            <Text style={styles.subHeader}>Active Course Tasks ({assignments.length})</Text>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: activeSubjectConfig.bg }]}>
            <Ionicons name={activeSubjectConfig.icon} size={18} color={activeSubjectConfig.color} />
          </View>
        </View>

        {/* Assignments List */}
        <FlatList
          data={assignments}
          keyExtractor={(item) => String(item.assignmentId)}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.assignmentCard}>
              <View style={styles.assignmentHeaderRow}>
                <View style={[styles.assignmentIconBg, { backgroundColor: activeSubjectConfig.bg }]}>
                  <Ionicons name={activeSubjectConfig.icon} size={18} color={activeSubjectConfig.color} />
                </View>
                <View style={styles.deadlineBadge}>
                  <Ionicons name="time-outline" size={13} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text style={styles.assignmentDeadline}>Due: {item.deadline}</Text>
                </View>
              </View>

              <Text style={styles.assignmentTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.assignmentDesc} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No assignments created yet</Text>
              <Text style={styles.emptySubText}>Tap the + button below to publish your first assignment</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={openCreateModal}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Create Assignment Sheet Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>New Assignment</Text>

              <Text style={styles.label}>Assignment Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Practical Lab 04 - Arrays & Pointer Logic"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 95, textAlignVertical: "top" }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add instructions or repository links for students..."
                placeholderTextColor="#94A3B8"
                multiline
              />

              <Text style={styles.label}>Deadline</Text>
              <View style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.dateInput}
                  value={deadline}
                  onChangeText={setDeadline}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateAssignment} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Publish Task</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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
    backgroundColor: "#FEF3C7",
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
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 18, marginTop: 6 },
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

  // Assignment Cards
  assignmentCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  assignmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assignmentIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  assignmentDeadline: { fontSize: 11, color: "#B91C1C", fontWeight: "700" },
  assignmentTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  assignmentDesc: { fontSize: 13, color: "#64748B", lineHeight: 19 },

  // FAB Floating Button
  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#D97706",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // Empty State
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { color: "#0F172A", fontSize: 15, fontWeight: "700", textAlign: "center", marginTop: 12 },
  emptySubText: { color: "#94A3B8", fontSize: 12, textAlign: "center", marginTop: 4, paddingHorizontal: 40 },

  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: "800", color: "#0F172A", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 13,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
  },
  dateInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#0F172A" },
  modalActions: { flexDirection: "row", marginTop: 24, gap: 12 },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { color: "#0F172A", fontWeight: "700", fontSize: 14 },
  createButton: {
    flex: 1.5,
    backgroundColor: "#D97706",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  createButtonText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});