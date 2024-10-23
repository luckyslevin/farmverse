import { Stack, useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

export default function Layout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Stack for handling screen transitions */}
      <Stack style={styles.stack} >
        <Stack.Screen name="store" />
      </Stack>

      {/* Bottom Navigation */}
      <Appbar style={styles.bottomNav}>
        <Appbar.Action
          icon="home"
          onPress={() => router.push('/home')}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => router.push('/browse')}
        />
        <Appbar.Action
          icon="store"
          onPress={() => router.push('/store')}
        />
        <Appbar.Action
          icon="history"
          onPress={() => router.push('/orderHistory')}
        />
        <Appbar.Action
          icon="account"
          onPress={() => router.push('/profile')}
        />
      </Appbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stack: {
    flex: 1,
  },
  bottomNav: {
    justifyContent: 'space-around',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
});