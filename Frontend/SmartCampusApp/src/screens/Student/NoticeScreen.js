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
import { getAllNotices } from "../../api/noticeApi";
import Colors from "../../constants/Colors";

export default function NoticeScreen({ navigation }) {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const response = await getAllNotices();
      const list = response.data?.data || response.data || [];
      setNotices(list);
      setFilteredNotices(list);
    } catch (error) {
      console.log("Error loading notices:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredNotices(notices);
      return;
    }

    const filtered = notices.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(text.toLowerCase());
      const descMatch = item.description?.toLowerCase().includes(text.toLowerCase());
      const authorMatch = item.createdByName?.toLowerCase().includes(text.toLowerCase());
      return titleMatch || descMatch || authorMatch;
    });

    setFilteredNotices(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotices();
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loadingText}>Fetching latest updates...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* Header aligned with Subject & Faculty screens */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Notice Board</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary || "#2563EB"} />
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notices..."
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

      {/* Main Notice List */}
      <FlatList
        data={filteredNotices}
        keyExtractor={(item, index) => item.noticeId?.toString() || index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary || "#2563EB"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Notices Found</Text>
            <Text style={styles.emptySubTitle}>
              Pull down to refresh or check back later for announcements.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => setSelectedNotice(item)}
          >
            <View style={styles.cardLeftIndicator} />

            <View style={styles.cardInnerContent}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconBox}>
                  <Ionicons name="megaphone" size={20} color={Colors.primary || "#2563EB"} />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="person-circle-outline" size={13} color="#64748B" />
                      <Text style={styles.user} numberOfLines={1}>{item.createdByName || "Administration"}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.metaDivider} />

              <View style={styles.cardBottomRow}>
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.viewMoreBox}>
                  <Text style={styles.viewMoreText}>Read More</Text>
                  <Ionicons name="chevron-forward" size={12} color={Colors.primary || "#2563EB"} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal View */}
      <Modal
        visible={!!selectedNotice}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedNotice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="megaphone" size={22} color="#FFF" />
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedNotice(null)}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedNotice?.title}</Text>
              
              <View style={styles.modalMetaRow}>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="person-outline" size={14} color="#2563EB" />
                  <Text style={styles.modalMetaText}>
                    {selectedNotice?.createdByName || "Administration"}
                  </Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#2563EB" />
                  <Text style={styles.modalMetaText}>
                    {formatDate(selectedNotice?.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.modalDescription}>
                {selectedNotice?.description}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.actionDismissBtn}
              onPress={() => setSelectedNotice(null)}
            >
              <Text style={styles.actionDismissText}>Close Notice</Text>
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
  container: {
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
    backgroundColor: Colors.primary || "#2563EB",
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
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  user: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 12,
    flex: 1,
  },
  description: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
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
  date: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  viewMoreBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
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
  emptySubTitle: {
    marginTop: 4,
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
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
    marginBottom: 10,
  },
  modalMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  modalMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalMetaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 20,
  },
  actionDismissBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  actionDismissText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});