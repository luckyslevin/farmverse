import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { List, Divider, Avatar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { userAtom } from '@/stores/user';
import { useAtomValue } from 'jotai';


export default function ConversationList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userAtom);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      const unsubscribe = firestore()
        .collection('conversations')
        .where('participants', 'array-contains', currentUser.id)
        .orderBy('updatedAt', 'desc')
        .onSnapshot(async (snapshot) => {
          if (!snapshot.empty) {
            const fetchedConversations = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const conversationData = doc.data();
                const otherUserId = conversationData.participants.find(
                  (id) => id !== currentUser.id
                );

                const userDoc = await firestore()
                  .collection('users')
                  .doc(otherUserId)
                  .get();

                  const user = userDoc.exists
                  ? userDoc.data()
                  : { firstName: 'Unknown User' };

                return {
                  id: doc.id,
                  ...conversationData,
                  user: user,
                };
              })
            );
            setConversations(fetchedConversations);
          } else {
            console.log('No conversations found.');
            setConversations([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching conversations:', error);
          setLoading(false);
        });

      return () => unsubscribe();
    };

    fetchConversations();
  }, []);

  const renderItem = ({ item }) => (
    <View>
      <List.Item
        title={item?.user?.firstName}
        description={item.lastMessage.text}
        descriptionNumberOfLines={1}
        right={() => <Text>{item.lastMessage?.timestamp?.toDate()?.toLocaleString()}</Text>}
        left={() =>
          item.user?.avatarUrl ? (
            <Avatar.Image
              size={40}
              source={{ uri: item.user?.avatarUrl }}
            />
          ) : (
            <Avatar.Text size={40} label={item.user?.firstName?.charAt(0)} />
          )
        }
        onPress={() =>
          router.push({
            pathname: '/(app)/(farmer)/message/[conversationId]',
            params: { conversationId: item.id, userName: item.firstName, userId: item.user.id },
          })
        }
        style={styles.listItem}
      />
      <Divider style={styles.divider} />
    </View>
  );

  if (loading) {
    return <Text>Loading conversations...</Text>;
  }

  if (conversations.length === 0) {
    return <Text>No conversations found.</Text>;
  }

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
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 5,
  },
});