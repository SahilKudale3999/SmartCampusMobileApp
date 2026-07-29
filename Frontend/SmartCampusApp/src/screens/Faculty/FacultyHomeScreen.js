import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../constants/Colors";

export default function FacultyHomeScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Faculty,</Text>
          <Text style={styles.subtitleText}>Manage your academic duties</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate("Attendance")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="checkbox-outline" size={26} color="#2563EB" />
          </View>
          <Text style={styles.cardTitle}>Attendance</Text>
          <Text style={styles.cardDesc}>Mark and track student attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate("Assignments")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#FDF2F8" }]}>
            <Ionicons name="document-text-outline" size={26} color="#DB2777" />
          </View>
          <Text style={styles.cardTitle}>Assignments</Text>
          <Text style={styles.cardDesc}>Create and review tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate("Notices")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="notifications-outline" size={26} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Notices</Text>
          <Text style={styles.cardDesc}>Broadcast announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="person-outline" size={26} color="#EA580C" />
          </View>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardDesc}>View and update details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
});