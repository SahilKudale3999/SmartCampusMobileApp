import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

import StudentNavigator from "./StudentNavigator";
import FacultyNavigator from "./FacultyNavigator";

import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
   <Stack.Navigator screenOptions={{ headerShown: false }}>

  <Stack.Navigator
  initialRouteName="Splash"
  screenOptions={{ headerShown:false }}
/>

  <Stack.Screen
    name="Login"
    component={LoginScreen}
  />

  <Stack.Screen
    name="Register"
    component={RegisterScreen}
  />

  <Stack.Screen
    name="Student"
    component={StudentNavigator}
  />

  <Stack.Screen
    name="Faculty"
    component={FacultyNavigator}
  />

</Stack.Navigator>
  );
}