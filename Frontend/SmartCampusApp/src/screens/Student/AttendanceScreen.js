import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getAttendanceByStudent } from "../../api/attendanceApi";
import Colors from "../../constants/Colors";

const getFeedbackMessage = (percentage) => {
  if (percentage >= 85) {
    return { message: "Outstanding! You're keeping excellent attendance.", color: "#16a34a", bgColor: "#dcfce7" };
  } else if (percentage >= 75) {
    return { message: "Good job! Keep it above 75% to stay safe.", color: "#2563eb", bgColor: "#dbeafe" };
  } else if (percentage >= 65) {
    return { message: "Warning: Your attendance is dropping. Try not to miss classes!", color: "#d97706", bgColor: "#fef3c7" };
  } else {
    return { message: "Critical! Your attendance is below requirements.", color: "#dc2626", bgColor: "#fee2e2" };
  }
};

const formatDateAndDay = (dateString) => {
  if (!dateString) return { date: "", day: "" };
  const dateObj = new Date(dateString);

  const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const date = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return { date, day };
};

export default function AttendanceScreen() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PRESENT, ABSENT

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceData();
    }, [])
  );

  const fetchAttendanceData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.studentId) {
          const response = await getAttendanceByStudent(user.studentId);
          const records = response.data?.data || [];
          setAttendanceList(records);
          applyFilters(records, searchQuery, filterStatus);

          if (records.length > 0) {
            const presentCount = records.filter((r) => r.status === "PRESENT").length;
            const calculatedPercentage = Math.round((presentCount / records.length) * 100);
            setPercentage(calculatedPercentage);
          } else {
            setPercentage(0);
          }
        }
      }
    } catch (error) {
      console.log("Error fetching attendance:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (list, query, status) => {
    let result = list;

    // Filter by status
    if (status !== "ALL") {
      result = result.filter((item) => item.status === status);
    }

    // Filter by search query (subject name or date)
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((item) => {
        const subjectMatch = item.subjectName?.toLowerCase().includes(q);
        const { date, day } = formatDateAndDay(item.attendanceDate);
        const dateMatch = date.toLowerCase().includes(q) || day.toLowerCase().includes(q);
        return subjectMatch || dateMatch;
      });
    }

    setFilteredAttendance(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(attendanceList, text, filterStatus);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    applyFilters(attendanceList, searchQuery, status);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData();
  };

  const feedback = getFeedbackMessage(percentage);

  const renderAttendanceItem = ({ item }) => {
    const { date, day } = formatDateAndDay(item.attendanceDate);
    const isPresent = item.status === "PRESENT";

    return (
      <View style={styles.card}>
        <View style={[styles.cardLeftIndicator, { backgroundColor: isPresent ? "#16a34a" : "#dc2626" }]} />

        <View style={styles.cardInnerContent}>
          <View style={styles.cardTopRow}>
            <View style={styles.infoContainer}>
              <Text style={styles.subjectName} numberOfLines={1}>
                {item.subjectName || "Subject"}
              </Text>
              <Text style={styles.dateText}>{day}, {date}</Text>
            </View>

            <View style={[styles.badge, isPresent ? styles.presentBadge : styles.absentBadge]}>
              <Ionicons 
                name={isPresent ? "checkmark-circle" : "close-circle"} 
                size={13} 
                color={isPresent ? "#16a34a" : "#dc2626"} 
                style={styles.badgeIcon}
              />
              <Text style={[styles.badgeText, isPresent ? styles.presentText : styles.absentText]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* Header aligned with other screens */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Attendance</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="stats-chart-outline" size={22} color={Colors.primary || "#2563EB"} />
        </View>
      </View>

      <FlatList
        data={filteredAttendance}
        keyExtractor={(item) => item.attendanceId.toString()}
        renderItem={renderAttendanceItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary || "#2563EB"]} 
          />
        }
        ListHeaderComponent={
          <>
            {/* Percentage Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Overall Attendance</Text>
              <Text style={styles.percentageText}>{percentage}%</Text>

              <View style={[styles.feedbackBanner, { backgroundColor: feedback.bgColor }]}>
                <Text style={[styles.feedbackText, { color: feedback.color }]}>
                  {feedback.message}
                </Text>
              </View>
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by subject or date..."
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

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {["ALL", "PRESENT", "ABSENT"].map((status) => {
                const isActive = filterStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterPill, isActive && styles.activeFilterPill]}
                    onPress={() => handleStatusFilter(status)}
                  >
                    <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Attendance Logs</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="folder-open-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptySubTitle}>
              No attendance records match your current filter.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  container: { 
    paddingHorizontal: 20, 
    paddingBottom: 30, 
  },
  summaryCard: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 18, 
    padding: 20, 
    alignItems: "center", 
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3, 
  },
  summaryTitle: { 
    fontSize: 14, 
    fontWeight: "600",
    color: "#64748B" 
  },
  percentageText: { 
    fontSize: 38, 
    fontWeight: "900", 
    color: Colors.primary || "#2563EB", 
    marginVertical: 4,
    letterSpacing: -1,
  },
  feedbackBanner: { 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 12, 
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  feedbackText: { 
    fontSize: 12, 
    fontWeight: "700", 
    textAlign: "center" 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginTop: 4,
    marginBottom: 10,
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  activeFilterPill: {
    backgroundColor: Colors.primary || "#2563EB",
    borderColor: Colors.primary || "#2563EB",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: "#0F172A",
    marginBottom: 4, 
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginTop: 8,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeftIndicator: {
    width: 5,
  },
  cardInnerContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  dateText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  badge: { 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8,
    gap: 4,
  },
  presentBadge: { 
    backgroundColor: "#dcfce7" 
  },
  absentBadge: { 
    backgroundColor: "#fee2e2" 
  },
  badgeIcon: {
    marginRight: 1,
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: "800" 
  },
  presentText: { 
    color: "#16a34a" 
  },
  absentText: { 
    color: "#dc2626" 
  },
  emptyContainer: {
    marginTop: 30,
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
  emptySubTitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});