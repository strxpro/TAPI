import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Archivo_600SemiBold, Archivo_700Bold } from '@expo-google-fonts/archivo';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { I18nProvider } from './src/i18n/I18nProvider';
import { TabBar } from './src/nav/TabBar';
import { ScreenHost } from './src/nav/ScreenHost';
import { Avatar } from './src/nav/Avatar';
import { cue, useFeedbackWarmUp } from './src/ui/feedback';
import { type Tab } from './src/nav/routes';
import { Splash } from './src/screens/Splash';
import { Auth } from './src/screens/Auth';
import { Discover } from './src/screens/Discover';
import { Scan } from './src/screens/Scan';
import { Profile } from './src/screens/Profile';
import { VenueDetail } from './src/screens/VenueDetail';
import { venueById } from './src/data/venues';
import { MapScreen } from './src/screens/MapScreen';
import { Trip } from './src/screens/Trip';
import { Placeholder } from './src/screens/Placeholder';
import { Prototype } from './src/screens/Prototype';
import { SmartStand } from './src/screens/SmartStand';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_600SemiBold,
    Archivo_700Bold,
    InstrumentSerif_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    // Chowamy ekran startowy także przy błędzie fontów — lepiej pokazać
    // aplikację w kroju zastępczym niż zostawić użytkownika na splashu.
    if (fontsLoaded || fontError) void SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          {MODE === 'prototype' ? <Prototype /> : MODE === 'stand' ? <StandOnly /> : <Shell />}
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Co pokazuje aplikacja:
 *
 *   'prototype' — plik z Claude Design wyświetlany 1:1 (stan bieżący)
 *   'native'    — ekrany przepisane w React Native z `src/screens/`
 *   'stand'     — sam konfigurator Smart Standu, do obejrzenia modelu 3D
 *
 * Ekrany natywne żyją dalej i będą wchodzić na miejsce prototypu pojedynczo,
 * w miarę zatwierdzania. Przełączenie to zmiana tej jednej wartości.
 */
const MODE: 'prototype' | 'native' | 'stand' = 'native';

/** Konfigurator stojaka bez paska nawigacji — do obejrzenia modelu. */
function StandOnly() {
  const { theme } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.paper }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <SmartStand />
    </View>
  );
}

function Shell() {
  const { theme } = useTheme();
  const [tab, setTabState] = useState<Tab>('discover');
  // Prototyp pokazuje szkielety Odkrywaj tylko przy powrocie na zakładkę
  // (`go()`, linia 663) — nie przy pierwszym wejściu do aplikacji.
  const [warmup, setWarmup] = useState(false);
  // `phase` z prototypu (linia 4165): splash → auth → app. Faza `biz` dojdzie
  // razem z panelem lokalu w punkcie 6.
  const [phase, setPhase] = useState<'splash' | 'auth' | 'app'>('splash');
  const [openVenue, setOpenVenue] = useState<string | null>(null);
  // Plan wyjazdu nie jest zakładką — w prototypie to osobny ekran, który
  // otwiera baner planera AI. Tak samo jak wizytówka lokalu.
  const [planner, setPlanner] = useState(false);
  const [stand, setStand] = useState(false);

  /**
   * Jedno wejście do zmiany zakładki — dla paska i dla gestu. Dzięki temu
   * stuknięcie i przesunięcie palcem czują się tak samo i nie ma sytuacji,
   * w której jedno gra dźwiękiem, a drugie nie.
   */
  const setTab = useCallback((next: Tab) => {
    setTabState((current) => {
      if (next === current) return current;
      cue('tab');
      setWarmup(next === 'discover');
      return next;
    });
    // Dotknięcie paska zamyka to, co leżało na wierzchu.
    setOpenVenue(null);
    setPlanner(false);
    setStand(false);
  }, []);
  const finishSplash = useCallback(() => setPhase('auth'), []);
  const enterApp = useCallback(() => setPhase('app'), []);

  useFeedbackWarmUp();

  const render = useCallback(() => {
    // Wizytówka przykrywa listę, tak jak `tab: 'venue'` w prototypie.
    if (openVenue) {
      const v = venueById(openVenue);
      if (v) return <VenueDetail venue={v} onBack={() => setOpenVenue(null)} />;
    }
    if (stand) return <SmartStand />;
    if (planner) return <Trip />;
    if (tab === 'discover')
      return (
        <Discover
          onOpenVenue={setOpenVenue}
          onOpenPlanner={() => setPlanner(true)}
          warmup={warmup}
        />
      );
    if (tab === 'map') return <MapScreen />;
    if (tab === 'scan') return <Scan />;
    if (tab === 'friends')
      // Znajomi: ranking, w pobliżu, zaproszenia z kodem — punkt 6.
      return <Placeholder titleKey="navFriends" step="6 / 10" />;
    return <Profile onOpenStand={() => setStand(true)} />;
  }, [tab, openVenue, planner, stand, warmup]);

  return (
    <View style={[styles.root, { backgroundColor: theme.paper }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <ScreenHost tab={tab} onTab={setTab} enabled={!openVenue && !planner && !stand}>
        {render()}
      </ScreenHost>
      {/* Awatar leży nad ekranami, ale pod arkuszami. Chowa się na skanerze
          i pod tym, co przykrywa zakładki — tak jak `showAvatar` w prototypie. */}
      <Avatar hidden={phase !== 'app' || tab === 'scan' || !!openVenue || planner || stand} name={null} />
      <TabBar tab={tab} onTab={setTab} />
      {phase === 'auth' && (
        // Logowanie i rejestracja czekają na backend — na razie każda ścieżka
        // wpuszcza do aplikacji, tak jak „Pomiń i przeglądaj" w prototypie.
        <Auth
          onGoogle={enterApp}
          onEmail={enterApp}
          onSkip={enterApp}
          onBusiness={enterApp}
        />
      )}
      {phase === 'splash' && <Splash onDone={finishSplash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
