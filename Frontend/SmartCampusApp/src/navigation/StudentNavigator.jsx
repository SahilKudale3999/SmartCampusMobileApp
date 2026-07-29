import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import StudentHomeScreen from "../screens/Student/StudentHomeScreen";
import NoticeScreen from "../screens/Student/NoticeScreen";
import EventScreen from "../screens/Student/EventScreen";
import ProfileScreen from "../screens/Student/ProfileScreen";
import SubjectScreen from "../screens/Student/SubjectScreen";
import AssignmentScreen from "../screens/Student/AssignmentScreen";
import AttendanceScreen from "../screens/Student/AttendanceScreen";
import SubmissionScreen from "../screens/Student/SubmissionScreen";
import FacultyDirectoryScreen from "../screens/Student/FacultyDirectoryScreen";
import ResultScreen from "../screens/Student/ResultScreen"; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          backgroundColor: "#FFFFFF",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName = "home";

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Notices":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "Events":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={StudentHomeScreen} />
      <Tab.Screen name="Notices" component={NoticeScreen} />
      <Tab.Screen name="Events" component={EventScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#F8FAFC" },
        headerTitleStyle: { fontWeight: "700", color: "#0F172A" },
      }}
    >
      <Stack.Screen
        name="StudentTabs"
        component={StudentTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AttendanceDetail"
        component={AttendanceScreen}
        options={{
          title: "Attendance Details",
          headerTintColor: "#2563EB",
        }}
      />
      <Stack.Screen
        name="Subjects"
        component={SubjectScreen}
      />
      <Stack.Screen
        name="Assignments"
        component={AssignmentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubmitAssignment"
        component={SubmissionScreen}
        options={{
          title: "Submit Assignment",
          headerTintColor: "#2563EB",
        }}
      />
      <Stack.Screen
        name="Submissions"
        component={SubmissionScreen}
        options={{
          title: "My Submissions",
          headerTintColor: "#2563EB",
        }}
      />
      <Stack.Screen
        name="FacultyDirectory"
        component={FacultyDirectoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}