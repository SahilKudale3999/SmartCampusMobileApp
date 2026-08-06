import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import FacultyHomeScreen from "../screens/Faculty/FacultyHomeScreen";
import NoticeScreen from "../screens/Faculty/NoticeScreen";
import EventScreen from "../screens/Faculty/EventScreen";
import ProfileScreen from "../screens/Faculty/ProfileScreen";

import SubjectScreen from "../screens/Faculty/SubjectScreen";
import AttendanceScreen from "../screens/Faculty/AttendanceScreen";
import StudentScreen from "../screens/Faculty/StudentScreen";
import AssignmentScreen from "../screens/Faculty/AssignmentScreen";
import GradeScreen from "../screens/Faculty/GradeScreen";
import ChatbotScreen from "../screens/ChatbotScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function FacultyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#888",

        tabBarIcon: ({ color, size }) => {
          let icon;

          switch (route.name) {
            case "Home":
              icon = "home";
              break;
            case "Notices":
              icon = "notifications";
              break;
            case "Events":
              icon = "calendar";
              break;
            case "Profile":
              icon = "person";
              break;
          }

          return (
            <Ionicons
              name={icon}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={FacultyHomeScreen}
      />

      <Tab.Screen
        name="Notices"
        component={NoticeScreen}
      />

      <Tab.Screen
        name="Events"
        component={EventScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export default function FacultyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563EB" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="FacultyTabs"
        component={FacultyTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Subjects"
        component={SubjectScreen}
        options={{ title: "My Subjects" }}
      />

      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{ title: "Take Attendance" }}
      />

      <Stack.Screen
        name="Students"
        component={StudentScreen}
        options={{ title: "Students" }}
      />

      <Stack.Screen
        name="Assignments"
        component={AssignmentScreen}
        options={{ title: "Assignments" }}
      />

      <Stack.Screen
        name="Grades"
        component={GradeScreen}
        options={{ title: "Grade Submissions" }}
      />

      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}