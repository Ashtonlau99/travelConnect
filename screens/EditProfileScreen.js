import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import {
  UserIcon as UserSolid,
  DocumentTextIcon as DocumentSolid,
} from "react-native-heroicons/solid";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../config/firebase";
import { themeColors } from "../theme";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
  getDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const EditProfileScreen = () => {
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === "granted");
    };
    requestPermissions(); // Call the async function
  }, []);

  useEffect(() => {
    // Fetch user data from the database
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // Update state with user data
          setProfilePic(userData.profilePic || "");
          setUsername(userData.username || "");
          setBio(userData.bio || "");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []);

  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, "images/" + new Date().getTime());
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("File available at", downloadURL);
              resolve(downloadURL); // Resolve with the download URL
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
              reject(error);
            });
        }
      );
    });
  };

  const handleUpdate = async () => {
    try {
      const updatedUserData = {
        profilePic: profilePic,
        username: username,
        bio: bio,
      };

      // Update the user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...updatedUserData,
        updatedAt: serverTimestamp(),
      });

      navigation.navigate("Profile");
    } catch (error) {
      console.error("Error updating: ", error);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        // Upload the selected image and get its URL
        const uploadedImageUrl = await uploadImageToStorage(result.uri);
        setProfilePic(uploadedImageUrl); // Set the selected image as the new profile picture
      } else {
        console.log("Image selection canceled or failed.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: profilePic }} style={styles.profilePic} />
        <TouchableOpacity onPress={pickImage} style={styles.changePicButton}>
          <Text style={styles.changePicButtonText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Username */}
      <View style={styles.inputContainer}>
        <UserSolid size={24} color="black" />
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="Enter your username"
        />
      </View>

      {/* Bio */}
      <View style={styles.inputContainer}>
        <DocumentSolid size={24} color="black" />
        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={(text) => setBio(text)}
          placeholder="Enter your bio"
          multiline
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePicButton: {
    marginTop: 10,
    marginLeft: 16,
    backgroundColor: themeColors.green,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changePicButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 30,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: themeColors.green,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 30,
    width: 300,
  },
  saveButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  backButton: {
    position: "absolute",
    right: 200,
  },
});

export default EditProfileScreen;
