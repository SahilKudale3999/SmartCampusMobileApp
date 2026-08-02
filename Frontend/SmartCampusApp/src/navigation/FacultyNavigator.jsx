import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FacultyHomeScreen from "../screens/Faculty/FacultyHomeScreen";
import SubjectScreen from "../screens/Faculty/SubjectScreen";
import AttendanceScreen from "../screens/Faculty/AttendanceScreen";
import StudentScreen from "../screens/Faculty/StudentScreen";
import AssignmentScreen from "../screens/Faculty/AssignmentScreen";
import GradeScreen from "../screens/Faculty/GradeScreen";

const Stack = createNativeStackNavigator();

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
        name="FacultyHome"
        component={FacultyHomeScreen}
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
    </Stack.Navigator>
  );
}
