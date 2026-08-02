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
    // Land on the subject's assignment list by default; other actions
    // (Attendance / Students / Grades) can pass the same subject param.
    navigation.navigate("Assignments", { subject });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => openSubjectActions(item)}
    >
      <View style={styles.iconBg}>
        <Ionicons name="book" size={22} color={Colors.primary || "#2563EB"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.subjectName}>{item.subjectName}</Text>
        <Text style={styles.courseName}>{item.courseName}</Text>
      </View>

      <View style={styles.quickBtnRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate("Attendance", { subject: item })}
        >
          <Ionicons name="checkmark-done" size={16} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate("Students", { subject: item })}
        >
          <Ionicons name="people" size={16} color="#16A34A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.navigate("Grades", { subject: item })}
        >
          <Ionicons name="ribbon" size={16} color="#9333EA" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Subjects</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.subjectId)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyText}>No subjects assigned yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 20, paddingTop: 50 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  courseName: { fontSize: 11, color: "#64748B", fontWeight: "600", marginTop: 2 },
  quickBtnRow: { flexDirection: "row" },
  quickBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginTop: 8 },
});