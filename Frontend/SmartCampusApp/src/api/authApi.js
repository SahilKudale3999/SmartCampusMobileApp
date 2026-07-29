import api from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);

  const responseData = response.data.data;
  const token = responseData.token;
  const user = responseData.user;

  if (token) {
    await AsyncStorage.setItem("token", token);
  }

  if (user) {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);

  const responseData = response.data.data;
  const token = responseData.token;
  const user = responseData.user;

  if (token) {
    await AsyncStorage.setItem("token", token);
  }

  if (user) {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};