import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppNavigation from './navigation/appNavigation';
import { Provider } from 'react-redux';

import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { store } from './redux/store';


export default function App() {

  //SplashScreen.preventAutoHideAsync();
  //setTimeout(SplashScreen.hideAsync, 3000);

  return (
    <Provider store={store}>
      <AppNavigation />
    </Provider>
    
  );
}
