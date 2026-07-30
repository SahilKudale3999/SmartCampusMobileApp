import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import api from "../../api/axios";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function FacultyHomeScreen({ navigation }) {
  const [facultyName, setFacultyName] = useState("Faculty");
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserAndSubjects();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAndSubjects();
    setRefreshing(false);
  };

  const loadUserAndSubjects = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      setFacultyName(parsedUser.fullName || "Faculty");
      setDepartment(parsedUser.department || "");
      setFacultyId(parsedUser.facultyId || null);

      if (parsedUser?.facultyId) {
        await loadSubjects(parsedUser.facultyId);
      } else {
        setLoadingSubjects(false);
      }
    } catch (error) {
      console.log("Error loading faculty user data:", error.response?.data || error.message);
      setLoadingSubjects(false);
    }
  };

  const loadSubjects = async (id) => {
    setLoadingSubjects(true);
    try {
      const response = await api.get(`/subject/faculty/${id}`);
      const subjectList = response.data?.data || response.data || [];
      setSubjects(subjectList);
    } catch (error) {
      console.log("Error loading faculty subjects:", error.response?.data || error.message);
    } finally {
      setLoadingSubjects(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary || "#2563EB"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>{facultyName} 👋</Text>
          {department ? (
            <View style={styles.deptBadge}>
              <Ionicons name="school-outline" size={12} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.deptBadgeText}>{department}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* My Subjects Hero Card */}
      <View style={styles.subjectsCard}>
        <View style={styles.subjectsHeader}>
          <View style={styles.subjectsTitleRow}>
            <Ionicons name="library" size={18} color="#93C5FD" style={{ marginRight: 8 }} />
            <Text style={styles.subjectsTitle}>My Subjects</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={22} color="#FFF" />
        </View>

        {loadingSubjects ? (
          <ActivityIndicator color="#FFF" style={{ marginVertical: 20 }} />
        ) : subjects.length === 0 ? (
          <Text style={styles.noSubjectsText}>No subjects assigned yet</Text>
        ) : (
          <>
            <Text style={styles.subjectCount}>{subjects.length}</Text>
            <Text style={styles.subjectCountLabel}>
              {subjects.length === 1 ? "Subject Assigned" : "Subjects Assigned"}
            </Text>

            <View style={styles.subjectChipsRow}>
              {subjects.slice(0, 4).map((subject, index) => (
                <View key={subject.subjectId || index} style={styles.subjectChip}>
                  <Text style={styles.subjectChipText} numberOfLines={1}>
                    {subject.subjectName}
                  </Text>
                </View>
              ))}
              {subjects.length > 4 && (
                <View style={styles.subjectChip}>
                  <Text style={styles.subjectChipText}>+{subjects.length - 4} more</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Quick Access Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
      </View>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Attendance")}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="checkmark-done" size={26} color="#2563EB" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionText}>Take Attendance</Text>
            <Text style={styles.actionSubText}>Mark today's class</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#16A34A" }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Students")}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="people" size={26} color="#16A34A" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionText}>Students</Text>
            <Text style={styles.actionSubText}>Directory & contact</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#D97706" }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Assignments")}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="document-text" size={26} color="#D97706" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionText}>Assignments</Text>
            <Text style={styles.actionSubText}>Create & manage</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#9333EA" }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Grades")}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="ribbon" size={26} color="#9333EA" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionText}>Grades</Text>
            <Text style={styles.actionSubText}>Review submissions</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 35 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  greeting: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  deptBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  subjectsCard: {
    backgroundColor: Colors.primary || "#2563EB",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  subjectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectsTitle: {
    color: "#DBEAFE",
    fontSize: 15,
    fontWeight: "700",
  },
  noSubjectsText: {
    color: "#DBEAFE",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
  },
  subjectCount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    marginTop: 12,
  },
  subjectCountLabel: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 14,
  },
  subjectChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectChip: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: "48%",
  },
  subjectChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderLeftWidth: 4,
    flexDirection: "row",
  },
  actionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: {
    fontWeight: "800",
    fontSize: 14,
    color: "#0F172A",
  },
  actionSubText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
});