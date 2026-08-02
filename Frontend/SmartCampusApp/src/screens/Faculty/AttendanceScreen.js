import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getStudentsByCourse } from "../../api/studentApi";
import { createAttendance } from "../../api/attendanceApi";

const todayISO = () => new Date().toISOString().split("T")[0];

export default function AttendanceScreen({ route, navigation }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // studentId -> "PRESENT" | "ABSENT"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      // Default everyone to PRESENT; faculty can flip individuals to ABSENT.
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

    // No bulk endpoint exists on the backend -- one POST /attendance call
    // per student, run sequentially to avoid overwhelming the server.
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
    Alert.alert(
      "Attendance Submitted",
      `${results.success} marked successfully${
        results.failed ? `, ${results.failed} failed` : ""
      }.`
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  // Step 1: no subject chosen yet -- show subject picker
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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects assigned</Text>
          }
        />
      </View>
    );
  }

  // Step 2: mark attendance for the selected subject's roster
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setSelectedSubject(null)}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.header}>{selectedSubject.subjectName}</Text>
          <Text style={styles.subHeader}>{todayISO()}</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.studentId)}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const status = statusMap[item.studentId] || "PRESENT";
          const present = status === "PRESENT";
          return (
            <TouchableOpacity
              style={styles.studentRow}
              activeOpacity={0.8}
              onPress={() => toggleStatus(item.studentId)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.fullName}</Text>
                <Text style={styles.rollNo}>Roll No: {item.rollNo}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: present ? "#F0FDF4" : "#FEF2F2" },
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    { color: present ? "#16A34A" : "#EF4444" },
                  ]}
                >
                  {present ? "Present" : "Absent"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students in this course</Text>
        }
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitAttendance}
        disabled={saving || students.length === 0}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 20, paddingTop: 50 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
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
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  studentName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  rollNo: { fontSize: 11, color: "#64748B", marginTop: 2 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusPillText: { fontSize: 12, fontWeight: "800" },
  submitButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 30 },
});