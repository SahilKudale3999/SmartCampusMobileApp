import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { getAllFaculties } from "../../api/facultyApi";

export default function FacultyDirectoryScreen({ navigation }) {
  const [faculties, setFaculties] = useState([]);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      let studentDept = "";

      if (userData) {
        const parsedUser = JSON.parse(userData);
        studentDept = parsedUser.department || parsedUser.course || "";
      }

      const response = await getAllFaculties();
      const list = response.data?.data || response.data || [];

      let departmentFaculties = list;

      if (studentDept) {
        departmentFaculties = list.filter((faculty) => {
          if (!faculty.department) return false;
          return faculty.department.trim().toLowerCase() === studentDept.trim().toLowerCase();
        });
      }

      setFaculties(departmentFaculties);
      setFilteredFaculties(departmentFaculties);
    } catch (error) {
      console.log("Error fetching course faculty:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredFaculties(faculties);
      return;
    }

    const filtered = faculties.filter((item) => {
      const nameMatch = item.fullName?.toLowerCase().includes(text.toLowerCase());
      const deptMatch = item.department?.toLowerCase().includes(text.toLowerCase());
      return nameMatch || deptMatch;
    });

    setFilteredFaculties(filtered);
  };

  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFaculties();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading faculty directory...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#2563EB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Faculty Directory</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="people-outline" size={22} color="#2563EB" />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or department..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredFaculties}
        keyExtractor={(item, index) => item.facultyId?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Faculty Found</Text>
            <Text style={styles.emptySub}>Try searching with a different term.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeftIndicator} />

            <View style={styles.cardInnerContent}>
              <View style={styles.cardTopRow}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {item.fullName ? item.fullName.charAt(0).toUpperCase() : "F"}
                  </Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.facultyName} numberOfLines={1}>
                    {item.fullName || "Faculty Member"}
                  </Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.deptBadge}>
                      <MaterialCommunityIcons name="domain" size={12} color="#2563EB" />
                      <Text style={styles.deptText} numberOfLines={1}>{item.department || "General"}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.8}
                  onPress={() => handleEmailPress(item.email)}
                >
                  <Ionicons name="send" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={13} color="#64748B" />
                <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
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
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
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
    backgroundColor: "#2563EB",
  },
  cardInnerContent: {
    flex: 1,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  facultyName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 4,
  },
  deptText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  metaDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emailText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    flex: 1,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2563EB",
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
  emptySub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
});