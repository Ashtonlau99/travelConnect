import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recommended, setRecommended] = useState([]); // Store recommended trips
  const navigation = useNavigation();

  const [numColumns, setNumColumns] = useState(2); // Initial number of columns

  useEffect(() => {
    // Fetch and display 2 columns of recommended trips initially
    fetchRecommendedTrips();
  }, []);

  // Function to fetch recommended trips
  const fetchRecommendedTrips = async () => {
    const tripsCollectionRef = collection(db, "trips");

    try {
      const querySnapshot = await getDocs(tripsCollectionRef);

      // Convert the query snapshot into an array
      const trips = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Shuffle the trips array to get random trips
      const shuffledTrips = trips.sort(() => Math.random() - 0.5);

      // Take the first 4 trips from the shuffled array
      const randomTrips = shuffledTrips.slice(0, 4);

      setRecommended(randomTrips); // Store recommended trips in the state
    } catch (error) {
      console.error("Error fetching random trips:", error);
    }
  };

  const handleSearch = async () => {
    // Create a reference to the "trips" collection
    const tripsCollectionRef = collection(db, "trips");

    try {
      // Split the user input into an array of lowercase words
      const inputWords = searchText.toLowerCase().split(" ");

      // Query the collection where "city" array contains any of the possible city names
      const cityQuery = query(
        tripsCollectionRef,
        where("city", "in", inputWords)
      );

      // Execute the query and get the results
      const cityResults = await getDocs(cityQuery);

      // Map the results to an array
      const results = cityResults.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the number of columns to 2 for search results
      setNumColumns(2);

      setSearchResults(results); // Update search results
      setSearchResultsVisible(true); // Set search results visibility to true
      console.log(results);
    } catch (error) {
      console.error("Error searching for trips:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reset search results to show recommended trips when the screen comes into focus
      setSearchText(""); // Clear the search text
      setSearchResults([]); // Clear the search results
      setSearchResultsVisible(false); // Hide the search results
    }, [])
  );

  // Render a list item
  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() =>
        navigation.navigate("TripDetails", {
          tripId: item.id,
        })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.tripImage} />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={styles.tripTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarRow}>
        <MapPinIcon size={30} color="gray" style={styles.mapPinIcon} />
        <View style={styles.searchInputContainer}>
          <TextInput
            placeholder="Search trips"
            placeholderTextColor="gray"
            style={styles.searchInput}
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
        </View>
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => handleSearch()}
        >
          <MagnifyingGlassIcon size={30} strokeWidth={3} color="gray" />
        </TouchableOpacity>
      </View>

      {searchResultsVisible ? (
        <>
          <Text style={styles.labelText}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={styles.listContent}
            numColumns={numColumns}
          />
        </>
      ) : (
        <>
          <Text style={styles.labelText}>Recommended Trips</Text>
          <FlatList
            data={recommended}
            keyExtractor={(item) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={styles.listContent}
            numColumns={numColumns}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  mapPinIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "lightgray",
    borderRadius: 25,
    flex: 1,
    paddingLeft: 15,
    height: 50,
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "gray",
    marginLeft: 10,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  tripItem: {
    flex: 1, 
    aspectRatio: 0.7,
    margin: 8, 
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  tripImage: {
    width: "100%", 
    height: "100%", 
    borderRadius: 10,
  },
  tripTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    position: "absolute",
    bottom: 0,
  },
  listContent: {
    padding: 10, 
  },
});
