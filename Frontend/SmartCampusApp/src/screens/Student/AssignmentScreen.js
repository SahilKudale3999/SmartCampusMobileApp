import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { getAssignmentsBySubject } from "../../api/assignmentApi";
import Colors from "../../constants/Colors";

const getSubjectIcon = (subjectName = "") => {
  const name = subjectName.toLowerCase();

  const iconMap = [
    { keywords: ["python"], icon: "language-python", color: "#3776AB" },
    { keywords: ["javascript", "js"], icon: "language-javascript", color: "#F7DF1E" },
    { keywords: ["typescript"], icon: "language-typescript", color: "#3178C6" },
    { keywords: ["spring"], icon: "leaf", color: "#6DB33F" },
    { keywords: ["java"], icon: "language-java", color: "#E76F00" },
    { keywords: ["react"], icon: "react", color: "#61DAFB" },
    { keywords: ["android"], icon: "android", color: "#3DDC84" },
    { keywords: ["database", "sql", "dbms", "jpa"], icon: "database", color: "#1565C0" },
    { keywords: ["ui", "ux"], icon: "palette", color: "#EC4899" },
  ];

  for (const item of iconMap) {
    if (item.keywords.some((k) => name.includes(k))) {
      return item;
    }
  }

  return {
    icon: "book-open-page-variant",
    color: Colors.primary,
  };
};

export default function AssignmentScreen({ route, navigation }) {
  const subjectId = route?.params?.subjectId;
  const subjectName = route?.params?.subjectName || "Assignments";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      console.log("No subjectId received");
      navigation.goBack();
      return;
    }

    loadAssignments();
  }, [subjectId]);

  const loadAssignments = async () => {
    try {
      const response = await getAssignmentsBySubject(subjectId);
      console.log("Assignment Response", response.data);
      setAssignments(response.data?.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const formatDeadline = (date) => {
    if (!date) return "No Deadline";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (date) => {
    if (!date) return false;

    const deadline = new Date(date);
    deadline.setHours(23, 59, 59, 999);

    return deadline < new Date();
  };

  const handleNavigateToSubmit = (assignment) => {
    if (navigation?.navigate) {
      try {
        navigation.navigate("SubmitAssignment", {
          assignmentId: assignment.assignmentId,
          title: assignment.title,
          subjectName: assignment.subjectName || subjectName,
          deadline: assignment.deadline,
        });
      } catch (err) {
        navigation.getParent()?.navigate("SubmitAssignment", {
          assignmentId: assignment.assignmentId,
          title: assignment.title,
          subjectName: assignment.subjectName || subjectName,
          deadline: assignment.deadline,
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching missions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Cinematic Deep Blue Header Banner */}
      <LinearGradient
        colors={["#0F172A", "#1E3A8A", "#2563EB"]}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
          <View style={styles.floatingBubbleOne} />
          <View style={styles.floatingBubbleTwo} />

          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTopTitle}>Campus Portal</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="folder-open-outline" size={14} color="#93C5FD" />
              <Text style={styles.heroBadgeText}>Assignments Vault</Text>
            </View>
            <Text style={styles.heroMainTitle} numberOfLines={1}>{subjectName}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main List Area */}
      <FlatList
        data={assignments}
        keyExtractor={(item, index) => item.assignmentId?.toString() || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="documents-outline" size={48} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>All Clear! 🎉</Text>
            <Text style={styles.emptySubtitle}>
              Your faculty hasn't uploaded any assignments for this subject yet.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const icon = getSubjectIcon(item.subjectName || subjectName);
          const overdue = isOverdue(item.deadline);

          return (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.9}
              onPress={() => handleNavigateToSubmit(item)}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: icon.color + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon.icon}
                    size={22}
                    color={icon.color}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.subjectTag}>
                    {item.subjectName || subjectName}
                  </Text>
                </View>

                {overdue ? (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                  </View>
                ) : (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>PENDING</Text>
                  </View>
                )}
              </View>

              {item.description ? (
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.bottomRow}>
                <View style={styles.dateContainer}>
                  <View style={[styles.deadlineIconBox, overdue && styles.overdueIconBox]}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={overdue ? "#DC2626" : "#2563EB"}
                    />
                  </View>
                  <Text style={[styles.dateText, overdue && styles.overdueDateText]}>
                    Due: <Text style={styles.dateBold}>{formatDeadline(item.deadline)}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, overdue && styles.disabledSubmitBtn]}
                  onPress={() => handleNavigateToSubmit(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>Submit</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  heroSection: {
    width: "100%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
    paddingBottom: 28,
  },
  safeAreaHeader: {
    paddingHorizontal: 20,
  },
  floatingBubbleOne: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: -20,
    left: -30,
  },
  floatingBubbleTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    bottom: -30,
    right: -40,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTopTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroContent: {
    paddingHorizontal: 4,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 22,
  },
  subjectTag: {
    marginTop: 4,
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 14,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deadlineIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  overdueIconBox: {
    backgroundColor: "#FEE2E2",
  },
  dateText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },
  dateBold: {
    fontWeight: "700",
    color: "#0F172A",
  },
  overdueDateText: {
    color: "#DC2626",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledSubmitBtn: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  overdueBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  overdueBadgeText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "800",
  },
  activeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  activeBadgeText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});