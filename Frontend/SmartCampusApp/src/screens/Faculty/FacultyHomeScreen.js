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

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("token");

              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.log("Error during logout:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loaderText}>Loading dashboard...</Text>
      </View>
    );
  }

  const facultyName = dashboardData?.facultyName || "Faculty";
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

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* My Subjects Hero Card with Gradient */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("Subjects")}>
        <LinearGradient
          colors={[Colors.primary || "#2563EB", "#1D4ED8"]}
          style={styles.subjectsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.subjectsHeader}>
            <View style={styles.subjectsTitleRow}>
              <Ionicons name="library" size={18} color="#93C5FD" style={{ marginRight: 8 }} />
              <Text style={styles.subjectsTitle}>My Subjects</Text>
            </View>
            <Ionicons name="chevron-forward-circle" size={22} color="#FFF" />
          </View>

          {subjects.length === 0 ? (
            <Text style={styles.noSubjectsText}>No subjects assigned yet</Text>
          ) : (
            <>
              <Text style={styles.subjectCount}>{dashboardData?.subjectCount || subjects.length}</Text>
              <Text style={styles.subjectCountLabel}>
                {(dashboardData?.subjectCount || subjects.length) === 1 ? "Subject Assigned" : "Subjects Assigned"}
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
        </LinearGradient>
      </TouchableOpacity>

      {/* Summary Cards Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Overview</Text>
      </View>
      <View style={styles.summaryGrid}>
        <TouchableOpacity
          style={styles.summaryCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Students")}
        >
          <View style={[styles.summaryIconBg, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="people" size={20} color="#2563EB" />
          </View>
          <Text style={styles.summaryValue}>{dashboardData?.studentCount || 0}</Text>
          <Text style={styles.summaryLabel}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.summaryCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Assignments")}
        >
          <View style={[styles.summaryIconBg, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="document-text" size={20} color="#D97706" />
          </View>
          <Text style={styles.summaryValue}>{dashboardData?.assignmentCount || 0}</Text>
          <Text style={styles.summaryLabel}>Assignments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.summaryCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Grades")}
        >
          <View style={[styles.summaryIconBg, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="time" size={20} color="#9333EA" />
          </View>
          <Text style={styles.summaryValue}>{dashboardData?.pendingReviews || 0}</Text>
          <Text style={styles.summaryLabel}>Pending Reviews</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.summaryCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Attendance")}
        >
          <View style={[styles.summaryIconBg, { backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="calendar" size={20} color="#EF4444" />
          </View>
          <Text style={styles.summaryValue}>{dashboardData?.attendancePending || 0}</Text>
          <Text style={styles.summaryLabel}>Attendance Pending</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Attendance")}
        >
          <View style={[styles.actionIconBg, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="checkmark-done" size={24} color="#2563EB" />
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
            <Ionicons name="people" size={24} color="#16A34A" />
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
            <Ionicons name="document-text" size={24} color="#D97706" />
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
            <Ionicons name="ribbon" size={24} color="#9333EA" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionText}>Grade Submissions</Text>
            <Text style={styles.actionSubText}>Review student work</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {/* Recent Activities Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
      </View>
      <View style={styles.activitiesContainer}>
        {recentActivities.length === 0 ? (
          <View style={styles.emptyActivityCard}>
            <Ionicons name="pulse-outline" size={24} color="#94A3B8" />
            <Text style={styles.emptyActivityText}>No recent activities found</Text>
          </View>
        ) : (
          recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIconCircle}>
                <Ionicons name="flash-outline" size={16} color="#2563EB" />
              </View>
              <View style={styles.activityContentWrapper}>
                <Text style={styles.activityTitle}>{activity.title || activity.type || "Activity"}</Text>
                <Text style={styles.activityDescription} numberOfLines={1}>
                  {activity.description || activity.message || "New update recorded"}
                </Text>
              </View>
            </View>
          ))
        )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "600",
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  subjectsCard: {
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
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  summaryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: {
    fontWeight: "800",
    fontSize: 13,
    color: "#0F172A",
  },
  actionSubText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
  activitiesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
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
  activityContentWrapper: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  activityDescription: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  emptyActivityCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyActivityText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
});