import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  UserIcon as UserSolid,
  LanguageIcon as LanguageSolid,
  CurrencyDollarIcon as CurrencySolid,
  ChevronRightIcon as ChevronSolid,
} from "react-native-heroicons/solid";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { themeColors } from "../theme";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.settingItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("EditProfile");
          }}
          style={styles.settingRow}
        >
          <UserSolid size={40} color={themeColors.blue} />
          <Text style={styles.settingText}>Profile</Text>
          <ChevronSolid size={40} color={themeColors.blue} />
        </TouchableOpacity>
      </View>
      <View style={styles.settingItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GTranslate");
          }}
          style={styles.settingRow}
        >
          <LanguageSolid size={40} color={themeColors.blue} />
          <Text style={styles.settingText}>Translate</Text>
          <ChevronSolid size={40} color={themeColors.blue} />
        </TouchableOpacity>
      </View>
      <View style={styles.settingItem}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GCurrency");
          }}
          style={styles.settingRow}
        >
          <CurrencySolid size={40} color={themeColors.blue} />
          <Text style={styles.settingText}>Currency</Text>
          <ChevronSolid size={40} color={themeColors.blue} />
        </TouchableOpacity>
      </View>
      <View style={styles.logoutButton}>
        <TouchableOpacity onPress={handleSignOut} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  backButton: {
    position: "absolute",
    left: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  settingText: {
    marginLeft: 20,
    flex: 1,
    fontSize: 18,
  },
  logoutText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
  },
  logoutButton: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logout: {
    width: 250,
    height: 50,
    backgroundColor: themeColors.green,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SettingsScreen;
