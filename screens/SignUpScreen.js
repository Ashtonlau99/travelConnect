import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { themeColors } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const toggleSuccessModal = () => {
    setIsSuccessModalVisible(!isSuccessModalVisible);
  };

  const toggleErrorModal = () => {
    setIsErrorModalVisible(!isErrorModalVisible);
  };

  // Define the default profile picture as a base64-encoded string
  const defaultProfilePic =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAHwAfAMBIgACEQEDEQH/xAAbAAEBAAMBAQEAAAAAAAAAAAAAAQQFBgIDB//EADMQAAIBAwEEBwYHAQAAAAAAAAABAgMEEQUSITFBEzRRUnFygSMyYWKRsSIkM0KhweEU/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwD9aAYKgAAAAAAAAAAAAAAAAVEKgIwGAAAAAHmcowi5TaUUt7fID0DT3WrybcbWKS78lv8ARGFK9upPLr1PR4GDpQc5S1K7pv8AV212TWTb2OoU7p7DWxV7rfHwGDMAAAAACohUBGAwAAAA0Or3brVnRg/ZweHjmzc3NTobarUXGMW14nLFguSABAqbTTW5rg0QoHRabdf9VDMn7SG6Xx+Jlmg0ao6d7GOd1RNP7o35FgAABUQqAjAYAAADF1Tfp9bHYvujmzq61NVaM6b/AHRaOVlFxbjJYaeGWIgAAAFAydN69R8x0hotFo7d06nKnH+Wb0lWAAAFRCoCMBgAAABqNYsntO5pJvPvpfc24A5EG9vNNt5tzjONGT45e5+nI1s7Jxe65tmu3pCoxD3SpzrTUKa2pPgjNoadGb/Hd0Evkllm3tbalbRxSXHjJvLYUs7aNrQVOLy+Mn2s+4BAAAAqIVARgMADzOcYRcpyUYri2zxc14W1F1Kj3clzbOfu7urdTzUeIr3YLggNjc6xGOY28dt9+XD6GurX1zWzt1pJdkdyMYFQxl5YAAYXYe6dSdN5pzlHyvB4AGwoarcU91XFWPzbn9Ta2l9Qut0JbM+5Lj/pzRc80MHWg1Om6k5ONG5eeUZ/0zbEUKiFQEY8eAZi6nU6KxqtcWtleoGl1C5d1Xcs+zjugvgYpQVEBQBAUAQFAEBQAN9pF07ii6c3mdPn2o0Jl6VU6O+p7/ezF+oo6IqIVEVGYOsdRl5kZ+DB1lfkJ+KA58AhpFBAQUEAFBABQQAU+9j12h50Y5kWHXaHnQHTFQS3FSIr/9k="; // Replace with your base64-encoded image

  const handleSubmit = async () => {
    if (email && password && confirmPassword && password === confirmPassword) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Set the document ID to the UID generated in Firebase Authentication
      const userDocRef = doc(db, "users", user.uid);

      // Store user data in Firestore with the same UID as the document ID
      await setDoc(userDocRef, {
        username: username,
        email: email,
        profilePic: defaultProfilePic, // Store the base64-encoded image
        bio: "",
      });

      console.log("User data stored");

      toggleSuccessModal();

      navigation.navigate("Login");
    } else {
      toggleErrorModal();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backButtonInner}>
              <ArrowLeftIcon size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Create Account</Text>
        </View>
      </SafeAreaView>
      <View style={styles.form}>
        <Text style={styles.formText}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={(value) => setUsername(value)}
        />
        <Text style={styles.formText}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={(value) => setEmail(value)}
        />
        <Text style={styles.formText}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter your password"
          value={password}
          onChangeText={(value) => setPassword(value)}
        />
        <Text style={styles.formText}>Confirm your password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSuccessModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Account Created</Text>
            <Text>Your account has been created successfully.</Text>
            <TouchableOpacity onPress={toggleSuccessModal}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isErrorModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Error</Text>
            <Text>Passwords do not match or some fields are empty.</Text>
            <TouchableOpacity onPress={toggleErrorModal}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerTitle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    alignItems: "center",
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  formText: {
    color: "gray",
    marginVertical: 8,
    fontSize: 15,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
  },
  input: {
    padding: 16,
    backgroundColor: "white",
    color: "gray",
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "black",
    marginLeft: 30,
    marginRight: 30,
  },
  button: {
    backgroundColor: themeColors.blue,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  loginTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "gray",
  },
  loginLink: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
