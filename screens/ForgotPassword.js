import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { fetchSignInMethodsForEmail, confirmPasswordReset } from 'firebase/auth'; 
import { auth } from '../config/firebase';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleGetOTP = async () => {

  }
  const handleResetPassword = async () => {
    try {
      // Check if the email exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        Alert.alert('Email Not Found', 'The provided email does not exist.');
        return;
      }

      // Check if the passwords match
      if (newPassword !== confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
        return;
      }

      // Reset the password
      await confirmPasswordReset(auth, email, otp.join('')); 

      Alert.alert('Password Reset Successful', 'Your password has been reset successfully.');
      
    } catch (error) {
      console.error('Error resetting password:', error.message);
      Alert.alert('Password Reset Failed', 'An error occurred while resetting your password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.header}>
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backButtonInner}>
              <ArrowLeftIcon size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Reset Password</Text>
        </View>
      </SafeAreaView>

      <View style={styles.form}>
        <Text style={styles.formText}>Enter Email</Text>
        <View style={styles.emailInputContainer}>
          <TextInput
            style={styles.emailInput}
            placeholder="Email"
            value={email}
            onChangeText={(value) => setEmail(value)}
          />
          <TouchableOpacity
            onPress={handleGetOTP} // Implement this function
            style={styles.getOTPButton}
          >
            <Text style={styles.getOTPButtonText}>Get OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              placeholder=""
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
            />
          ))}
        </View>

        <Text style={styles.formText}>Create New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New Password"
          value={newPassword}
          onChangeText={(value) => setNewPassword(value)}
        />

        <Text style={styles.formText}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
        />

        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerTitle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  formText: {
    color: 'gray',
    marginVertical: 8,
    fontSize: 15,
    marginLeft: 30,
    marginRight: 30,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailInput: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    color: 'gray',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
    marginLeft: 30,

  },
  getOTPButton: {
    backgroundColor: themeColors.green,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 0.4,
    marginRight: 30,
  },
  getOTPButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'gray',
  },
  input: {
    padding: 16,
    backgroundColor: 'white',
    color: 'gray',
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'black',
    marginLeft: 30,
    marginRight: 30,


  },
  button: {
    backgroundColor: themeColors.blue,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: '',
    marginLeft: 30,
    marginRight: 30,
  },
  otpInput: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    color: 'gray',
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
    alignItems: 'center',
    

  },
});
