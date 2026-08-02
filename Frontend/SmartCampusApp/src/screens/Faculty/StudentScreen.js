import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getStudentsByCourse } from "../../api/studentApi";

export default function StudentsScreen({ route }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setStudents(response.data?.data || response.data || []);
    } catch (error) {
      console.log("Error loading roster:", error.response?.data || error.message);
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
      <Text style={styles.header}>{selectedSubject.subjectName} Roster</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => String(item.studentId)}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {item.fullName?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.fullName}</Text>
              <Text style={styles.rollNo}>Roll No: {item.rollNo}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => Linking.openURL(`mailto:${item.email}`)}
            >
              <Ionicons name="mail-outline" size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No students in this course</Text>}
      />
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
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitial: { fontSize: 16, fontWeight: "800", color: "#2563EB" },
  studentName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  rollNo: { fontSize: 11, color: "#64748B", marginTop: 2 },
  email: { fontSize: 11, color: "#94A3B8", marginTop: 1 },
  emailButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 30 },
});