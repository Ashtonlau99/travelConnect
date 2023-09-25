import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Countries from '../components/countries';


const ios = Platform.OS == 'ios';
const topMargin = ios ? 3 : 10; 

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollView, { marginTop: topMargin }]}>
        <View>
          <Text style={styles.headerText}>Popular</Text>
        </View>

        {/* Countries */}
        <View>
          <Countries/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 30,
    padding: 10,
    fontWeight: 'bold'
  },

});
