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
  SafeAreaView,
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { themeColors } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setUserLoading } from "../redux/slices/user";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userLoading } = useSelector((state) => state.user);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const toggleErrorModal = () => {
    setIsErrorModalVisible(!isErrorModalVisible);
  };

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (email && password) {
      try {
        dispatch(setUserLoading(true));
        await signInWithEmailAndPassword(auth, email, password);
        dispatch(setUserLoading(false));
      } catch (error) {
        dispatch(setUserLoading(false));
        toggleErrorModal();
      }
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
            <View>
              <ArrowLeftIcon size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.image}
          />
        </View>
      </SafeAreaView>
      <View style={styles.form}>
        <Text style={styles.formText}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          value={email}
          onChangeText={(value) => setEmail(value)}
        />
        <Text style={styles.formText}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter Your Password"
          value={password}
          onChangeText={(value) => setPassword(value)}
        />
        {userLoading ? (
          <Loading />
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.button}
            testID="loginButton"
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotPassword}
        >
          <Text style={styles.buttonText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
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
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 300,
    height: 300,
  },

  formText: {
    color: "gray",
    marginLeft: 4,
    marginBottom: 8,
    marginLeft: 30,
    marginRight: 30,
    fontSize: 15,
  },
  input: {
    padding: 16,
    backgroundColor: "white",
    color: "gray",
    borderRadius: 10,
    marginBottom: 16,
    marginLeft: 30,
    marginRight: 30,
    borderColor: "black",
    borderWidth: 1,
  },
  button: {
    backgroundColor: themeColors.blue,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 30,
    marginRight: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "grey",
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginTop: 16,
    marginRight: 30,
    color: "black",
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
