import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
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
const SLOT_LOAD_ERROR = 'Could not load available slots.';
const COLORS = {
  background: '#f5f7fb',
  surface: '#ffffff',
  surfaceDark: '#0b1120',
  surfaceTint: '#e0f2fe',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#e2e8f0',
  primary: '#0ea5e9',
  primaryDark: '#0369a1',
  accent: '#22c55e',
  accentSoft: 'rgba(34, 197, 94, 0.16)',
  border: '#e2e8f0',
  placeholder: '#94a3b8',
};
const CARD_SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 4,
};

function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <SafeAreaView style={styles.splashContainer}>
      <View style={styles.splashBadge}>
        <Text style={styles.splashBadgeText}>Premium Detailing</Text>
      </View>
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
      const raw = await response.text();
      let data: { message?: string } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          // Non-JSON error payloads are handled by fallback messaging below.
          data = null;
        }
      }

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
      <ScrollView contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Detailing on demand</Text>
          <Text style={styles.title}>Welcome to SpotShine</Text>
          <Text style={styles.subtitle}>Book a premium wash in minutes, with live updates and trusted specialists.</Text>
        </View>
        <View style={styles.authCard}>
          <Text style={styles.sectionTitle}>{isLogin ? 'Sign in' : 'Create account'}</Text>
          {!isLogin && (
            <TextInput
              placeholder="Full name"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            placeholder="Email"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          {!isLogin && (
            <TextInput
              placeholder="Phone number"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />
          )}
          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.placeholder}
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!isLogin && (
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          )}

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={submit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={isLogin ? 'Login to your SpotShine account' : 'Create your SpotShine account'}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create account'}</Text>}
          </Pressable>

          <View style={styles.secondaryButtonDisabled}>
            <Text style={styles.secondaryTextMuted}>Google login (coming soon)</Text>
          </View>
          <View style={styles.secondaryButtonDisabled}>
            <Text style={styles.secondaryTextMuted}>Facebook login (coming soon)</Text>
          </View>
          <Pressable onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.link}>{isLogin ? 'Need an account? Register' : 'Already have an account? Login'}</Text>
          </Pressable>
          <Pressable onPress={forgotPassword}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>
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

  useEffect(() => {
    if (!selectedService) {
      return;
    }

    const run = async () => {
      try {
        const response = await fetch(`${API_BASE}/time-slots?service_id=${selectedService.id}&date=${date}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || SLOT_LOAD_ERROR);
        }

        setSlots(data.slots || []);
      } catch (error) {
        setSlots([]);
        Alert.alert('Slots unavailable', error instanceof Error ? error.message : SLOT_LOAD_ERROR);
      }
    };

    run();
  }, [date, selectedService]);

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
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>On-demand detailing</Text>
            <Text style={styles.heroTitle}>Book a wash</Text>
            <Text style={styles.heroSubtitle}>Choose a package and lock in a time that suits you.</Text>
          </View>
        }
        data={services}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
              selectedService?.id === item.id && styles.cardSelected,
            ]}
            onPress={() => setSelectedService(item)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedService?.id === item.id }}
            accessibilityLabel={`${item.name} package`}
            accessibilityHint="Select this service to see available time slots"
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardPrice}>R{Number(item.price).toFixed(2)} · {item.duration_minutes} min</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          selectedService ? (
            <View style={styles.slotSection}>
              <TextInput
                value={date}
                onChangeText={setDate}
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.placeholder}
              />
              <Text style={styles.sectionTitle}>Available slots</Text>
              <View style={styles.slotWrap}>
                {slots.length ? (
                  slots.map((slot) => (
                    <Pressable key={slot} style={({ pressed }) => [styles.slot, pressed && styles.slotPressed]} onPress={() => book(slot)}>
                      <Text style={styles.slotText}>
                        {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.helperText}>No slots available yet. Try another date.</Text>
                )}
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
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Your visits</Text>
          <Text style={styles.heroTitle}>Booking history</Text>
          <Text style={styles.heroSubtitle}>Track upcoming cleans and revisit your favourites.</Text>
        </View>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>{booking.service?.name}</Text>
            <Text style={styles.cardDescription}>{new Date(booking.scheduled_at).toLocaleString()}</Text>
            <Text style={styles.cardPrice}>Status: {booking.status}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Notifications</Text>
        {notifications.map((notification) => {
          const message = notification.data?.message ?? 'You have a new notification.';
          return (
            <View key={notification.id} style={styles.note} accessibilityRole="text">
              <Text style={styles.noteText} accessibilityLabel={`Notification: ${message}`}>
                {message}
              </Text>
            </View>
          );
        })}
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
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surfaceDark },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
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
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 24,
  },
  splashBadge: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  splashBadgeText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logo: { color: '#f8fafc', fontSize: 40, fontWeight: '800', letterSpacing: 0.5 },
  splashText: { marginTop: 12, color: COLORS.textLight },
  screen: { flex: 1, paddingHorizontal: 18, paddingTop: 10, backgroundColor: COLORS.background },
  authContainer: { paddingBottom: 24 },
  hero: { marginBottom: 20, paddingTop: 8 },
  heroCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  heroEyebrow: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textLight },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 8 },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    ...CARD_SHADOW,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButtonDisabled: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceTint,
  },
  secondaryTextMuted: { color: COLORS.textMuted, fontWeight: '600' },
  link: { color: COLORS.primaryDark, marginTop: 4, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...CARD_SHADOW,
  },
  cardPressed: { transform: [{ scale: 0.99 }] },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.surfaceTint },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  cardDescription: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  cardPrice: { fontSize: 14, marginTop: 10, color: COLORS.text, fontWeight: '600' },
  slotSection: { marginTop: 4 },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  slot: {
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  slotPressed: { backgroundColor: COLORS.surfaceTint },
  slotText: { color: COLORS.text, fontWeight: '600' },
  helperText: { color: COLORS.textMuted, marginTop: 6 },
  note: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  noteText: { color: COLORS.textMuted },
});
