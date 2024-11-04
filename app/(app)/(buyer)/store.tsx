import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Avatar, Button, Card, Text, Chip } from "react-native-paper";
import firestore, { Filter } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

export default function FarmersList() {
  const [farmers, setFarmers] = useState([]);
  const router = useRouter();
  console.log("store")
  const currentUser = useAtomValue(userAtom);
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const querySnapshot = await firestore()
          .collection("users")
          .where("type", "==", "Farmer")
          .where("store", "!=", null)
          .get();

        const farmersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(farmersList);

        setFarmers(farmersList);
      } catch (e) {
        console.error(e);
      }
    };

    fetchFarmers();
  }, []);

  

  const handleChatNow = async (user) => {
    const participants = [currentUser.id, user.id].sort(); // Sort to ensure consistency
    let conversationId;

    // Step 1: Check if conversation exists
    const existingConversation = await firestore()
      .collection("conversations")
      .where("participants", "==", participants)
      .get();

    if (!existingConversation.empty) {
      // Conversation exists, use its ID
      conversationId = existingConversation.docs[0].id;
    } else {
      // Step 2: Create a new conversation
      const newConversation = await firestore()
        .collection("conversations")
        .add({
          participants,
          lastMessage: {
            text: "",
            timestamp: null,
            senderID: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      conversationId = newConversation.id;
    }
    router.push({
      pathname: "/(app)/(buyer)/message/[conversationId]",
      params: { conversationId, userName: user.firstName, userId: user.id },
    });
  };

  const renderFarmer = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          {/* <Avatar.Image size={60} source={{ uri: item.image }} /> */}
          <View style={styles.headerText}>
            <Text style={styles.type}>{item?.store?.name}</Text>
          </View>
          <Button mode="outlined" onPress={() => handleChatNow(item)}>
            Chat now
          </Button>
        </View>
        {/* <Text style={styles.stats}>
          {item.ratings} ratings Avg rating: {item.avgRating.toFixed(2)}
        </Text> */}
        <Text style={styles.description}>{item?.store?.description}</Text>
        {/* <View style={styles.tagsContainer}>
          {item.products.map((product, index) => (
            <Chip key={index} style={styles.chip}>
              {product}
            </Chip>
          ))}
        </View> */}
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={farmers}
      keyExtractor={(item) => item.id}
      renderItem={renderFarmer}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  type: {
    fontSize: 14,
  },
  stats: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    margin: 4,
  },
});
