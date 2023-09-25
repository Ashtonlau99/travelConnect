import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { themeColors } from "../theme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { Cog6ToothIcon } from "react-native-heroicons/solid";

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [userData, setUserData] = useState(null);
  const [yourItineraries, setYourItineraries] = useState([]);
  const navigation = useNavigation();
  const [numTrips, setNumTrips] = useState(0);
  const [numFavorites, setNumFavorites] = useState(0);

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
        setNumTrips(itinerariesData.length);
      } catch (error) {
        console.error("Error fetching your itineraries:", error);
      }
    }
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
        setNumFavorites(savedItinerariesData.length);
      } catch (error) {
        console.error("Error fetching saved itineraries:", error);
      }
    }
  };

  useEffect(() => {
    fetchData(); 
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData(); 
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {userData ? (
            <>
              <Image
                source={{ uri: userData.profilePic }}
                style={styles.profileImage}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{userData.username}</Text>
                <Text style={styles.bio}>
                  {userData.bio ? userData.bio : "User has not set a bio"}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate("Settings");
                  }}
                >
                  <Cog6ToothIcon size={25} color={"black"} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text>Loading user data...</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statCount}>{numTrips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statCount}>{numFavorites}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.itineraryCardContainer}>
          <FlatList
            data={yourItineraries}
            keyExtractor={(item) => item.id}
            renderItem={renderYourItineraryCard}
            contentContainerStyle={styles.listContent}
            numColumns={2}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    color: "gray",
  },
  button: {
    width: 90,
    height: 30,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: themeColors.green,
    padding: 3,
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "lightgray",
    paddingVertical: 16,
  },
  stat: {
    alignItems: "center",
  },
  statCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 16,
    color: "gray",
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
    margin: 20, 
  },
  itineraryCardContainer: {
    alignItems: "center",
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
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

export default ProfileScreen;
