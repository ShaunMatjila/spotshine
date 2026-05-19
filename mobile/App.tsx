import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Service = { id: number; name: string; description: string; price: string; duration_minutes: number };
type Booking = { id: number; scheduled_at: string; status: string; service?: Service };

type AuthState = { token: string; user: { id: number; name: string; email: string } } | null;

const Stack = createNativeStackNavigator();
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <SafeAreaView style={styles.splashContainer}>
      <Text style={styles.logo}>SpotShine</Text>
      <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 20 }} />
      <Text style={styles.splashText}>Preparing your next shine…</Text>
    </SafeAreaView>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (state: AuthState) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body: Record<string, string> = isLogin
        ? { email, password }
        : {
            name,
            email,
            phone_number: phone,
            password,
            password_confirmation: confirmPassword,
          };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to authenticate.');
      }

      await AsyncStorage.setItem('auth', JSON.stringify(data));
      onAuthenticated(data);
    } catch (error) {
      Alert.alert('Authentication failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      return Alert.alert('Reset password', 'Enter your email first.');
    }
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Password reset', 'A reset link has been sent to your email.');
      } else {
        Alert.alert('Reset failed', data?.message || 'Unable to send reset link right now.');
      }
    } catch {
      Alert.alert('Reset failed', 'Unable to send reset link right now.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.authCard}>
        <Text style={styles.title}>Welcome to SpotShine</Text>
        <Text style={styles.subtitle}>Book detailing in minutes.</Text>
        {!isLogin && <TextInput placeholder="Full name" style={styles.input} value={name} onChangeText={setName} />}
        <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
        {!isLogin && <TextInput placeholder="Phone number" style={styles.input} value={phone} onChangeText={setPhone} />}
        <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        {!isLogin && (
          <TextInput
            placeholder="Confirm password"
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}

        <Pressable style={styles.primaryButton} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create account'}</Text>}
        </Pressable>

        <View style={styles.secondaryButtonDisabled}><Text style={styles.secondaryTextMuted}>Google login (coming soon)</Text></View>
        <View style={styles.secondaryButtonDisabled}><Text style={styles.secondaryTextMuted}>Facebook login (coming soon)</Text></View>
        <Pressable onPress={() => setIsLogin(!isLogin)}><Text style={styles.link}>{isLogin ? 'Need an account? Register' : 'Already have an account? Login'}</Text></Pressable>
        <Pressable onPress={forgotPassword}><Text style={styles.link}>Forgot password?</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingScreen({ auth, navigation }: { auth: NonNullable<AuthState>; navigation: any }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }), [auth.token]);

  useEffect(() => {
    fetch(`${API_BASE}/services`).then(async (res) => setServices(await res.json()));
  }, []);

  const loadSlots = useCallback(async (serviceId: number, selectedDate: string) => {
    const response = await fetch(`${API_BASE}/time-slots?service_id=${serviceId}&date=${selectedDate}`);
    const data = await response.json();
    setSlots(data.slots || []);
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadSlots(selectedService.id, date);
    }
  }, [date, loadSlots, selectedService]);

  const book = async (slot: string) => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ service_id: selectedService?.id, scheduled_at: slot }),
    });

    if (response.ok) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Booking confirmed', body: 'Your booking request has been placed.' },
        trigger: null,
      });
      Alert.alert('Success', 'Booking placed.');
      navigation.navigate('History');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        ListHeaderComponent={<Text style={[styles.title, { marginBottom: 10 }]}>Book a wash</Text>}
        data={services}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, selectedService?.id === item.id && styles.cardSelected]} onPress={() => setSelectedService(item)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardPrice}>R{Number(item.price).toFixed(2)} · {item.duration_minutes} min</Text>
          </Pressable>
        )}
        ListFooterComponent={
          selectedService ? (
            <View style={{ marginTop: 10 }}>
              <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="YYYY-MM-DD" />
              <Text style={styles.subtitle}>Available slots</Text>
              <View style={styles.slotWrap}>
                {slots.map((slot) => (
                  <Pressable key={slot} style={styles.slot} onPress={() => book(slot)}>
                    <Text style={{ color: '#0f172a' }}>{new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function HistoryScreen({ auth }: { auth: NonNullable<AuthState> }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; data?: { message?: string } }>>([]);

  const load = async () => {
    const headers = { Authorization: `Bearer ${auth.token}` };
    const [bookingRes, notificationRes] = await Promise.all([
      fetch(`${API_BASE}/bookings`, { headers }),
      fetch(`${API_BASE}/notifications`, { headers }),
    ]);

    setBookings(await bookingRes.json());
    setNotifications(await notificationRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <Text style={styles.title}>Booking history</Text>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>{booking.service?.name}</Text>
            <Text style={styles.cardDescription}>{new Date(booking.scheduled_at).toLocaleString()}</Text>
            <Text style={styles.cardPrice}>Status: {booking.status}</Text>
          </View>
        ))}

        <Text style={[styles.subtitle, { marginTop: 16 }]}>Notifications</Text>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.note}><Text>{notification.data?.message}</Text></View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [auth, setAuth] = useState<AuthState>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('auth');
      if (stored) {
        setAuth(JSON.parse(stored));
      }
    })();
  }, []);

  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff', contentStyle: { backgroundColor: '#f1f5f9' } }}>
        {!auth ? (
          <Stack.Screen name="Auth" options={{ title: 'Sign in' }}>
            {() => <AuthScreen onAuthenticated={setAuth} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Book" options={{ title: 'Book Now' }}>
              {(props) => <BookingScreen {...props} auth={auth} />}
            </Stack.Screen>
            <Stack.Screen name="History" options={{ title: 'History' }}>
              {() => <HistoryScreen auth={auth} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' },
  logo: { color: '#f8fafc', fontSize: 38, fontWeight: '800' },
  splashText: { marginTop: 12, color: '#cbd5e1' },
  screen: { flex: 1, padding: 16 },
  authCard: { paddingVertical: 20, gap: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#334155', marginBottom: 8 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: { backgroundColor: '#0284c7', borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#94a3b8', borderRadius: 10, padding: 11, alignItems: 'center' },
  secondaryButtonDisabled: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 11, alignItems: 'center', backgroundColor: '#f8fafc' },
  secondaryText: { color: '#0f172a', fontWeight: '600' },
  secondaryTextMuted: { color: '#64748b', fontWeight: '600' },
  link: { color: '#0369a1', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardSelected: { borderColor: '#0284c7', borderWidth: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardDescription: { fontSize: 13, color: '#475569', marginTop: 4 },
  cardPrice: { fontSize: 14, marginTop: 8, color: '#0f172a', fontWeight: '600' },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  slot: { backgroundColor: '#bae6fd', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  note: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8 },
});
