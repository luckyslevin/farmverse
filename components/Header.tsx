import { View } from 'react-native'
import React from 'react'
import { IconButton, useTheme } from 'react-native-paper'
import { MaterialIcons } from '@expo/vector-icons'
import auth from "@react-native-firebase/auth";
import { router } from 'expo-router';


export default function Header() {
  const theme = useTheme()


  const onLogout = () => {
    auth().signOut();
  };

  const onCartPress = () => {
    router.push("/product/cart");
  }

  return (
    <View style={{ flexDirection: "row" }}>
    <IconButton
      icon={() => (
        <MaterialIcons
          name="shopping-cart"
          size={24}
          color={theme.colors.primary}
        />
      )}
      onPress={onCartPress}
    />
    <IconButton
      icon={() => (
        <MaterialIcons
          name="logout"
          size={24}
          color={theme.colors.primary}
        />
      )}
      onPress={onLogout}
    />
  </View>
  )
}