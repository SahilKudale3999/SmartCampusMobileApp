import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createEvent } from "../../api/eventApi";

const STORAGE_KEY = "user";

const formatForBackend = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatForDisplay = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function CreateEventScreen({ navigation }) {
  const [userId, setUserId] = useState(null);

  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [focusedInput, setFocusedInput] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Success Feedback Modal Animation
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUserId(parsed.userId ?? parsed.id ?? null);
        }
      } catch (error) {
        console.log("Error reading logged-in user:", error.message);
      }
    })();
  }, []);

  const triggerSuccessModal = () => {
    setShowSuccessModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    scaleAnim.setValue(0);
    navigation.goBack();
  };

  const validate = () => {
    const newErrors = {};
    if (!eventName.trim()) newErrors.eventName = "Event name is required";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(eventDate);
    chosen.setHours(0, 0, 0, 0);
    if (chosen < today) newErrors.eventDate = "Event date cannot be in the past";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEventDate(selectedDate);
      if (errors.eventDate) setErrors((e) => ({ ...e, eventDate: null }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!userId) {
      setErrors((prev) => ({
        ...prev,
        auth: "Could not identify logged-in faculty. Please re-authenticate.",
      }));
      return;
    }

    setSubmitting(true);
    try {
      await createEvent({
        eventName: eventName.trim(),
        description: description.trim(),
        venue: venue.trim(),
        eventDate: formatForBackend(eventDate),
        createdBy: userId,
      });

      triggerSuccessModal();
    } catch (error) {
      console.log("Error creating event:", error.response?.data || error.message);
      setErrors((prev) => ({
        ...prev,
        api: error.response?.data?.message || "Failed to publish event. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.header}>New Event</Text>
              <Text style={styles.subHeader}>Publish campus activity & schedules</Text>
            </View>
          </View>

          {/* Top Hero Banner */}
          <View style={styles.topHeroBanner}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="sparkles" size={22} color="#0F172A" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.heroTitle}>Organize & Broadcast</Text>
              <Text style={styles.heroSubtitle}>
                Add details below to instantly announce your event to students.
              </Text>
            </View>
          </View>

          {/* Form Errors Banner */}
          {(errors.auth || errors.api) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#991B1B" />
              <Text style={styles.errorBannerText}>{errors.auth || errors.api}</Text>
            </View>
          )}

          {/* Main Input Form Card */}
          <View style={styles.card}>
            {/* Event Name */}
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Event Title *</Text>
              <Text style={styles.charCount}>{eventName.length}/150</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "eventName" && styles.inputFocused,
                errors.eventName && styles.inputError,
              ]}
            >
              <Ionicons
                name="calendar-clear-outline"
                size={18}
                color={focusedInput === "eventName" ? "#0F172A" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Annual Tech Symposium 2026"
                placeholderTextColor="#94A3B8"
                value={eventName}
                onChangeText={(text) => {
                  setEventName(text);
                  if (errors.eventName) setErrors((e) => ({ ...e, eventName: null }));
                }}
                onFocus={() => setFocusedInput("eventName")}
                onBlur={() => setFocusedInput(null)}
                maxLength={150}
              />
            </View>
            {errors.eventName ? <Text style={styles.errorText}>{errors.eventName}</Text> : null}

            {/* Venue Input */}
            <View style={[styles.fieldHeader, { marginTop: 18 }]}>
              <Text style={styles.label}>Location / Venue</Text>
              <Text style={styles.charCount}>{venue.length}/150</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "venue" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={focusedInput === "venue" ? "#0F172A" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Main Auditorium, Block B"
                placeholderTextColor="#94A3B8"
                value={venue}
                onChangeText={setVenue}
                onFocus={() => setFocusedInput("venue")}
                onBlur={() => setFocusedInput(null)}
                maxLength={150}
              />
            </View>

            {/* Event Date Selector */}
            <Text style={[styles.label, { marginTop: 18 }]}>Event Date *</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                styles.dateInputWrapper,
                errors.eventDate && styles.inputError,
              ]}
              activeOpacity={0.85}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateLeftRow}>
                <View style={styles.calendarBadge}>
                  <Ionicons name="today-outline" size={18} color="#0F172A" />
                </View>
                <Text style={styles.dateText}>{formatForDisplay(eventDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#0F172A" />
            </TouchableOpacity>
            {errors.eventDate ? <Text style={styles.errorText}>{errors.eventDate}</Text> : null}

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={new Date()}
                  onChange={onChangeDate}
                  accentColor="#0F172A"
                />
              </View>
            )}

            {/* Description Input */}
            <Text style={[styles.label, { marginTop: 18 }]}>Event Description</Text>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                focusedInput === "description" && styles.inputFocused,
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide agenda, guest speakers, timing details, or entry criteria..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedInput("description")}
                onBlur={() => setFocusedInput(null)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Trigger Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#1E293B", "#0F172A"]}
              style={styles.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="calendar" size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Publish Event</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        <Modal visible={showSuccessModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.modalCardContent}>
                <View style={styles.successBadgeContainer}>
                  <View style={styles.successBadgeIcon}>
                    <MaterialCommunityIcons name="party-popper" size={38} color="#0F172A" />
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>EVENT SCHEDULED</Text>
                </View>

                <Text style={styles.modalTitle}>Event Published!</Text>
                <Text style={styles.modalSubtitle}>
                  Your event has been successfully logged and broadcasted to students and campus feeds.
                </Text>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  activeOpacity={0.85}
                  onPress={handleModalClose}
                >
                  <LinearGradient
                    colors={["#1E293B", "#0F172A"]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header & Banner Navigation
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 6 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },

  // Top Hero Banner
  topHeroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  heroSubtitle: { fontSize: 12, color: "#475569", fontWeight: "500", marginTop: 2, lineHeight: 16 },

  // Form Container Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "700", color: "#334155" },
  charCount: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },

  // Inputs & Focus States
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  inputFocused: {
    borderColor: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },

  // Date Field Specifics
  dateInputWrapper: {
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
  },
  dateLeftRow: { flexDirection: "row", alignItems: "center" },
  calendarBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dateText: { fontSize: 14, color: "#0F172A", fontWeight: "700" },
  pickerContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  // Text Area Input
  textAreaWrapper: {
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 110,
    paddingVertical: 4,
  },

  // Validation & Errors
  inputError: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  errorText: { color: "#DC2626", fontSize: 12, fontWeight: "600", marginTop: 6 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: { color: "#991B1B", fontSize: 13, fontWeight: "600", marginLeft: 8, flex: 1 },

  // Submit Buttons & Gradients
  submitBtn: {
    marginTop: 22,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 8 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCardWrapper: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalCardContent: { padding: 28, alignItems: "center" },
  successBadgeContainer: { marginBottom: 16 },
  successBadgeIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#0F172A" },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#334155", letterSpacing: 0.8 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalActionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  modalButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});