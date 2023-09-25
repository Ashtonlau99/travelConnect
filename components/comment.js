import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { XMarkIcon } from "react-native-heroicons/solid";
import { useSelector } from "react-redux";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ArrowRightCircleIcon } from "react-native-heroicons/solid";
import { formatDistanceToNow } from "date-fns";

const Comment = ({ isVisible, onClose, tripId }) => {
  const bottomSheetRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [currentProfilePic, setCurrentProfilePic] = useState(null);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current.expand();
    } else {
      bottomSheetRef.current.close();
    }

    const fetchProfilePic = async () => {
      if (user && user.uid) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const userProfilePic = userData.profilePic;
            setCurrentProfilePic(userProfilePic); // Store the profile pic of the current user
          } else {
            console.error("User not found.");
          }
        } catch (error) {
          console.error("Error fetching user profile picture:", error);
        }
      }
    };

    fetchProfilePic();
  }, [isVisible, user]);

  useEffect(() => {
    const fetchComments = async () => {
      const commentsQuery = query(
        collection(db, "trips", tripId, "comments"),
        orderBy("timestamp")
      );

      const unsubscribe = onSnapshot(commentsQuery, async (querySnapshot) => {
        const updatedComments = [];
        for (const doc of querySnapshot.docs) {
          const commentData = doc.data();
          const userData = await getUserData(commentData.userId);
          if (userData) {
            updatedComments.push({
              id: doc.id,
              text: commentData.text,
              timestamp: commentData.timestamp,
              user: userData,
            });
          } else {
            console.error("User not found for comment:", doc.id);
          }
        }
        setComments(updatedComments);
      });

      return () => unsubscribe();
    };

    fetchComments();
  }, [tripId]);

  const getUserData = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    try {
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData;
      } else {
        console.error("User not found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const addComment = async () => {
    if (!comment) {
      return;
    }

    const tripCommentsRef = collection(db, "trips", tripId, "comments");

    try {
      await addDoc(tripCommentsRef, {
        userId: user.uid,
        text: comment,
        timestamp: serverTimestamp(),
      });

      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["70%"]}
      index={isVisible ? 0 : -1}
      handleHeight={40}
      enablePanDownToClose={true}
      onChange={(index) => {
        if (index === -1) {
          onClose();
        }
      }}
    >
      <View style={styles.header}>
        <Text style={styles.totalCommentsText}>Comments</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <XMarkIcon size={20} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Image
              source={{
                uri:
                  item.user && item.user.profilePic ? item.user.profilePic : "",
              }}
              style={styles.profilePicture}
            />
            <View style={styles.commentTextContainer}>
              <Text style={styles.commentUserName}>
                {item.user ? item.user.username : "Unknown User"}
              </Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
            <Text style={styles.commentTimestamp}>
              {item.timestamp
                ? `${formatDistanceToNow(new Date(item.timestamp.toDate()), {
                    addSuffix: true,
                  })}`
                : "Unknown Time"}
            </Text>
          </View>
        )}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.containerInput}>
          {currentProfilePic && (
            <Image
              source={{ uri: currentProfilePic }}
              style={styles.profilePicture}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Enter your comment"
            value={comment}
            onChangeText={(value) => setComment(value)}
          />
          <TouchableOpacity onPress={addComment}>
            <ArrowRightCircleIcon size={30} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  totalCommentsText: {
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  commentUserName: {
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 16,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginRight: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  containerInput: {
    padding: 10,
    flexDirection: "row",
  },
  input: {
    backgroundColor: "lightgrey",
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  container: {
    justifyContent: "flex-end",
    flex: 1,
    padding: 10,
    marginBottom: 10,
  },
});

export default Comment;
