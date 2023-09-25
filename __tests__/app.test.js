import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux"; 
import store from "../redux/store"; 
import AppNavigation from "../navigation/appNavigation";

import "@react-navigation/testing-library/jest-utils"; 

const Stack = createNativeStackNavigator();

test("navigating to AddTripScreen works as expected", async () => {
  const { getByTestId, findByText } = render(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={AppNavigation} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );

  expect(getByTestId("home-screen")).toBeTruthy();

  fireEvent.press(getByTestId("add-trip-button"));
  
  const addTripScreen = await findByText("Add Trip");
  expect(addTripScreen).toBeTruthy();
});


