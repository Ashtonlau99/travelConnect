import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { themeColors } from "../theme";
import { BookmarkIcon as BookmarkOutline } from "react-native-heroicons/outline";
import { BookmarkIcon as BookmarkSolid } from "react-native-heroicons/solid";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore"; // Import Firestore functions
import { db } from "../config/firebase";
import { useSelector } from "react-redux";

const TripsListScreen = ({ route }) => {
  const navigation = useNavigation();

  // Get the country title from the route parameters
  const { title } = route.params;
  const [profilePic, setProfilePic] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [trips, setTrips] = useState([]);
  const { user } = useSelector((state) => state.user);

  // Function to fetch user profile picture
  const fetchUserProfilePic = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData.profilePic;
      } else {
        return ""; // Default profile picture or handle as needed
      }
    } catch (error) {
      console.error("Error fetching user profile pic:", error);
      return ""; // Default profile picture or handle as needed
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTrips = async () => {
        // Reference to Firestore collection
        const tripsCollection = collection(db, "trips");

        // Query to get trips with matching country title
        const q = query(tripsCollection, where("country", "==", title));

        try {
          const querySnapshot = await getDocs(q);
          const tripsData = [];

          for (const doc of querySnapshot.docs) {
            const trip = doc.data();
            trip.id = doc.id;
            trip.profilePic = await fetchUserProfilePic(trip.userId); // Fetch user profile pic
            tripsData.push(trip);
          }

          setTrips(tripsData);
        } catch (error) {
          console.error("Error fetching trips:", error);
        }
      };

      fetchTrips();
    }, [title])
  );

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TripDetails", {
          tripId: item.id,
        })
      }
      style={styles.tripCard}
    >
      {/* Cover Image */}
      <Image source={{ uri: item.imageUrl }} style={styles.coverImage} />
      {/* User Profile Picture */}
      <Image source={{ uri: item.profilePic }} style={styles.userProfilePic} />
      {/* Bookmark Icon */}
      <TouchableOpacity
        onPress={() => toggleFavorite(item.id)}
        style={styles.bookmarkIcon}
      >
        {item.isFavorited ? (
          <BookmarkSolid size={24} color={themeColors.blue} />
        ) : (
          <BookmarkOutline size={24} color={themeColors.blue} />
        )}
      </TouchableOpacity>
      {/* Trip Title */}
      <View style={styles.tripTitleContainer}>
        <Text style={styles.tripTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleFavorite = async (tripId) => {
    const tripRef = doc(db, "trips", tripId); // Reference to the trip document
    const favoritesRef = collection(tripRef, "favorites"); // Reference to the favorites subcollection

    try {
      // Fetch the trip document
      const tripDoc = await getDoc(tripRef);

      if (tripDoc.exists()) {
        const tripData = tripDoc.data();

        // Check if the user has already favorited this trip
        const isFavorited = !!tripData.isFavorited;

        if (!isFavorited) {
          // If the trip is not already favorited, add it to favorites
          await addDoc(favoritesRef, {
            userId: user.uid,
            timestamp: serverTimestamp(),
          });
        } else {
          // If the trip is already favorited, delete it from favorites
          const querySnapshot = await getDocs(
            query(favoritesRef, where("userId", "==", user.uid))
          );
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        }

        // Update the trip document with the new favorite status
        await updateDoc(tripRef, {
          isFavorited: !isFavorited,
        });

        console.log("Favorite updated successfully!");

        // Update the local state to reflect the new favorite status
        setTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === tripId ? { ...trip, isFavorited: !isFavorited } : trip
          )
        );
      } else {
        console.error("Trip document not found.");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View>
              <ArrowLeftIcon size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>{title}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      >
        {trips.map((item, index) => (
          <View key={index} style={styles.tripCardContainer}>
            {renderTripItem({ item })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: themeColors.white,
  },
  header: {
    padding: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center", 
  },
  headerTitle: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    height: 200,
    overflow: "hidden", 
  },
  tripCardContainer: {
    marginBottom: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  backButton: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  userProfilePic: {
    position: "absolute",
    top: 10,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 1,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  tripTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 15,
    right: 10,
    borderRadius: 5,
    padding: 5,
  },
  bookmarkIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default TripsListScreen;
