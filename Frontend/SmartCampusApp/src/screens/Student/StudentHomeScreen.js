import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getAllNotices } from "../../api/noticeApi";
import { getAllEvents } from "../../api/eventApi";
import { getAttendanceByStudent } from "../../api/attendanceApi";
import Colors from "../../constants/Colors";
import { ChatbotLauncher } from "../ChatbotScreen";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getAttendanceFeedback = (percentage) => {
  if (percentage >= 85) return { message: "Great going! Keep it up!", color: "#4ADE80" };
  if (percentage >= 75) return { message: "Good overall. Maintain >75%", color: "#60A5FA" };
  if (percentage >= 65) return { message: "Warning! Attendance dropping", color: "#FACC15" };
  return { message: "Low Attendance! Action needed", color: "#F87171" };
};

const formatNoticeDate = (date) => {
  if (!date) return "";
  const noticeDate = new Date(date);
  const today = new Date();

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(noticeDate, today)) return "Today";
  if (isSameDay(noticeDate, yesterday)) return "Yesterday";

  return noticeDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const parseEventDate = (dateString) => {
  if (!dateString) return { day: "--", month: "---" };
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
  };
};

export default function StudentHomeScreen({ navigation }) {
  const [studentName, setStudentName] = useState("Student");
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Notification Modal State
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [allNoticesList, setAllNoticesList] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadUserAndAttendance();
      loadNotices();
      loadEvents();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserAndAttendance(),
      loadNotices(),
      loadEvents(),
    ]);
    setRefreshing(false);
  };

  const loadUserAndAttendance = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      setStudentName(parsedUser.fullName || "Student");

      if (parsedUser?.studentId) {
        const response = await getAttendanceByStudent(parsedUser.studentId);
        const records = response.data?.data || [];

        if (records.length > 0) {
          const present = records.filter((r) => r.status === "PRESENT").length;
          const pct = Math.round((present / records.length) * 100);
          setAttendancePercentage(pct);
        } else {
          setAttendancePercentage(0);
        }
      }
    } catch (error) {
      console.log("Error loading user/attendance:", error.response?.data || error.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await getAllNotices();
      const allNotices = response.data?.data || response.data || [];
      setAllNoticesList(allNotices);
      setNotices(allNotices.slice(0, 2));
    } catch (error) {
      console.log("Error loading notices:", error.response?.data || error.message);
    } finally {
      setLoadingNotices(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await getAllEvents();
      const allEvents = response.data?.data || response.data || [];
      setEvents(allEvents.slice(0, 2));
    } catch (error) {
      console.log("Error loading events:", error.response?.data || error.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleNavigateFaculty = () => {
    navigation.navigate("FacultyDirectory");
  };

  const handleNavigateNotices = () => {
    navigation.navigate("Notices");
  };

  const feedback = getAttendanceFeedback(attendancePercentage);

  return (
    <View style={{ flex: 1 }}>
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
        {/* Header View */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name} numberOfLines={1}>{studentName} ✨</Text>
            <Text style={styles.subGreeting}>Let's make today count and achieve your goals!</Text>
          </View>

          <TouchableOpacity 
            style={styles.notification} 
            activeOpacity={0.8}
            onPress={() => setNotificationModalVisible(true)}
          >
            <Ionicons name="notifications" size={22} color={Colors.primary || "#2563EB"} />
            {allNoticesList.length > 0 && <View style={styles.notificationBadgeDot} />}
          </TouchableOpacity>
        </View>

        {/* Attendance Summary Banner Card */}
        <TouchableOpacity 
          style={styles.attendanceCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AttendanceDetail")}
        >
          <View style={styles.attendanceHeader}>
            <View style={styles.attendanceTitleRow}>
              <Ionicons name="stats-chart" size={18} color="#93C5FD" style={{ marginRight: 8 }} />
              <Text style={styles.attendanceTitle}>Attendance Overview</Text>
            </View>
            <Ionicons name="chevron-forward-circle" size={22} color="#FFF" />
          </View>

          {loadingAttendance ? (
            <ActivityIndicator color="#FFF" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.attendanceValueRow}>
                <Text style={styles.attendanceValue}>{attendancePercentage}%</Text>
                <View style={[styles.feedbackBadge, { backgroundColor: "rgba(255, 255, 255, 0.15)" }]}>
                  <Text style={[styles.attendanceFeedback, { color: feedback.color }]}>
                    {feedback.message}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${Math.min(attendancePercentage, 100)}%` }]} />
              </View>

              <Text style={styles.tapDetailsText}>Tap to view subject breakdown</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results Highlight Banner */}
        <TouchableOpacity
          style={styles.resultsBanner}
          activeOpacity={0.88}
          onPress={() => navigation.navigate("Results")}
        >
          <View style={styles.resultsBannerLeft}>
            <View style={styles.ribbonIconBg}>
              <Ionicons name="ribbon" size={22} color="#FFF" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.resultsTitle}>Grades & Academic Results</Text>
              <Text style={styles.resultsSub}>Check evaluated marks & grades</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </TouchableOpacity>

        {/* Quick Access Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>
        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.actionCard, { borderLeftColor: "#2563EB" }]}
            activeOpacity={0.85}
            onPress={() => navigation.getParent()?.navigate("Subjects")}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="library" size={26} color="#2563EB" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Subjects</Text>
              <Text style={styles.actionSubText}>View enrolled modules</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { borderLeftColor: "#16A34A" }]}
            activeOpacity={0.85}
            onPress={() => navigation.getParent()?.navigate("Subjects")}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="document-text" size={26} color="#16A34A" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Assignments</Text>
              <Text style={styles.actionSubText}>Pending & submissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: "#D97706" }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Results")}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="bar-chart" size={26} color="#D97706" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Results</Text>
              <Text style={styles.actionSubText}>Scores & GPA tracking</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: "#9333EA" }]}
            activeOpacity={0.85}
            onPress={handleNavigateFaculty}
          >
            <View style={[styles.actionIconBg, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="people" size={26} color="#9333EA" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Faculty</Text>
              <Text style={styles.actionSubText}>Directory & contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Recent Notices Preview Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          <TouchableOpacity onPress={handleNavigateNotices}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loadingNotices ? (
          <ActivityIndicator size="small" color={Colors.primary || "#2563EB"} style={styles.sectionLoader} />
        ) : notices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No recent notices posted</Text>
          </View>
        ) : (
          notices.map((notice, index) => (
            <TouchableOpacity 
              key={notice.noticeId || index} 
              style={styles.previewCard}
              activeOpacity={0.85}
              onPress={handleNavigateNotices}
            >
              <View style={styles.noticeIconCircle}>
                <Ionicons name="megaphone-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {notice.title}
                  </Text>
                  <Text style={styles.dateBadgeText}>{formatNoticeDate(notice.createdAt)}</Text>
                </View>
                <Text style={styles.previewSubtitle} numberOfLines={2}>
                  {notice.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Upcoming Events Preview Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>

        {loadingEvents ? (
          <ActivityIndicator size="small" color={Colors.primary || "#2563EB"} style={styles.sectionLoader} />
        ) : events.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No upcoming events scheduled</Text>
          </View>
        ) : (
          events.map((event, index) => {
            const dateObj = parseEventDate(event.eventDate);
            return (
              <View 
                key={event.eventId || index} 
                style={styles.previewCard}
              >
                <View style={styles.eventDateBox}>
                  <Text style={styles.eventDateDay}>{dateObj.day}</Text>
                  <Text style={styles.eventDateMonth}>{dateObj.month}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {event.eventName}
                  </Text>
                  <View style={styles.venueRow}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.venueText} numberOfLines={1}>
                      {event.venue || "Campus Venue"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        
        <View style={{ height: 35 }} />

        {/* Notification Center Modal */}
        <Modal
          visible={notificationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setNotificationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="notifications" size={20} color="#2563EB" />
                  <Text style={styles.modalHeading}>Notification Center</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeModalBtn}
                  onPress={() => setNotificationModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={allNoticesList}
                keyExtractor={(item, index) => item.noticeId?.toString() || index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
                    <Text style={{ color: "#94A3B8", marginTop: 10, fontSize: 14 }}>No new notifications</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.notificationItemCard}>
                    <View style={styles.notificationItemIcon}>
                      <Ionicons name="flash-outline" size={16} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <Text style={styles.notificationItemTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.notificationItemDate}>{formatNoticeDate(item.createdAt)}</Text>
                      </View>
                      <Text style={styles.notificationItemDesc} numberOfLines={3}>{item.description}</Text>
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity 
                style={styles.modalBottomBtn}
                onPress={() => {
                  setNotificationModalVisible(false);
                  handleNavigateNotices();
                }}
              >
                <Text style={styles.modalBottomBtnText}>View Full Notice Board</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <ChatbotLauncher onPress={() => navigation.navigate("Chatbot")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
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
  subGreeting: { 
    color: "#94A3B8", 
    marginTop: 4, 
    fontSize: 13 
  },
  notification: { 
    backgroundColor: "#FFF", 
    padding: 10, 
    borderRadius: 14, 
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
    position: "relative",
  },
  notificationBadgeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  attendanceCard: { 
    backgroundColor: Colors.primary || "#2563EB", 
    borderRadius: 22, 
    padding: 20, 
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  attendanceHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  attendanceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceTitle: { 
    color: "#DBEAFE", 
    fontSize: 15, 
    fontWeight: "700" 
  },
  attendanceValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  attendanceValue: { 
    color: "#FFFFFF", 
    fontSize: 38, 
    fontWeight: "800" 
  },
  feedbackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attendanceFeedback: { 
    fontSize: 12, 
    fontWeight: "700" 
  },
  progressBackground: { 
    height: 8, 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 6,
  },
  progressFill: { 
    height: 8, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 10 
  },
  tapDetailsText: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  resultsBanner: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    elevation: 2,
    shadowColor: "#2563EB",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  resultsBannerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  ribbonIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary || "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  resultsTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  resultsSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
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
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
  },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    marginBottom: 15,
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
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: { 
    fontWeight: "800", 
    fontSize: 14, 
    color: "#0F172A",
  },
  actionSubText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
  previewCard: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  noticeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  previewTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  previewSubtitle: { 
    fontSize: 13, 
    color: "#64748B",
    lineHeight: 18,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  eventDateBox: {
    width: 44,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  eventDateDay: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3B82F6",
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },
  venueText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  sectionLoader: { 
    marginVertical: 14 
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyText: { 
    color: "#94A3B8", 
    fontSize: 13,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "75%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeModalBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  notificationItemCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  notificationItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 6,
  },
  notificationItemDate: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  notificationItemDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  modalBottomBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  modalBottomBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});