import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Avatar, IconButton, Divider } from "react-native-paper";

const conversations = [
  {
    id: "1",
    title: "Ken's Store",
    message: "Hey!",
    image: "https://example.com/ken.jpg",
  },
  {
    id: "2",
    title: "Rina's Store",
    message: "Hellaur, how you doin’",
    image: "https://example.com/rina.jpg",
  },
  {
    id: "3",
    title: "Han's Store",
    message: "YOHOO! Big Summer Blowout",
    image: "https://example.com/han.jpg",
  },
  {
    id: "4",
    title: "Odette",
    message: "Hellaur, how you doin’",
    image: "https://example.com/odette.jpg",
  },
  {
    id: "5",
    title: "Oaken",
    message: "YOHOO! Big Summer Blowout",
    image: "https://example.com/oaken.jpg",
  },
];

export default function Page() {
  const router = useRouter();
  console.log("index")
  
  const renderItem = ({ item }) => (
    <View>
      <List.Item
        title={item.title}
        titleStyle={styles.title}
        description={item.message}
        descriptionStyle={styles.description}
        left={() => <Avatar.Image size={50} source={{ uri: item.image }} />}
        right={() => (
          <IconButton
            icon="dots-vertical"
            onPress={() => console.log("More options")}
          />
        )}
        onPress={() =>
          router.push({
            pathname: `/(app)/(buyer)/message/[conversationId]`,
            params: { conversationId: item.id, title: item.title },
          })
        }
        style={styles.listItem}
      />
      <Divider style={styles.divider} />
    </View>
  );

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  listItem: {
    paddingVertical: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  description: {},
  divider: {
    marginVertical: 5,
  },
});
