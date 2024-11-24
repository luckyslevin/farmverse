import { View } from "react-native";
import React from "react";
import { IconButton, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

export default function Header() {
  const theme = useTheme();
  const currentUser = useAtomValue(userAtom);
  return (
    <View style={{ flexDirection: "row" }}>
      {currentUser.type == "User" && (<><IconButton
        icon={() => (
          <MaterialIcons
            name="notifications"
            size={24}
            color={theme.colors.primary}
            onPress={() => router.push("/product/order/notification")}
          />
        )}
      />
      <IconButton
        icon={() => (
          <MaterialIcons
            name="shopping-cart"
            size={24}
            color={theme.colors.primary}
          />
        )}
        onPress={() => router.push("/product/cart")}
      />
      <IconButton
        icon={() => (
          <MaterialIcons name="logout" size={24} color={theme.colors.primary} />
        )}
        onPress={() => auth().signOut()}
      /></>)}

      {currentUser.type == "Farmer" && (<><IconButton
        icon={() => (
          <MaterialIcons
            name="notifications"
            size={24}
            color={theme.colors.primary}
            onPress={() => router.push("/orderHistory/notification")}
          />
        )}
      />
      <IconButton
        icon={() => (
          <MaterialIcons name="logout" size={24} color={theme.colors.primary} />
        )}
        onPress={() => auth().signOut()}
      /></>)}
    </View>
  );
}
