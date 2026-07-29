import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSubjectsByCourse } from "../../api/subjectApi";

const { width } = Dimensions.get("window");

const getSubjectTheme = (subjectName) => {
  const name = subjectName.toLowerCase();

  if (name.includes("spring"))
    return {
      icon: "leaf",
      accent: "#10B981",
      gradient: ["#059669", "#34D399"],
      bg: "#ECFDF5",
    };
  if (name.includes("java"))
    return {
      icon: "cafe",
      accent: "#F97316",
      gradient: ["#EA580C", "#FB923C"],
      bg: "#FFF7ED",
    };
  if (name.includes("jpa") || name.includes("database") || name.includes("sql"))
    return {
      icon: "server",
      accent: "#3B82F6",
      gradient: ["#2563EB", "#60A5FA"],
      bg: "#EFF6FF",
    };
  if (name.includes("android") || name.includes("mobile") || name.includes("flutter"))
    return {
      icon: "phone-portrait",
      accent: "#06B6D4",
      gradient: ["#0891B2", "#22D3EE"],
      bg: "#ECFEFF",
    };
  if (name.includes("ui") || name.includes("ux") || name.includes("design"))
    return {
      icon: "color-palette",
      accent: "#8B5CF6",
      gradient: ["#7C3AED", "#A78BFA"],
      bg: "#F5F3FF",
    };
  if (name.includes("react") || name.includes("frontend"))
    return {
      icon: "logo-react",
      accent: "#0EA5E9",
      gradient: ["#0284C7", "#38BDF8"],
      bg: "#F0F9FF",
    };
  if (name.includes("web") || name.includes("html") || name.includes("css"))
    return {
      icon: "globe",
      accent: "#6366F1",
      gradient: ["#4F46E5", "#818CF8"],
      bg: "#EEF2FF",
    };

  return {
    icon: "code-slash",
    accent: Colors.primary || "#2563EB",
    gradient: ["#1D4ED8", "#3B82F6"],
    bg: "#EFF6FF",
  };
};

export default function SubjectScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentName, setStudentName] = useState("Developer");

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);

      if (!user) return;

      if (user.fullName) {
        setStudentName(user.fullName.split(" ")[0]);
      }

      const response = await getSubjectsByCourse(user.courseId);
      setSubjects(response.data.data || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubjects();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loadingText}>Loading Coding Modules...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Modern Dashboard Header with minimal top gap */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{studentName}'s Track</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="terminal-outline" size={24} color={Colors.primary || "#2563EB"} />
        </View>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.subjectId.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary || "#2563EB"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.bannerCard}>
            <LinearGradient
              colors={[Colors.primary || "#2563EB", "#1E1B4B"]}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerContent}>
                <View style={styles.badgeLabel}>
                  <Text style={styles.badgeLabelText}>ACTIVE CURRICULUM</Text>
                </View>
                <Text style={styles.bannerTitle}>Master Your Tech Stack</Text>
                <Text style={styles.bannerSubtitle}>
                  Select a module below to view assignments, track your submissions, and level up your skills.
                </Text>
              </View>
              <View style={styles.bannerIconFloat}>
                <Ionicons name="code-slash" size={70} color="rgba(255,255,255,0.12)" />
              </View>
            </LinearGradient>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="folder-open-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Subjects Found</Text>
            <Text style={styles.emptySubtitle}>
              Your assigned coding modules will show up here as soon as they are configured.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const theme = getSubjectTheme(item.subjectName);

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => {
                navigation.navigate("Assignments", {
                  subjectId: item.subjectId,
                  subjectName: item.subjectName,
                });
              }}
            >
              {/* Left Accent Bar */}
              <View style={[styles.cardLeftIndicator, { backgroundColor: theme.accent }]} />

              <View style={styles.cardInnerContent}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon} size={22} color={theme.accent} />
                  </View>
                  <View style={styles.moduleBadge}>
                    <Text style={[styles.moduleBadgeText, { color: theme.accent }]}>Module</Text>
                  </View>
                </View>

                <Text style={styles.subjectName} numberOfLines={1}>
                  {item.subjectName}
                </Text>

                <View style={styles.metaDivider} />

                <View style={styles.cardBottomRow}>
                  <View style={styles.metaInfo}>
                    <View style={styles.metaItem}>
                      <Ionicons name="school-outline" size={13} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.courseName}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-circle-outline" size={13} color="#64748B" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.facultyName}
                      </Text>
                    </View>
                  </View>

                  <LinearGradient
                    colors={theme.gradient}
                    style={styles.arrowButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  bannerCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerGradient: {
    padding: 22,
    position: "relative",
    overflow: "hidden",
  },
  bannerContent: {
    zIndex: 2,
  },
  badgeLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeLabelText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
    fontWeight: "500",
  },
  bannerIconFloat: {
    position: "absolute",
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLeftIndicator: {
    width: 6,
  },
  cardInnerContent: {
    flex: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleBadge: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  moduleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  subjectName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  metaDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaInfo: {
    flex: 1,
    marginRight: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 6,
    flex: 1,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
});