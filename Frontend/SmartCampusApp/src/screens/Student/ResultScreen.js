import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/axios";

// Helper function for performance badges with modern styling
const getPerformanceBadge = (score) => {
  if (score === undefined || score === null || isNaN(score)) {
    return { label: "Awaiting Evaluation ⏳", color: "#64748B", bgColor: "#F1F5F9", icon: "time-outline" };
  }
  if (score >= 9.0) {
    return { label: "Outstanding 🌟", color: "#059669", bgColor: "#ECFDF5", icon: "trophy-outline" };
  } else if (score >= 8.0) {
    return { label: "Excellent 🎯", color: "#2563EB", bgColor: "#EFF6FF", icon: "ribbon-outline" };
  } else if (score >= 7.0) {
    return { label: "Very Good 👍", color: "#0284C7", bgColor: "#F0F9FF", icon: "thumbs-up-outline" };
  } else if (score >= 5.0) {
    return { label: "Good Effort 💪", color: "#D97706", bgColor: "#FFFBEB", icon: "shield-outline" };
  } else {
    return { label: "Needs Focus 📖", color: "#DC2626", bgColor: "#FEF2F2", icon: "alert-circle-outline" };
  }
};

export default function ResultScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      const studentId = parsedUser?.studentId || parsedUser?.id;

      if (studentId) {
        const response = await api.get(`/submissions/student/${studentId}`);
        const data = response.data?.data || response.data || [];
        setResults(data);
      }
    } catch (error) {
      console.error("Error fetching results:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  // Safe Extraction & Computation of Marks & GPA
  const validScores = results.filter((r) => {
    const score = r.gradeScore ?? r.grade_score ?? r.score ?? r.marks;
    return score !== null && score !== undefined && score !== "" && !isNaN(score);
  });

  const totalScored = validScores.reduce((acc, curr) => {
    const score = Number(curr.gradeScore ?? curr.grade_score ?? curr.score ?? curr.marks);
    return acc + score;
  }, 0);

  const overallGPA = validScores.length > 0 ? (totalScored / validScores.length).toFixed(1) : "0.0";

  const renderSubjectCard = ({ item }) => {
    const rawScore = item.gradeScore ?? item.grade_score ?? item.score ?? item.marks ?? item.obtained_marks;
    const scoreVal = rawScore !== null && rawScore !== undefined && rawScore !== "" && !isNaN(rawScore) ? Number(rawScore) : null;
    const badge = getPerformanceBadge(scoreVal);

    // Support fallback text mapping for title depending on backend DTO structure
    const displayTitle = item.assignmentTitle || item.title || item.assignment?.title || item.subjectName || "Assignment Submission";

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.assignmentTag}>
            <Ionicons name="document-text" size={12} color="#2563EB" />
            <Text style={styles.assignmentTagText}>
              Assignment #{item.assignmentId || item.assignment_id || item.assignment?.id || "N/A"}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {item.submittedAt || item.submitted_at ? new Date(item.submittedAt || item.submitted_at).toLocaleDateString() : "Recent"}
          </Text>
        </View>

        <Text style={styles.subjectName}>{displayTitle}</Text>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottomRow}>
          {/* Status / Badge */}
          <View style={[styles.badge, { backgroundColor: badge.bgColor }]}>
            <Ionicons name={badge.icon} size={14} color={badge.color} style={{ marginRight: 6 }} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          {/* Score Box */}
          <View style={styles.scoreBox}>
            {scoreVal !== null ? (
              <View style={styles.scoreRow}>
                <Text style={styles.scoredVal}>{scoreVal}</Text>
                <Text style={styles.totalVal}>/10</Text>
              </View>
            ) : (
              <Text style={styles.pendingText}>Pending</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Modern High-End Deep Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Academic Results</Text>
          <Text style={styles.headerSub}>Track your performance & grades</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your academic records...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="ribbon-outline" size={48} color="#2563EB" />
          </View>
          <Text style={styles.emptyTitle}>No Submissions Found</Text>
          <Text style={styles.emptySubtitle}>
            You haven't submitted any assignments yet or evaluations are pending.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.submissionId?.toString() || item.submission_id?.toString() || index.toString()}
          renderItem={renderSubjectCard}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
          }
          ListHeaderComponent={
            /* Impressive Gradient-Style Blue Summary Banner */
            <View style={styles.summaryCard}>
              <View style={styles.summaryGlowCircle} />
              <View style={styles.summaryTextContainer}>
                <View style={styles.summaryBadgeWrapper}>
                  <Text style={styles.summaryBadgeText}>SEMESTER SUMMARY</Text>
                </View>
                <Text style={styles.summaryLabel}>Overall Performance</Text>
                <Text style={styles.summarySub}>Based on {validScores.length} evaluated submissions</Text>
              </View>
              <View style={styles.gpaCircle}>
                <Text style={styles.gpaVal}>{overallGPA}</Text>
                <Text style={styles.gpaMax}>/10 GPA</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#1E40AF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "#93C5FD",
    marginTop: 1,
    fontWeight: "500",
  },
  listPadding: {
    padding: 16,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  summaryGlowCircle: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  summaryTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  summaryBadgeWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  summaryBadgeText: {
    color: "#E0F2FE",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  summarySub: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  gpaCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  gpaVal: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  gpaMax: {
    color: "#E0F2FE",
    fontSize: 10,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assignmentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  assignmentTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scoreBox: {
    alignItems: "flex-end",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F8FAFC",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scoredVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E293B",
  },
  totalVal: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  pendingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
});