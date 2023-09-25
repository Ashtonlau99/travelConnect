import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlusCircleIcon } from "react-native-heroicons/solid";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";

const ItineraryScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [yourItineraries, setYourItineraries] = useState([]); 
  const [favoriteTrips, setFavoriteTrips] = useState([]); 
  const navigation = useNavigation();
  
  const fetchData = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserData(userData);
        } else {
          console.log("User document does not exist.");
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    }

    // Fetch your itineraries using a Firestore query
    if (user) {
      const itineraryCollectionRef = collection(db, "trips");
      const q = query(itineraryCollectionRef, where("userId", "==", user.uid));

      try {
        const querySnapshot = await getDocs(q);
        const itinerariesData = [];

        querySnapshot.forEach((doc) => {
          const itinerary = doc.data();
          itinerary.id = doc.id;
          itinerariesData.push(itinerary);
        });

        setYourItineraries(itinerariesData);
      } catch (error) {
        console.error("Error fetching your itineraries:", error);
      }
    }
    // Fetch saved itineraries
    if (user) {
      const tripsCollectionRef = collection(db, "trips"); // Reference to the "trips" collection

      try {
        const querySnapshot = await getDocs(tripsCollectionRef);
        const savedItinerariesData = [];

        // Iterate through each trip document
        for (const doc of querySnapshot.docs) {
          const tripData = doc.data();
          tripData.id = doc.id;

          // Fetch the "favorites" subcollection for this trip
          const favoritesCollectionRef = collection(
            db,
            "trips",
            doc.id,
            "favorites"
          );
          const favoritesQuerySnapshot = await getDocs(favoritesCollectionRef);
          const favoritesData = favoritesQuerySnapshot.docs.map((doc) =>
            doc.data()
          );

          // Check if the current user's ID exists in the "favorites" subcollection
          const userFavorite = favoritesData.find(
            (favorite) => favorite.userId === user.uid
          );

          if (userFavorite) {
            savedItinerariesData.push(tripData);
          }
        }

        setFavoriteTrips(savedItinerariesData);
      } catch (error) {
        console.error("Error fetching saved itineraries:", error);
      }
    }
  };

  useEffect(() => {
    fetchData(); // Call the fetchData function
  }, [user]);

  // Use useFocusEffect to refresh the screen when it gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData(); // Fetch your trips again when the screen is focused
    }, [])
  );

  const renderYourItineraryCard = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("TripDetails", {
            tripId: item.id,
          })
        }
        style={styles.itineraryCard}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itineraryCoverImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.itineraryTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const renderFavoriteTripCard = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("TripDetails", {
            tripId: item.id,
          })
        }
        style={styles.itineraryCard}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.itineraryCoverImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.itineraryTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {userData ? (
          <>
            <Image
              source={{ uri: userData.profilePic }}
              style={styles.profilePic}
            />
            <Text style={styles.username}>{userData.username}</Text>
          </>
        ) : (
          <Text>Loading user data...</Text>
        )}
      </View>
      {/* Separation Line */}
      <View style={styles.separator} />

      {/* Your Itineraries */}
      <Text style={styles.sectionTitle}>Your Itineraries</Text>
      <ScrollView
        horizontal
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      >
        {yourItineraries.map((item, index) => (
          <View key={index} style={styles.itineraryCardContainer}>
            {renderYourItineraryCard({ item })}
          </View>
        ))}
        {/* Add button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AddTrip")}
          style={styles.plusIcon}
        >
          <PlusCircleIcon size={30} />
        </TouchableOpacity>
      </ScrollView>

      {/* Saved Itineraries */}
      <Text style={styles.sectionTitle}>Saved Itineraries</Text>
      <ScrollView
        horizontal
        contentContainerStyle={styles.scrollContainer}
        showsHorizontalScrollIndicator={false}
      >
        {favoriteTrips.map((item, index) => (
          <View key={index} style={styles.itineraryCardContainer}>
            {renderFavoriteTripCard({ item })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: "white",
    padding: 10,
    paddingHorizontal: 150,
    borderRadius: 10,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  separator: {
    height: 1,
    width: "80%",
    backgroundColor: "#E0E0E0",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    marginRight: 230,
  },
  scrollView: {
    marginTop: 10,
    marginBottom: 10,
    height: hp(35),
  },
  itineraryCard: {
    width: wp(40),
    height: hp(25),
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itineraryCardContainer: {
    marginRight: wp(5),
  },
  plusIcon: {
    width: wp(20),
    height: hp(25),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 10,
  },
  itineraryCoverImage: {
    borderRadius: 10,
    width: wp(40),
    height: hp(25),
  },
  gradient: {
    width: wp(40),
    height: hp(25),
    borderRadius: 10,
    position: "absolute",
    bottom: 0,
  },
  itineraryTitle: {
    fontSize: wp(4),
    color: "white",
    fontWeight: "bold",
    position: "absolute",
    bottom: 10,
    left: 10,
  },
});

export default ItineraryScreen;
