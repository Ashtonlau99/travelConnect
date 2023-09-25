import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function Countries() {
  const navigation = useNavigation();

  const data = [
    {
      title: "Indonesia",
      image: require("../assets/images/indonesia.jpg"),
    },
    {
      title: "Japan",
      image: require("../assets/images/japan.jpg"),
    },
    {
      title: "korea",
      image: require("../assets/images/korea.jpg"),
    },
    {
      title: "Malaysia",
      image: require("../assets/images/malaysia.jpg"),
    },
    {
      title: "Thailand",
      image: require("../assets/images/thailand.jpg"),
    },
    {
      title: "Vietnam",
      image: require("../assets/images/vietnam.jpg"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.cardWrapper}>
          <TouchableOpacity
            onPress={() => navigation.navigate("TripsList", { ...item })}
            style={styles.cardContainer}
          >
            <Image source={item.image} style={styles.cardImage} />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.gradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: wp(1), 
  },
  cardWrapper: {
    width: "48%", 
    marginBottom: wp(5), 
  },
  cardContainer: {
    width: "100%",
    height: wp(65),
  },
  cardImage: {
    width: "100%",
    height: wp(65),
    borderRadius: 35,
  },
  gradient: {
    width: "100%",
    height: "100%",
    position: "absolute",
    bottom: 0,
    borderRadius: 30,
  },
  textContent: {
    position: "absolute",
    bottom: 10,
    left: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: wp(4),
    color: "white",
    fontWeight: "bold",
  },
});
