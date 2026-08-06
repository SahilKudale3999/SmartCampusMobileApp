import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Modal,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";
import { getSubjectsByFaculty } from "../../api/subjectApi";
import { getAssignmentsBySubject } from "../../api/assignmentApi";
import { getSubmissionsByAssignment, gradeSubmission } from "../../api/submissionApi";

/**
 * Helper function to map course/subject titles to dynamic tech icons with a light purple theme.
 */
const getSubjectIconConfig = (subjectName = "") => {
  const name = subjectName.toLowerCase();

  if (name.includes("python")) return { icon: "logo-python", color: "#8B5CF6", bg: "#F5F3FF" };
  if (name.includes("java") || name.includes("script") || name.includes("js"))
    return { icon: "logo-javascript", color: "#7C3AED", bg: "#F3E8FF" };
  if (name.includes("c++") || name.includes("c#") || name.includes("coding") || name.includes("program"))
    return { icon: "code-slash", color: "#8B5CF6", bg: "#F5F3FF" };
  if (name.includes("web") || name.includes("html") || name.includes("css") || name.includes("react"))
    return { icon: "globe-outline", color: "#7C3AED", bg: "#F3E8FF" };
  if (name.includes("database") || name.includes("sql") || name.includes("data"))
    return { icon: "server-outline", color: "#8B5CF6", bg: "#F5F3FF" };
  if (name.includes("network") || name.includes("cloud") || name.includes("security"))
    return { icon: "terminal-outline", color: "#7C3AED", bg: "#F3E8FF" };
  if (name.includes("ai") || name.includes("machine") || name.includes("algo"))
    return { icon: "hardware-chip-outline", color: "#8B5CF6", bg: "#F5F3FF" };

  return { icon: "ribbon-outline", color: "#8B5CF6", bg: "#F5F3FF" };
};

export default function GradesScreen({ route }) {
  const passedSubject = route?.params?.subject;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(passedSubject || null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [maxScore, setMaxScore] = useState("10");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Success Modal & Animation States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      if (selectedAssignment) {
        loadSubmissions(selectedAssignment);
      } else if (selectedSubject) {
        loadAssignments(selectedSubject);
      } else {
        loadSubjects();
      }
    }, [selectedSubject, selectedAssignment])
  );

  const triggerSuccessModal = () => {
    setShowSuccessModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    scaleAnim.setValue(0);
  };

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const facultyId = parsedUser?.facultyId;
      if (!facultyId) return;

      const response = await getSubjectsByFaculty(facultyId);
      setSubjects(response.data?.data || response.data || []);
    } catch (error) {
      console.log("Error loading subjects:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (subject) => {
    setLoading(true);
    try {
      const response = await getAssignmentsBySubject(subject.subjectId);
      setAssignments(response.data?.data || response.data || []);
    } catch (error) {
      console.log("Error loading assignments:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignment) => {
    setLoading(true);
    try {
      const response = await getSubmissionsByAssignment(assignment.assignmentId);
      const list = response.data?.data || response.data || [];
      setSubmissions(list);

      const inputs = {};
      list.forEach((s) => {
        inputs[s.submissionId] = s.gradeScore != null ? String(s.gradeScore) : "";
      });
      setGradeInputs(inputs);
    } catch (error) {
      console.log("Error loading submissions:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitGrade = async (submissionId) => {
    const value = gradeInputs[submissionId];
    if (value === undefined || value === "" || isNaN(Number(value))) {
      return;
    }
    setSavingId(submissionId);
    try {
      await gradeSubmission(submissionId, Number(value));
      triggerSuccessModal();
    } catch (error) {
      console.log("Error grading submission:", error.response?.data || error.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                       VIEW 1: SUBJECT SELECTION                           */
  /* -------------------------------------------------------------------------- */
  if (!selectedSubject) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.container}>
          <View style={styles.topHeroBanner}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="ribbon-outline" size={26} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.heroTitle}>Gradebook & Review</Text>
              <Text style={styles.heroSubtitle}>Select a subject to view assignments & scores</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Assigned Subjects</Text>

          <FlatList
            data={subjects}
            keyExtractor={(item) => String(item.subjectId)}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const iconConfig = getSubjectIconConfig(item.subjectName);
              return (
                <TouchableOpacity
                  style={styles.subjectCard}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSubject(item)}
                >
                  <View style={[styles.subjectIconBox, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon} size={22} color={iconConfig.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectCardTitle}>{item.subjectName}</Text>
                    <Text style={styles.subjectCardSub}>Tap to access student submissions</Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No subjects assigned</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                      VIEW 2: ASSIGNMENT SELECTION                         */
  /* -------------------------------------------------------------------------- */
  if (!selectedAssignment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => setSelectedSubject(null)}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.header} numberOfLines={1}>{selectedSubject.subjectName}</Text>
              <Text style={styles.subHeader}>Select Assignment to Grade</Text>
            </View>
          </View>

          <FlatList
            data={assignments}
            keyExtractor={(item) => String(item.assignmentId)}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.subjectCard}
                activeOpacity={0.85}
                onPress={() => setSelectedAssignment(item)}
              >
                <View style={styles.subjectIconBox}>
                  <Ionicons name="document-text-outline" size={22} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectCardTitle}>{item.title}</Text>
                  <Text style={styles.subjectCardSub}>Tap to view submissions & grade</Text>
                </View>
                <View style={styles.chevronBox}>
                  <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No assignments found</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                      VIEW 3: SUBMISSIONS & GRADING                         */
  /* -------------------------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => setSelectedAssignment(null)}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.header} numberOfLines={1}>{selectedAssignment.title}</Text>
            <Text style={styles.subHeader}>Student Submissions & Scorecard</Text>
          </View>
        </View>

        {/* Max Score Config Box */}
        <View style={styles.configScoreRow}>
          <Text style={styles.configLabel}>Total Max Score:</Text>
          <TextInput
            style={styles.maxScoreInput}
            keyboardType="numeric"
            value={maxScore}
            onChangeText={setMaxScore}
            maxLength={3}
          />
        </View>

        <FlatList
          data={submissions}
          keyExtractor={(item) => String(item.submissionId)}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const currentScore = gradeInputs[item.submissionId] || "0";
            const numericScore = Number(currentScore);
            const numericMax = Number(maxScore) || 10;
            const percentage = Math.min(Math.max((numericScore / numericMax) * 100, 0), 100);

            return (
              <View style={styles.submissionCard}>
                <View style={styles.submissionTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View style={styles.studentAvatarCircle}>
                      <Text style={styles.studentAvatarInitial}>
                        {item.studentName?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.studentName} numberOfLines={1}>{item.studentName}</Text>
                      <Text style={styles.submissionSub}>Submitted work</Text>
                    </View>
                  </View>

                  <View style={styles.scoreIndicatorBadge}>
                    <Text style={styles.scoreIndicatorText}>
                      {currentScore !== "" ? currentScore : "0"} / {numericMax}
                    </Text>
                  </View>
                </View>

                {item.fileUrl ? (
                  <TouchableOpacity
                    style={styles.visibleLinkContainer}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(item.fileUrl)}
                  >
                    <Ionicons name="link" size={14} color="#8B5CF6" style={{ marginRight: 6 }} />
                    <Text style={styles.visibleLinkText} numberOfLines={1}>
                      {item.fileUrl}
                    </Text>
                    <Ionicons name="open-outline" size={14} color="#8B5CF6" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noFileContainer}>
                    <Text style={styles.noFileText}>No file attachment submitted</Text>
                  </View>
                )}

                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                </View>

                <View style={styles.gradeRow}>
                  <TextInput
                    style={styles.gradeInput}
                    keyboardType="numeric"
                    placeholder="Score"
                    placeholderTextColor="#94A3B8"
                    value={gradeInputs[item.submissionId]}
                    onChangeText={(text) =>
                      setGradeInputs((prev) => ({ ...prev, [item.submissionId]: text }))
                    }
                  />
                  <Text style={styles.maxScoreSuffix}>/ {numericMax}</Text>
                  <TouchableOpacity
                    style={styles.saveButton}
                    activeOpacity={0.85}
                    onPress={() => submitGrade(item.submissionId)}
                    disabled={savingId === item.submissionId}
                  >
                    {savingId === item.submissionId ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Grade</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No submissions yet</Text>
            </View>
          }
        />

        {/* Success Feedback Modal */}
        <Modal visible={showSuccessModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.modalCardContent}>
                <View style={styles.successBadgeContainer}>
                  <View style={styles.successBadgeIcon}>
                    <MaterialCommunityIcons name="check-decagram" size={38} color="#8B5CF6" />
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>SCORECARD LOGGED</Text>
                </View>

                <Text style={styles.modalTitle}>Grade Saved Successfully!</Text>
                <Text style={styles.modalSubtitle}>
                  The student score has been safely updated and recorded in the academic portal.
                </Text>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  activeOpacity={0.85}
                  onPress={handleCloseModal}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#7C3AED"]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalButtonText}>Continue Grading</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },

  // Top Hero Banner (Light Purple)
  topHeroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  heroIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: { fontSize: 16, fontWeight: "800", color: "#581C87" },
  heroSubtitle: { fontSize: 12, color: "#7C3AED", fontWeight: "600", marginTop: 2 },
  sectionHeader: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 12 },

  // Headers & Navigation
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 6 },
  header: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  subHeader: { fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // Max Score Configuration Box
  configScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  configLabel: { fontSize: 13, fontWeight: "700", color: "#64748B", flex: 1 },
  maxScoreInput: {
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: "800",
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
    width: 60,
    textAlign: "center",
  },

  // Cards (Subject & Assignment)
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  subjectCardTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  subjectCardSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // Submissions & Grading Cards
  submissionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  submissionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  studentAvatarInitial: { fontSize: 15, fontWeight: "800", color: "#8B5CF6" },
  studentName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  submissionSub: { fontSize: 11, color: "#64748B", marginTop: 1 },
  scoreIndicatorBadge: {
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  scoreIndicatorText: { fontSize: 13, fontWeight: "900", color: "#7C3AED" },

  // Attached File Link
  visibleLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  visibleLinkText: { flex: 1, fontSize: 12, color: "#7C3AED", fontWeight: "700" },
  noFileContainer: { paddingVertical: 4, marginBottom: 10 },
  noFileText: { fontSize: 12, color: "#94A3B8", fontStyle: "italic" },

  // Progress Bar
  progressBarBackground: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },

  // Grade Input & Save Row
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  gradeInput: {
    width: 65,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    textAlign: "center",
  },
  maxScoreSuffix: { fontSize: 14, fontWeight: "800", color: "#64748B", marginRight: 6 },
  saveButton: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 11,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 12 },

  // Modal Styles (Light Purple Modal Theme)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
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
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalCardContent: { padding: 28, alignItems: "center" },
  successBadgeContainer: { marginBottom: 16 },
  successBadgeIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8B5CF6" },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#7C3AED", letterSpacing: 0.8 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", textAlign: "center", marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalActionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
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