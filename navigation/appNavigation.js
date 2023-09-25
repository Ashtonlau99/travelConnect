import {
  View,
  Text,
  LogBox,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPassword from "../screens/ForgotPassword";
import SearchScreen from "../screens/SearchScreen";
import ItineraryScreen from "../screens/ItineraryScreen";
import AddTripScreen from "../screens/AddTripScreen";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import TripsListScreen from "../screens/TripsListScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import GCurrency from "../screens/gCurrency";
import GTranslate from "../screens/gTranslate";

import useAuth from "../hooks/useAuth";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/user";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  HomeIcon as HomeOutline,
  MagnifyingGlassIcon as MagnifyingGlassOutline,
  BookOpenIcon as BookOpenOutline,
  BellIcon as BellOutline,
  UserIcon as UserOutline,
} from "react-native-heroicons/outline";
import {
  HomeIcon as HomeSolids,
  MagnifyingGlassIcon as MagnifyingGlassSolids,
  BookOpenIcon as BookOpenSolids,
  BellIcon as BellSolids,
  UserIcon as UserSolids,
} from "react-native-heroicons/solid";
import { themeColors } from "../theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ios = Platform.OS == "ios";

LogBox.ignoreLogs(["A non-serializable value was detected in the state"]);

export default function AppNavigation() {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  onAuthStateChanged(auth, (u) => {
    dispatch(setUser(u));
  });

  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
            component={BottomTabs}
          />
          <Stack.Screen
            name="AddTrip"
            options={{ headerShown: false }}
            component={AddTripScreen}
          />
          <Stack.Screen
            name="TripsList"
            options={{ headerShown: false }}
            component={TripsListScreen}
          />
          <Stack.Screen
            name="TripDetails"
            options={{ headerShown: false }}
            component={TripDetailScreen}
          />
          <Stack.Screen
            name="Settings"
            options={{ headerShown: false }}
            component={SettingsScreen}
          />
          <Stack.Screen
            name="EditProfile"
            options={{ headerShown: false }}
            component={EditProfileScreen}
          />
          <Stack.Screen
            name="GCurrency"
            options={{ headerShown: false }}
            component={GCurrency}
          />
          <Stack.Screen
            name="GTranslate"
            options={{ headerShown: false }}
            component={GTranslate}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            options={{ headerShown: false }}
            component={WelcomeScreen}
          />
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
            component={LoginScreen}
          />
          <Stack.Screen
            name="SignUp"
            options={{ headerShown: false }}
            component={SignUpScreen}
          />
          <Stack.Screen
            name="ForgotPassword"
            options={{ headerShown: false }}
            component={ForgotPassword}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => menuIcons(route, focused),
        tabBarStyle: {
          marginBottom: 20,
          borderRadius: 60,
          backgroundColor: themeColors.lightgrey,
          marginHorizontal: 20,
          alignItems: "center",
        },
        tabBarItemStyle: {
          marginTop: ios ? 30 : 0,
        },
      })}
    >
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Itinerary" component={ItineraryScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const menuIcons = (route, focused) => {
  let icon;
  if (route.name === "Explore") {
    icon = focused ? (
      <HomeSolids size="30" color={themeColors.blue} />
    ) : (
      <HomeOutline size="30" strokeWidth={2} color={themeColors.blue} />
    );
  } else if (route.name === "Search") {
    icon = focused ? (
      <MagnifyingGlassSolids size="30" color={themeColors.blue} />
    ) : (
      <MagnifyingGlassOutline
        size="30"
        strokeWidth={2}
        color={themeColors.blue}
      />
    );
  } else if (route.name === "Itinerary") {
    icon = focused ? (
      <BookOpenSolids size="30" color={themeColors.blue} />
    ) : (
      <BookOpenOutline size="30" strokeWidth={2} color={themeColors.blue} />
    );
  } else if (route.name === "Activities") {
    icon = focused ? (
      <BellSolids size="30" color={themeColors.blue} />
    ) : (
      <BellOutline size="30" strokeWidth={2} color={themeColors.blue} />
    );
  } else if (route.name === "Profile") {
    icon = focused ? (
      <UserSolids size="30" color={themeColors.blue} />
    ) : (
      <UserOutline size="30" strokeWidth={2} color={themeColors.blue} />
    );
  }
  return <View>{icon}</View>;
};
