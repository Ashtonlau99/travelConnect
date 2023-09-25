import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";

const GCurrency = () => {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("SGD");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [amount, setAmount] = useState(1);
  const [currencies, setCurrencies] = useState([]);
  const navigation = useNavigation();

  const convertCurrency = () => {
    let result = (amount / exchangeRate).toFixed(2);
    return result;
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          "https://v6.exchangerate-api.com/v6/f3301e9ab423a82efad6f8c6/latest/USD"
        );
        const data = await response.json();
        setCurrencies(Object.keys(data.conversion_rates));
        setExchangeRate(data.conversion_rates[toCurrency]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrencies();
  }, [toCurrency]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/f3301e9ab423a82efad6f8c6/latest/${fromCurrency}`
        );
        const data = await response.json();
        setExchangeRate(data.conversion_rates[toCurrency]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View>
            <ArrowLeftIcon size={20} color="black" />
          </View>
        </TouchableOpacity>
      </View>
      <Image
        source={require("../assets/images/money.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Currency Converter</Text>
      <TextInput
        style={styles.input}
        value={amount.toString()}
        onChangeText={(text) => setAmount(parseFloat(text))}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={fromCurrency}
          onValueChange={(itemValue) => setFromCurrency(itemValue)}
          testID="from-currency-dropdown"
        >
          {currencies.map((currency, index) => (
            <Picker.Item key={index} label={currency} value={currency} />
          ))}
        </Picker>
        <Picker
          style={styles.picker}
          selectedValue={toCurrency}
          onValueChange={(itemValue) => setToCurrency(itemValue)}
          testID="to-currency-dropdown"
        >
          {currencies.map((currency, index) => (
            <Picker.Item key={index} label={currency} value={currency} />
          ))}
        </Picker>
      </View>
      <Text style={styles.result}>
        {amount} {fromCurrency} = {convertCurrency()} {toCurrency}
      </Text>
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: "80%",
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 150,
  },
  picker: {
    flex: 1,
    height: 50,
    marginHorizontal: 10,
  },
  result: {
    fontSize: 25,
    marginTop: 200,
    fontWeight: "bold",
    color: "#1d3627",
  },
  image: {
    width: 100,
    height: 100,
  },
  backButton: {
    position: "absolute", 
    top: 80, 
    left: 20, 
  },
});

export default GCurrency;
