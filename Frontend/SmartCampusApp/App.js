import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import Colors from "./src/constants/Colors";

import LoginScreen from "./src/screens/Auth/LoginScreen";
import RegisterScreen from "./src/screens/Auth/RegisterScreen";
import StudentNavigator from "./src/navigation/StudentNavigator";
import FacultyNavigator from "./src/navigation/FacultyNavigator";
import SplashScreen from "./src/screens/SplashScreen";


const Stack = createNativeStackNavigator();


export default function App() {

  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW
  const [showSplash, setShowSplash] = useState(true);



  useEffect(() => {


    const checkUserSession = async () => {

      try {

        const token = await AsyncStorage.getItem("token");
        const userStr = await AsyncStorage.getItem("user");


        if (token && userStr) {

          const user = JSON.parse(userStr);
          const role = user.role || user.userRole;


          if (role === "STUDENT") {

            setInitialRoute("Student");

          } else if (role === "FACULTY") {

            setInitialRoute("Faculty");

          } else {

            setInitialRoute("Login");

          }


        } else {

          setInitialRoute("Login");

        }


      } catch (error) {

        console.log("Session check error:", error);
        setInitialRoute("Login");


      } finally {

        setLoading(false);

      }

    };


    checkUserSession();

    // Removed the blind 7000ms setTimeout that used to force-flip showSplash.
    // That timer racing against SplashScreen's own internal Animated.loop was
    // what caused the app to unmount mid-animation and crash/close in Expo Go.
    // showSplash is now flipped only by SplashScreen's own onFinish callback below.



  }, []);



  // SHOW CUSTOM SPLASH FIRST
  if (showSplash) {

    return <SplashScreen onFinish={() => setShowSplash(false)} />;

  }



  // JWT LOADING
  if (loading || !initialRoute) {

    return (

      <View style={styles.loaderContainer}>

        <ActivityIndicator
          size="large"
          color={Colors.primary || "#2563EB"}
        />

      </View>

    );

  }



  return (

    <NavigationContainer>

      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown:false
        }}
      >


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

    </NavigationContainer>

  );

}



const styles = StyleSheet.create({

  loaderContainer: {

    flex:1,

    justifyContent:"center",

    alignItems:"center",

    backgroundColor:"#F8FAFC",

  },

});