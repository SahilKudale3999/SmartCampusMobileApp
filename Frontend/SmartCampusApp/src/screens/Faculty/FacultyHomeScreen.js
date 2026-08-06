import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";
import api from "../../api/axios";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function FacultyHomeScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const fetchDashboard = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      const facultyId = parsedUser.facultyId;

      if (!facultyId) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/faculty/dashboard/${facultyId}`);
      const data = response.data?.data || response.data;
      setDashboardData(data);
    } catch (error) {
      console.log("Error fetching faculty dashboard:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loaderText}>Loading your space...</Text>
      </View>
    );
  }

  const facultyName = dashboardData?.facultyName || "Faculty Member";
  const department = dashboardData?.department || "";
  const subjects = dashboardData?.subjects || [];
  const recentActivities = dashboardData?.recentActivities || [];

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
      {/* Hero Welcome Card Banner */}
      <LinearGradient
        colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
        style={styles.heroBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.greetingPill}>
            <Ionicons name="sunny-outline" size={14} color="#93C5FD" style={{ marginRight: 6 }} />
            <Text style={styles.greetingText}>{getGreeting()}</Text>
          </View>

          <Text style={styles.facultyNameText} numberOfLines={1}>
            {facultyName} ✨
          </Text>

          {department ? (
            <View style={styles.departmentPill}>
              <Ionicons name="school-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.departmentText}>{department}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      {/* My Courses / Subjects Card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => navigation.navigate("Subjects")}
        style={styles.cardContainer}
      >
        <View style={styles.subjectsCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="library" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.cardMainTitle}>Assigned Courses</Text>
                <Text style={styles.cardSubTitle}>Manage your classes & syllabi</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>

          {subjects.length === 0 ? (
            <Text style={styles.emptyText}>No courses assigned yet</Text>
          ) : (
            <View style={styles.courseScrollWrapper}>
              <Text style={styles.courseBigCount}>{dashboardData?.subjectCount || subjects.length} Active Courses</Text>
              <View style={styles.chipsContainer}>
                {subjects.map((subject, index) => (
                  <View key={subject.subjectId || index} style={styles.courseChip}>
                    <Ionicons name="book-outline" size={12} color="#2563EB" style={{ marginRight: 5 }} />
                    <Text style={styles.courseChipText} numberOfLines={1}>
                      {subject.subjectName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Overview Grid Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
      </View>
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statBox, { borderColor: "#BFDBFE" }]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Students")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="people" size={22} color="#2563EB" />
          </View>
          <Text style={styles.statNumber}>{dashboardData?.studentCount || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
          <View style={styles.statLinkRow}>
            <Text style={[styles.statLinkText, { color: "#2563EB" }]}>View roster</Text>
            <Ionicons name="arrow-forward" size={11} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statBox, { borderColor: "#FDE68A" }]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Assignments")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="document-text" size={22} color="#D97706" />
          </View>
          <Text style={styles.statNumber}>{dashboardData?.assignmentCount || 0}</Text>
          <Text style={styles.statLabel}>Assignments</Text>
          <View style={styles.statLinkRow}>
            <Text style={[styles.statLinkText, { color: "#D97706" }]}>Create & manage</Text>
            <Ionicons name="arrow-forward" size={11} color="#D97706" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statBox, { borderColor: "#E9D5FF" }]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Grades")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="ribbon" size={22} color="#9333EA" />
          </View>
          <Text style={styles.statNumber}>{dashboardData?.pendingReviews || 0}</Text>
          <Text style={styles.statLabel}>Grading Queue</Text>
          <View style={styles.statLinkRow}>
            <Text style={[styles.statLinkText, { color: "#9333EA" }]}>Review items</Text>
            <Ionicons name="arrow-forward" size={11} color="#9333EA" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statBox, { borderColor: "#FECACA" }]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Attendance")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="checkmark-done-circle" size={22} color="#EF4444" />
          </View>
          <Text style={styles.statNumber}>{dashboardData?.attendancePending || 0}</Text>
          <Text style={styles.statLabel}>Attendance Due</Text>
          <View style={styles.statLinkRow}>
            <Text style={[styles.statLinkText, { color: "#EF4444" }]}>Take sheet</Text>
            <Ionicons name="arrow-forward" size={11} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Log */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
      </View>
      <View style={styles.activityBox}>
        {recentActivities.length === 0 ? (
          <View style={styles.emptyActivityView}>
            <Ionicons name="pulse-outline" size={24} color="#CBD5E1" />
            <Text style={styles.emptyActivityString}>No recent activity logs recorded</Text>
          </View>
        ) : (
          recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityRow}>
              <View style={styles.activityIconCircle}>
                <Ionicons name="flash" size={14} color="#2563EB" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityHeaderTitle}>{activity.title || activity.type || "Activity"}</Text>
                <Text style={styles.activityHeaderSub} numberOfLines={1}>
                  {activity.description || activity.message || "System update"}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  heroBanner: {
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heroContent: {
    alignItems: "center",
  },
  greetingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  greetingText: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  facultyNameText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  departmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  departmentText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cardContainer: {
    marginBottom: 20,
  },
  subjectsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardMainTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardSubTitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
  },
  courseScrollWrapper: {
    marginTop: 4,
  },
  courseBigCount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  courseChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    maxWidth: "48%",
  },
  courseChipText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
    marginTop: 2,
  },
  statLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  statLinkText: {
    fontSize: 11,
    fontWeight: "800",
  },
  activityBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityHeaderTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  activityHeaderSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  emptyActivityView: {
    alignItems: "center",
    paddingVertical: 22,
  },
  emptyActivityString: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
});