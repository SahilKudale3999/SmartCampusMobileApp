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
import { createNotice } from "../../api/noticeApi";

const STORAGE_KEY = "user";

export default function CreateNoticeScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
      friction: 6,
      tension: 45,
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
    if (!title.trim()) newErrors.title = "Notice title is required";
    if (!description.trim()) newErrors.description = "Notice description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await createNotice({
        title: title.trim(),
        description: description.trim(),
        createdBy: userId,
      });

      triggerSuccessModal();
    } catch (error) {
      console.log("Error creating notice:", error.response?.data || error.message);
      setErrors((prev) => ({
        ...prev,
        api: error.response?.data?.message || "Failed to publish notice. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F6" />
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
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#064E3B" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.header}>New Notice</Text>
              <Text style={styles.subHeader}>Broadcast announcements to students</Text>
            </View>
          </View>

          {/* Hero Banner */}
          <View style={styles.topHeroBanner}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="megaphone-outline" size={22} color="#064E3B" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.heroTitle}>Campus Bulletin</Text>
              <Text style={styles.heroSubtitle}>
                Published notices will be highlighted directly on student dashboards.
              </Text>
            </View>
          </View>

          {/* Form Error Banners */}
          {(errors.auth || errors.api) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#991B1B" />
              <Text style={styles.errorBannerText}>{errors.auth || errors.api}</Text>
            </View>
          )}

          {/* Input Card Container */}
          <View style={styles.card}>
            {/* Title Input Field */}
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Notice Title *</Text>
              <Text style={styles.charCount}>{title.length}/150</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "title" && styles.inputFocused,
                errors.title && styles.inputError,
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={focusedInput === "title" ? "#064E3B" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mid-semester examination schedule update"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors((e) => ({ ...e, title: null }));
                }}
                onFocus={() => setFocusedInput("title")}
                onBlur={() => setFocusedInput(null)}
                maxLength={150}
              />
            </View>
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

            {/* Description Input Field */}
            <View style={[styles.fieldHeader, { marginTop: 20 }]}>
              <Text style={styles.label}>Detailed Description *</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                focusedInput === "description" && styles.inputFocused,
                errors.description && styles.inputError,
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write the complete announcement details, guidelines, or instructions..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) setErrors((e) => ({ ...e, description: null }));
                }}
                onFocus={() => setFocusedInput("description")}
                onBlur={() => setFocusedInput(null)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#064E3B", "#022C22"]}
              style={styles.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.submitText}>Publish Notice</Text>
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
                    <MaterialCommunityIcons name="check-decagram" size={42} color="#064E3B" />
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>ANNOUNCEMENT BROADCASTED</Text>
                </View>

                <Text style={styles.modalTitle}>Notice Posted!</Text>
                <Text style={styles.modalSubtitle}>
                  Your announcement is now live and accessible on student boards.
                </Text>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  activeOpacity={0.85}
                  onPress={handleModalClose}
                >
                  <LinearGradient
                    colors={["#064E3B", "#022C22"]}
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
  safeArea: { flex: 1, backgroundColor: "#F4F7F6" },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header Styles
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
  header: { fontSize: 20, fontWeight: "800", color: "#064E3B" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },

  // Hero Banner
  topHeroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  heroIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: { fontSize: 15, fontWeight: "800", color: "#064E3B" },
  heroSubtitle: { fontSize: 12, color: "#047857", fontWeight: "500", marginTop: 2, lineHeight: 16 },

  // Form Card
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
  label: { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  charCount: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },

  // Input States
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
    borderColor: "#064E3B",
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

  // Textarea Specifics
  textAreaWrapper: {
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textArea: {
    minHeight: 120,
    paddingVertical: 4,
  },

  // Error States
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

  // Buttons & Gradients
  submitBtn: {
    marginTop: 22,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 44, 34, 0.55)",
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
    shadowColor: "#064E3B",
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
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#064E3B" },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#047857", letterSpacing: 0.8 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#064E3B", textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalActionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#064E3B",
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