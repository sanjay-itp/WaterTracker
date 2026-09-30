import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { auth } from '@/services/firebaseConfig';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Link, useRouter } from 'expo-router';
import { BackButton } from "@/components/backbutton";

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your name, email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
  // 1. Create the account in Firebase Authentication
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

  // 2. Save the full name on the user profile
  await updateProfile(cred.user, { displayName: fullName.trim() });

  // 3. Notify the user
  Alert.alert('Account created', `Welcome, ${fullName.trim()}!`, [
    { text: 'Continue', onPress: () => router.replace('../onboarding/gender') },
  ]);
} catch (error) {
  const code = error instanceof FirebaseError ? error.code : 'unknown';
  console.log('Sign-up error:', code, error);
  Alert.alert('Could not create account', getErrorMessage(code));
} finally {
  setLoading(false);
}
    // try {
    //   // 1. Create the account in Firebase Authentication
    //   const cred = await auth().createUserWithEmailAndPassword(
    //     email.trim(),
    //     password
    //   );

    //   // 2. Save the full name on the user profile
    //   await cred.user.updateProfile({ displayName: fullName.trim() });

    //   // 3. Notify the user
    //   Alert.alert('Account created', `Welcome, ${fullName.trim()}!`, [
    //     {
    //       text: 'Continue',
    //       onPress: () => navigation?.replace?.('Home'), // change to your screen name
    //     },
    //   ]);
    // } catch (error) {
    //   console.log('Sign-up error:', error.code, error.message);
    //   Alert.alert('Could not create account', getErrorMessage(error.code));
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />
          {/* Top bar: back + settings */}
          {/* <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={30} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation?.navigate?.('Settings')}
            >
              <Ionicons name="settings-sharp" size={28} color="#fff" />
            </TouchableOpacity>
          </View> */}

          {/* Heading */}
          <Text style={styles.title}>
            Create{'\n'}Account <Text style={styles.drop}>💧</Text>
          </Text>
          <Text style={styles.subtitle}>Join to start tracking your waterintake</Text>

          {/* Full name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#8FAEC4"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#8FAEC4"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#8FAEC4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={26}
                color="#3F7F78"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have account? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.('Login')}>
              <Link href="/login" style={styles.loginTextLink}>Log In</Link>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getErrorMessage(code: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase console.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const TEAL = '#5B8A85';
const INPUT_BG = '#B7D5EE';
const BORDER = '#2A1A8F';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#FDFDFD' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loginTextLink: {
        color: "#1c1f7b",
        fontSize: 16,
        textDecorationLine: "underline",
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  title: {
    fontSize: 44,
    fontWeight: '700',
    color: '#000',
    lineHeight: 52,
  },
  drop: { fontSize: 36 },
  subtitle: {
    fontSize: 17,
    color: TEAL,
    marginTop: 8,
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    color: TEAL,
    marginBottom: 8,
    marginLeft: 6,
  },
  input: {
    height: 58,
    backgroundColor: INPUT_BG,
    borderColor: BORDER,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#0B2A44',
    marginBottom: 24,
  },
  passwordWrap: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderColor: BORDER,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    color: '#0B2A44',
    height: '100%',
  },

  button: {
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1510C8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3F7F78',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: { fontSize: 18, color: '#444' },
  link: {
    fontSize: 18,
    color: '#3F7F78',
    textDecorationLine: 'underline',
  },
});