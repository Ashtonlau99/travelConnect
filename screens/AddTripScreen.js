import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { PlusCircleIcon } from "react-native-heroicons/solid";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { themeColors } from "../theme";
import * as Progress from "react-native-progress";

const AddTripScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [expenses, setExpenses] = useState("");
  const [imageUrl, setImageUrl] = useState(null); // Cover image
  const [selectedImages, setSelectedImages] = useState([]); // Selected images
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(status === "granted");
    };
    requestPermissions(); 
  }, []);

  const calculateTotal = () => {
    const { flight, transport, food, shopping, misc } = expenses;

    // Convert expense values to numbers (assuming they are in string format)
    const flightExpense = parseFloat(flight) || 0;
    const transportExpense = parseFloat(transport) || 0;
    const foodExpense = parseFloat(food) || 0;
    const shoppingExpense = parseFloat(shopping) || 0;
    const miscExpense = parseFloat(misc) || 0;

    // Calculate the total expense
    const totalExpense =
      flightExpense +
      transportExpense +
      foodExpense +
      shoppingExpense +
      miscExpense;

    // Format the total as a string
    return totalExpense.toFixed(2); // Two decimal places
  };

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

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        // Map the selected images to an array of URIs
        const selectedImageUris = result.assets.map((asset) => asset.uri);

        // Set the first selected image as the cover image
        if (!imageUrl && selectedImageUris.length > 0) {
          setImageUrl(selectedImageUris[0]);
        }

        // Add all selected images to the selectedImages array
        setSelectedImages([...selectedImages, ...selectedImageUris]);
      } else {
        console.log("Image selection canceled or failed.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleAddTrip = async () => {
    try {
      setLoading(true);

      // Calculate the total expense
      const totalExpense = calculateTotal();

      // Upload each image to Cloud Storage and get their URLs
      const imageUrls = await Promise.all(
        selectedImages.map(async (uri) => {
          console.log("Uploading image: ", uri);
          return await uploadImageToStorage(uri);
        })
      );
      console.log("All images uploaded");

      // Upload the cover image to Cloud Storage and get its URL
      const coverImageUrl = imageUrl
        ? await uploadImageToStorage(imageUrl)
        : null;
      console.log("Cover image uploaded");

      // Create a new trip document in Firestore
      const tripCollectionRef = collection(db, "trips");
      const tripData = {
        userId: user.uid,
        title: title || "",
        country: country || "",
        city: city || "",
        details: details || "",
        expenses: {
          flight: expenses.flight || 0,
          transport: expenses.transport || 0,
          food: expenses.food || 0,
          shopping: expenses.shopping || 0,
          misc: expenses.misc || 0,
          total: totalExpense || 0,
        },
        imageUrls: imageUrls || [], 
        imageUrl: coverImageUrl || "",
      };
      console.log(tripData);
      const tripDocRef = await addDoc(tripCollectionRef, tripData);

      console.log("Trip added with ID: ", tripDocRef.id);

      navigation.navigate("Itinerary"); 
    } catch (error) {
      console.error("Error adding trip: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Progress.CircleSnail
            thickness={10}
            size={140}
            color={themeColors.green}
          ></Progress.CircleSnail>
        </View>
      ) : (
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <View>
                  <ArrowLeftIcon size={20} color="black" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.headerTitle}>
              <Text style={styles.headerText}>Add Trip</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.box}>
              <Text style={styles.imageText}>Add Images</Text>
              <TouchableOpacity onPress={pickImage}>
                <PlusCircleIcon size={30} />
              </TouchableOpacity>
              <FlatList
                data={selectedImages}
                keyExtractor={(item, index) => `${item}-${index}`} 
                horizontal
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: 100, height: 100, margin: 8 }}
                  />
                )}
              />
            </View>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={(text) => setTitle(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={country}
                onChangeText={(text) => setCountry(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={(text) => setCity(text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Details"
                multiline
                numberOfLines={4}
                value={details}
                onChangeText={(text) => setDetails(text)}
              />
              <View style={styles.headerTitle}>
                <Text style={styles.expenseTitle}>Expenses</Text>
              </View>
              <View style={styles.expense}>
                <Text style={styles.expenseText}>Flight</Text>
                <TextInput
                  style={styles.expenseInput}
                  placeholder="0"
                  value={expenses.flight}
                  onChangeText={(text) =>
                    setExpenses({ ...expenses, flight: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.expense}>
                <Text style={styles.expenseText}>Transport</Text>
                <TextInput
                  style={styles.expenseInput}
                  placeholder="0"
                  value={expenses.transport}
                  onChangeText={(text) =>
                    setExpenses({ ...expenses, transport: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.expense}>
                <Text style={styles.expenseText}>Food</Text>
                <TextInput
                  style={styles.expenseInput}
                  placeholder="0"
                  value={expenses.food}
                  onChangeText={(text) =>
                    setExpenses({ ...expenses, food: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.expense}>
                <Text style={styles.expenseText}>Shopping</Text>
                <TextInput
                  style={styles.expenseInput}
                  placeholder="0"
                  value={expenses.shopping}
                  onChangeText={(text) =>
                    setExpenses({ ...expenses, shopping: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.expense}>
                <Text style={styles.expenseText}>Misc</Text>
                <TextInput
                  style={styles.expenseInput}
                  placeholder="0"
                  value={expenses.misc}
                  onChangeText={(text) =>
                    setExpenses({ ...expenses, misc: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.line}></View>
              <View style={styles.totalExpense}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>{calculateTotal()}</Text>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTrip}
                disabled={loading}
              >
                <Text style={styles.addButtonText}>Add Trip</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: themeColors.white,
  },
  header: {
    padding: 13,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center", 
  },
  headerTitle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  box: {
    backgroundColor: themeColors.lightgrey,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageText: {
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: themeColors.lightgrey,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    padding: 12,
    backgroundColor: themeColors.white,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    backgroundColor: themeColors.green,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "grey",
  },
  expenseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 20,
  },
  expense: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  expenseText: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
  expenseInput: {
    flex: 2,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  totalExpense: {
    flexDirection: "column",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "gray",
    marginVertical: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 20,
  },
});

export default AddTripScreen;
