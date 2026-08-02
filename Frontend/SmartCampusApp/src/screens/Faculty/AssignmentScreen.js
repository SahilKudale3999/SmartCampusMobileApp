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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getAssignmentsBySubject, createAssignment } from "../../api/assignmentApi";

const todayISO = () => new Date().toISOString().split("T")[0];

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
        deadline, // expects "YYYY-MM-DD"
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
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  if (!selectedSubject) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Subject</Text>
        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.subjectId)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subjectRow}
              onPress={() => setSelectedSubject(item)}
            >
              <Ionicons name="book-outline" size={18} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.subjectRowText}>{item.subjectName}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No subjects assigned</Text>}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{selectedSubject.subjectName} Assignments</Text>

      <FlatList
        data={assignments}
        keyExtractor={(item) => String(item.assignmentId)}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.assignmentCard}>
            <View style={styles.assignmentIconBg}>
              <Ionicons name="document-text" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignmentTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.assignmentDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={styles.assignmentDeadline}>Due: {item.deadline}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No assignments yet</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={26} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Assignment</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Chapter 4 Homework"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional details"
              multiline
            />

            <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="2026-08-15"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F1F5F9" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#0F172A", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2563EB" }]}
                onPress={handleCreateAssignment}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 20, paddingTop: 50 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 16 },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  subjectRowText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#0F172A" },
  assignmentCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  assignmentIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assignmentTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  assignmentDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
  assignmentDeadline: { fontSize: 11, color: "#EF4444", fontWeight: "700", marginTop: 6 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 30 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20 },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 10,
  },
});