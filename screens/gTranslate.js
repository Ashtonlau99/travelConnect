import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  keyboard,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { themeColors } from "../theme";

const GTranslate = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Korean");
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const navigation = useNavigation();

  const API_KEY = "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";

  const translateText = async () => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          messages: [
            {
              role: "user",
              content: `Translate the following ${fromLanguage} text into ${toLanguage}: "${inputText}"`,
            },

            { role: "assistant", content: "translate" },
          ],
          max_tokens: 500,
          model: "gpt-3.5-turbo",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      setTranslatedText(response.data.choices[0].message.content);

      keyboard.dissmiss();
    } catch (error) {
      console.error("Error translating: ", error.response.data);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View>
            <ArrowLeftIcon size={20} color="black" />
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <Image
          source={require("../assets/images/language.png")}
          style={styles.image}
        />
        <Text style={styles.title}>Language Translator</Text>
      </View>
      <View style={styles.dropdowncontainer}>
        <DropDownPicker
          open={openFrom}
          value={fromLanguage}
          setOpen={setOpenFrom}
          setValue={setFromLanguage}
          items={[
            { label: "English", value: "English" },
            { label: "French", value: "French" },
            { label: "German", value: "German" },
            { label: "Chinese", value: "Chinese" },
            { label: "Malay", value: "Malay" },
            { label: "Korean", value: "Korean" },
          ]}
          defaultValue={fromLanguage}
          style={styles.dropdown}
          containerStyle={{ flex: 1, alightItems: "center" }}
          onChangeItem={(item) => {
            setFromLanguage(item.value);
          }}
          testID="from-language-dropdown"
        />
        <DropDownPicker
          open={openTo}
          value={toLanguage}
          setOpen={setOpenTo}
          setValue={setToLanguage}
          items={[
            { label: "English", value: "English" },
            { label: "French", value: "French" },
            { label: "German", value: "German" },
            { label: "Chinese", value: "Chinese" },
            { label: "Malay", value: "Malay" },
            { label: "Korean", value: "Korean" },
          ]}
          defaultValue={toLanguage}
          style={styles.dropdown}
          containerStyle={{ flex: 1, alightItems: "center" }}
          onChangeItem={(item) => {
            setToLanguage(item.value);
          }}
          testID="to-language-dropdown"
        />
      </View>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setInputText(text)}
        value={inputText}
        multiline
        placeholder="Enter text to translate"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={translateText}
        testID="translate-button"
      >
        <Text style={styles.buttontext}>Translate</Text>
      </TouchableOpacity>
      <Text style={styles.title2}> Translated text:</Text>
      <Text style={styles.result}>{translatedText}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    position: "relative",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dropdowncontainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 10,
  },
  dropdown: {
    backgroundColor: "#fff",
    width: 200,
    marginTop: 50,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: "80%",
    fontSize: 16,
    marginTop: 50,
    height: 100,
  },
  result: {
    fontSize: 25,
    marginTop: 200,
    fontWeight: "bold",
    color: "#1d3627",
  },
  image: {
    width: 200,
    height: 200,
  },
  button: {
    backgroundColor: themeColors.green,
    width: 200,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontext: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  title2: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  result: {
    fontSize: 15,
    color: "black",
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
  },
});

export default GTranslate;
