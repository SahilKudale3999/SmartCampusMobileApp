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
  TextInput,
  Modal,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { getAllEvents } from "../../api/eventApi";
import Colors from "../../constants/Colors";

export default function EventScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAllEvents();
      const list = response.data?.data || response.data || [];
      setEvents(list);
      setFilteredEvents(list);
    } catch (error) {
      console.log("Error loading events:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter((item) => {
      const nameMatch = item.eventName?.toLowerCase().includes(text.toLowerCase());
      const descMatch = item.description?.toLowerCase().includes(text.toLowerCase());
      const venueMatch = item.venue?.toLowerCase().includes(text.toLowerCase());
      return nameMatch || descMatch || venueMatch;
    });

    setFilteredEvents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Extracts day and month for the modern date-badge design
  const parseDateBadge = (dateString) => {
    if (!dateString) return { day: "--", month: "---", full: "Date TBD" };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-IN", { month: "short" }).toUpperCase();
    const full = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return { day, month, full };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loadingText}>Fetching upcoming events...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campus Events</Text>
          <Text style={styles.headerSub}>Discover workshops, seminars & activities</Text>
        </View>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{events.length} Upcoming</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by event, description, or venue..."
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

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item, index) => item.eventId?.toString() || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary || "#2563EB"]}
          />
        }
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={70} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySubTitle}>
              Pull down to refresh or try searching for a different keyword.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const dateObj = parseDateBadge(item.eventDate);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => setSelectedEvent(item)}
            >
              {/* Left Calendar Date Badge */}
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeDay}>{dateObj.day}</Text>
                <Text style={styles.dateBadgeMonth}>{dateObj.month}</Text>
              </View>

              {/* Event Main Info */}
              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.eventName}
                  </Text>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                  </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooterRow}>
                  <View style={styles.venueRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.primary || "#2563EB"} />
                    <Text style={styles.venueText} numberOfLines={1}>
                      {item.venue || "Campus Venue"}
                    </Text>
                  </View>

                  <View style={styles.organizerChip}>
                    <Ionicons name="person-outline" size={11} color="#64748B" />
                    <Text style={styles.userText} numberOfLines={1}>
                      {item.createdByName || "Organizer"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Expanded Event Details Modal */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="calendar" size={22} color="#FFF" />
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedEvent(null)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedEvent?.eventName}</Text>

              {/* Meta Chips */}
              <View style={styles.modalMetaContainer}>
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={15} color="#2563EB" />
                  <Text style={styles.chipText}>
                    {parseDateBadge(selectedEvent?.eventDate).full}
                  </Text>
                </View>

                <View style={styles.chip}>
                  <Ionicons name="location-outline" size={15} color="#2563EB" />
                  <Text style={styles.chipText}>
                    {selectedEvent?.venue || "Campus Venue"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.modalSectionHeading}>About Event</Text>
              <Text style={styles.modalDescription}>
                {selectedEvent?.description}
              </Text>

              <View style={styles.organizerBox}>
                <Ionicons name="person-circle" size={32} color="#2563EB" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.organizerLabel}>Organized By</Text>
                  <Text style={styles.organizerName}>
                    {selectedEvent?.createdByName || "Event Management Committee"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={styles.actionBtnText}>Close Event Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  badgeCount: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
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
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
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
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  dateBadge: {
    width: 76,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#DBEAFE",
    paddingVertical: 16,
  },
  dateBadgeDay: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.primary || "#2563EB",
    letterSpacing: -0.5,
  },
  dateBadgeMonth: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3B82F6",
    marginTop: 1,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  chevronBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#F8FAFC",
    paddingTop: 10,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    gap: 4,
  },
  venueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  organizerChip: {
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
  userText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubTitle: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748B",
    paddingHorizontal: 40,
    fontSize: 13,
    lineHeight: 18,
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
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary || "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },
  modalSectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 20,
  },
  organizerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  organizerLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  organizerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  actionBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});