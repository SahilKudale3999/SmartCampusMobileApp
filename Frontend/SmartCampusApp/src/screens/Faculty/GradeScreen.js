import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getAssignmentsBySubject } from "../../api/assignmentApi";
import { getSubmissionsByAssignment, gradeSubmission } from "../../api/submissionApi";

export default function GradesScreen({ route }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({}); // submissionId -> string
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (selectedAssignment) {
        loadSubmissions(selectedAssignment);
      } else if (selectedSubject) {
        loadAssignments(selectedSubject);
      } else {
        loadSubjects();
      }
    }, [selectedSubject, selectedAssignment])
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

  const loadSubmissions = async (assignment) => {
    setLoading(true);
    try {
      const response = await getSubmissionsByAssignment(assignment.assignmentId);
      const list = response.data?.data || response.data || [];
      setSubmissions(list);

      const inputs = {};
      list.forEach((s) => {
        inputs[s.submissionId] = s.gradeScore != null ? String(s.gradeScore) : "";
      });
      setGradeInputs(inputs);
    } catch (error) {
      console.log("Error loading submissions:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitGrade = async (submissionId) => {
    const value = gradeInputs[submissionId];
    if (value === undefined || value === "" || isNaN(Number(value))) {
      Alert.alert("Invalid grade", "Please enter a numeric grade.");
      return;
    }
    setSavingId(submissionId);
    try {
      await gradeSubmission(submissionId, Number(value));
      Alert.alert("Saved", "Grade updated.");
    } catch (error) {
      console.log("Error grading submission:", error.response?.data || error.message);
      Alert.alert("Error", "Could not save grade. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  // Step 1: subject picker
  if (!selectedSubject) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Subject</Text>
        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.subjectId)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.rowCard} onPress={() => setSelectedSubject(item)}>
              <Ionicons name="book-outline" size={18} color="#2563EB" style={{ marginRight: 10 }} />
              <Text style={styles.rowText}>{item.subjectName}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No subjects assigned</Text>}
        />
      </View>
    );
  }

  // Step 2: assignment picker
  if (!selectedAssignment) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setSelectedSubject(null)}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={[styles.header, { marginLeft: 10 }]}>
            {selectedSubject.subjectName} Assignments
          </Text>
        </View>
        <FlatList
          data={assignments}
          keyExtractor={(item) => String(item.assignmentId)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.rowCard} onPress={() => setSelectedAssignment(item)}>
              <Ionicons name="document-text-outline" size={18} color="#D97706" style={{ marginRight: 10 }} />
              <Text style={styles.rowText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No assignments yet</Text>}
        />
      </View>
    );
  }

  // Step 3: submissions + grading
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setSelectedAssignment(null)}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={[styles.header, { marginLeft: 10 }]} numberOfLines={1}>
          {selectedAssignment.title}
        </Text>
      </View>

      <FlatList
        data={submissions}
        keyExtractor={(item) => String(item.submissionId)}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.submissionCard}>
            <View style={styles.submissionTopRow}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              {item.fileUrl ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)}>
                  <Ionicons name="document-attach-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.gradeRow}>
              <TextInput
                style={styles.gradeInput}
                keyboardType="numeric"
                placeholder="Grade"
                value={gradeInputs[item.submissionId]}
                onChangeText={(text) =>
                  setGradeInputs((prev) => ({ ...prev, [item.submissionId]: text }))
                }
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => submitGrade(item.submissionId)}
                disabled={savingId === item.submissionId}
              >
                {savingId === item.submissionId ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No submissions yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 20, paddingTop: 50 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 16, flexShrink: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  rowText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#0F172A" },
  submissionCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  submissionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  gradeRow: { flexDirection: "row", marginTop: 10 },
  gradeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#9333EA",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 30 },
});