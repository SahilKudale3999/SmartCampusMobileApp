import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";

const SUBJECT_STYLES = [
  { 
    bgGradient: ["#EFF6FF", "#DBEAFE"], 
    border: "#93C5FD", 
    accent: "#2563EB", 
    badgeBg: "#BFDBFE",
    icon: "book-outline" 
  },
  { 
    bgGradient: ["#F0FDF4", "#DCFCE7"], 
    border: "#86EFAC", 
    accent: "#16A34A", 
    badgeBg: "#BBF7D0",
    icon: "code-slash-outline" 
  },
  { 
    bgGradient: ["#F3E8FF", "#E9D5FF"], 
    border: "#D8B4FE", 
    accent: "#9333EA", 
    badgeBg: "#E9D5FF",
    icon: "flask-outline" 
  },
  { 
    bgGradient: ["#FEF3C7", "#FDE68A"], 
    border: "#FCD34D", 
    accent: "#D97706", 
    badgeBg: "#FDE68A",
    icon: "stats-chart-outline" 
  },
];

export default function SubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  const fetchSubjects = async () => {
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

      const response = await getSubjectsByFaculty(facultyId);
      const data = response.data?.data || response.data || [];
      setSubjects(data);
    } catch (error) {
      console.log("Error fetching subjects:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  };

  const openSubjectActions = (subject) => {
    navigation.navigate("Assignments", { subject });
  };

  const renderItem = ({ item, index }) => {
    const styleObj = SUBJECT_STYLES[index % SUBJECT_STYLES.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: styleObj.bgGradient[0], borderColor: styleObj.border }]}
        activeOpacity={0.88}
        onPress={() => openSubjectActions(item)}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconBox, { backgroundColor: styleObj.badgeBg }]}>
            <Ionicons name={styleObj.icon} size={20} color={styleObj.accent} />
          </View>

          <View style={styles.titleContainer}>
            <View style={styles.subjectHeaderRow}>
              <Text style={[styles.subjectName, { color: styleObj.accent }]} numberOfLines={1}>
                {item.subjectName}
              </Text>
              <View style={[styles.liveTag, { backgroundColor: styleObj.badgeBg }]}>
                <View style={[styles.liveDot, { backgroundColor: styleObj.accent }]} />
                <Text style={[styles.liveText, { color: styleObj.accent }]}>Active</Text>
              </View>
            </View>
            <Text style={styles.courseName} numberOfLines={1}>{item.courseName || "General Curriculum"}</Text>
          </View>
        </View>

        <View style={[styles.actionRow, { borderTopColor: styleObj.border }]}>
          <TouchableOpacity
            style={styles.miniBtn}
            onPress={() => navigation.navigate("Attendance", { subject: item })}
            activeOpacity={0.7}
          >
            <View style={[styles.miniIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="checkmark-done" size={13} color="#2563EB" />
            </View>
            <Text style={[styles.miniBtnText, { color: "#2563EB" }]}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniBtn}
            onPress={() => navigation.navigate("Students", { subject: item })}
            activeOpacity={0.7}
          >
            <View style={[styles.miniIconBg, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="people" size={13} color="#16A34A" />
            </View>
            <Text style={[styles.miniBtnText, { color: "#16A34A" }]}>Students</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniBtn}
            onPress={() => navigation.navigate("Grades", { subject: item })}
            activeOpacity={0.7}
          >
            <View style={[styles.miniIconBg, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="ribbon" size={13} color="#9333EA" />
            </View>
            <Text style={[styles.miniBtnText, { color: "#9333EA" }]}>Grades</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greetingSub}>Instructor Portal</Text>
          <Text style={styles.header}>My Subjects ✨</Text>
        </View>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.subjectId)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary || "#2563EB"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="library-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Subjects Found</Text>
            <Text style={styles.emptyText}>You haven't been assigned any modules yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC", 
    paddingHorizontal: 20, 
    paddingTop: 50 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#F8FAFC" 
  },
  headerContainer: {
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  header: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#0F172A",
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  subjectHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectName: { 
    fontSize: 15, 
    fontWeight: "800",
    flex: 1,
    marginRight: 6,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  courseName: { 
    fontSize: 11, 
    color: "#475569", 
    fontWeight: "600", 
    marginTop: 3,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  miniBtn: {
    flex: 1,
    flexDirection: "row",
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
    shadowColor: "#0F172A",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  miniIconBg: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  miniBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: { 
    alignItems: "center", 
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptyText: { 
    color: "#94A3B8", 
    fontSize: 12, 
    fontWeight: "500", 
    textAlign: "center",
    lineHeight: 16,
  },
});