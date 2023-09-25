import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { ChatBubbleBottomCenterTextIcon } from "react-native-heroicons/solid";
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
  getDoc,
  doc,
} from "firebase/firestore"; // Import Firestore functions
import { db } from "../config/firebase";
import { themeColors } from "../theme";
import Comment from "../components/comment";

const TripDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tripId } = route.params;
  const [tripDetails, setTripDetails] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [username, setUsername] = useState("");
  const [isCommentVisible, setCommentVisible] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      const tripDocRef = doc(db, "trips", tripId);

      try {
        const tripDocSnapshot = await getDoc(tripDocRef);
        if (tripDocSnapshot.exists()) {
          const tripData = tripDocSnapshot.data();
          setTripDetails(tripData);

          const userDocRef = doc(db, "users", tripData.userId);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const userProfilePhoto = userData.profilePic;
            const username = userData.username;
            setProfilePhoto(userProfilePhoto);
            setUsername(username);
          } else {
            console.error("User not found.");
          }
        } else {
          console.error("Trip not found.");
        }
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        {tripDetails ? (
          <>
            <View style={styles.userContainer}>
              <Image
                source={{ uri: profilePhoto }}
                style={styles.userProfilePhoto}
              />
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.title}>{tripDetails.title}</Text>
              <Text style={styles.location}>
                {tripDetails.city}, {tripDetails.country}
              </Text>
            </View>

            <View style={styles.horizontalScrollView}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={tripDetails.imageUrls}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.tripImage} />
                )}
              />
            </View>
            <View style={styles.separator}></View>

            {/* Details Box */}
            <View style={styles.contentContainer}>
              <View style={styles.detailsbox}>
                <Text style={styles.details}>{tripDetails.details}</Text>
              </View>
              {/* Chat Bubble Icon */}
              <View>
                <TouchableOpacity
                  onPress={() => setCommentVisible(true)}
                  style={styles.chatBubble}
                >
                  <ChatBubbleBottomCenterTextIcon size={30} color="lightblue" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Expenses Box */}
            <View style={styles.contentContainer}>
              <View style={styles.expenseBox}>
                <Text style={styles.expense}>
                  Flight: {tripDetails.expenses.flight}
                </Text>
                <Text style={styles.expense}>
                  Transport: {tripDetails.expenses.transport}
                </Text>
                <Text style={styles.expense}>
                  Food: {tripDetails.expenses.food}
                </Text>
                <Text style={styles.expense}>
                  Shopping: {tripDetails.expenses.shopping}
                </Text>
                <Text style={styles.expense}>
                  Miscellaneous: {tripDetails.expenses.misc}
                </Text>
                <Text style={styles.expense}>
                  Total: {tripDetails.expenses.total}
                </Text>
              </View>
              {/* Chat Bubble Icon */}
              <View>
                <TouchableOpacity
                  onPress={() => setCommentVisible(true)}
                  style={styles.chatBubble}
                >
                  <ChatBubbleBottomCenterTextIcon size={30} color="lightblue" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Comment Modal */}
            <Modal
              visible={isCommentVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setCommentVisible(false)}
            >
              <Comment
                isVisible={isCommentVisible}
                onClose={() => setCommentVisible(false)}
                tripId={tripId}
              />
            </Modal>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginLeft: 10,
  },
  userContainer: {
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: "white",
  },
  userProfilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  username: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  location: {
    fontSize: 15,
    color: themeColors.gray,
    marginBottom: 10,
  },
  horizontalScrollView: {
    marginVertical: 10,
  },
  tripImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.green,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  detailsbox: {
    backgroundColor: themeColors.lightgrey,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%", 
  },
  expenseBox: {
    backgroundColor: themeColors.lightgrey,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%", 
  },
  details: {
    fontSize: 16,
  },
  expense: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chatBubble: {
    right: 25,
    bottom: 10,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 
    verticalAlign: "middle",
    marginLeft: 10,
  },
});
export default TripDetailScreen;
