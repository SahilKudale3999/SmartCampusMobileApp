import React from "react";
import { TextInput, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={Colors.gray}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default CustomInput;