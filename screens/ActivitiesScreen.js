import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useFocusEffect } from "@react-navigation/native";

const ActivitiesScreen = () => {
  // State to store the list of notifications
  const [notifications, setNotifications] = useState([]);

  // Get the user data from Redux state
  const { user } = useSelector((state) => state.user);

  useFocusEffect(
    React.useCallback(() => {
      // Fetch and set the notifications data 
      const fetchNotifications = async () => {
        try {
          if (user) {
            const tripCollectionRef = collection(db, "trips");
            const tripQuery = query(
              tripCollectionRef,
              where("userId", "==", user.uid)
            );
            const tripQuerySnapshot = await getDocs(tripQuery);
            const notificationsData = [];

            for (const tripDoc of tripQuerySnapshot.docs) {
              const tripData = tripDoc.data();

              // Query the "comments" subcollection for this trip
              const commentsCollectionRef = collection(
                db,
                "trips",
                tripDoc.id,
                "comments"
              );
              const commentsQuerySnapshot = await getDocs(
                commentsCollectionRef
              );

              for (const commentDoc of commentsQuerySnapshot.docs) {
                const commentData = commentDoc.data();

                // Fetch the username for the comment's user ID
                const commentUserId = commentData.userId;
                const commentUserDoc = doc(db, "users", commentUserId);
                const commentUserDocSnapshot = await getDoc(commentUserDoc);

                const commentNotification = {
                  id: commentDoc.id,
                  user: {
                    username: commentUserDocSnapshot.data().username,
                    profilePic: commentUserDocSnapshot.data().profilePic,
                  },
                  message: `commented on your trip`,
                  time: commentData.timestamp.toDate().toLocaleString(), // Convert timestamp to a readable format
                  tripImageUrl: tripData.imageUrl,
                };

                notificationsData.push(commentNotification);
              }

              // Query the "favorites" subcollection for this trip
              const favoritesCollectionRef = collection(
                db,
                "trips",
                tripDoc.id,
                "favorites"
              );
              const favoritesQuerySnapshot = await getDocs(
                favoritesCollectionRef
              );

              for (const favoriteDoc of favoritesQuerySnapshot.docs) {
                const favoriteData = favoriteDoc.data();

                // Fetch the username for the favorite's user ID
                const favoriteUserId = favoriteData.userId;
                const favoriteUserDoc = doc(db, "users", favoriteUserId);
                const favoriteUserDocSnapshot = await getDoc(favoriteUserDoc);

                const favoriteNotification = {
                  id: favoriteDoc.id,
                  user: {
                    username: favoriteUserDocSnapshot.data().username,
                    profilePic: favoriteUserDocSnapshot.data().profilePic,
                  },
                  message: `favorited your trip`,
                  time: favoriteData.timestamp.toDate().toLocaleString(), // Convert timestamp to a readable format
                  tripImageUrl: tripData.imageUrl,
                };

                notificationsData.push(favoriteNotification);
              }
            }

            // Sort notifications by timestamp (most recent first)
            notificationsData.sort((a, b) => {
              const timeA = new Date(a.time).getTime();
              const timeB = new Date(b.time).getTime();
              return timeB - timeA;
            });

            setNotifications(notificationsData);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      fetchNotifications();
    }, [user])
  );

  // Function to render individual notification cards
  const renderNotificationCard = ({ item }) => {
    return (
      <View style={styles.notificationCard}>
        <Image
          source={{ uri: item.user.profilePic }}
          style={styles.profilePic}
        />
        <View style={styles.notificationContent}>
          <Text>
            <Text style={styles.username}>{item.user.username}</Text>{" "}
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {item.tripImageUrl && (
          <Image source={{ uri: item.tripImageUrl }} style={styles.tripImage} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activities</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
  },
  time: {
    color: "gray",
  },
  tripImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginLeft: 12,
  },
});

export default ActivitiesScreen;
