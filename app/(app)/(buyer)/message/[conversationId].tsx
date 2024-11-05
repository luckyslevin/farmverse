import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import firestore, { serverTimestamp } from "@react-native-firebase/firestore";

import { GiftedChat } from "react-native-gifted-chat";
import { useAtomValue } from "jotai";
import { userAtom } from "@/stores/user";

const Page = () => {
  const [messages, setMessages] = useState([]);
  const { conversationId, userName, userId } = useLocalSearchParams();
  const currentUser = useAtomValue(userAtom);

  // useFocusEffect(
  //   useCallback(() => {

  //     const unsubscribe = firestore()
  //       .collection("messages")
  //       .where("conversationId", "==", conversationId) // Replace with actual conversation ID
  //       .orderBy("timestamp", "desc")
  //       .onSnapshot((snapshot) => {
  //         if (snapshot != null) {
  //           const loadedMessages = snapshot?.docs.map((doc) => ({
  //             _id: doc.id,
  //             text: doc.data().text,
  //             createdAt: doc.data().timestamp.toDate(),
  //             user: { _id: doc.data().senderId, name: doc.data().senderName },
  //           }));
  //           setMessages(loadedMessages);
  //         }
  //       });
  //     return unsubscribe;
  //   }, [conversationId])
  // );

  useEffect(() => {
    if (!conversationId) {
      console.error("Invalid conversationId:", conversationId);
      return;
    }
  
    const unsubscribe = firestore()
      .collection("messages")
      .where("conversationId", "==", conversationId) // Replace with actual conversation ID
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        if (snapshot != null) {
          const loadedMessages = snapshot?.docs.map((doc) => {
            console.log(doc.data())
            return {
            _id: doc.id,
            text: doc.data().text,
            createdAt: doc.data()?.timestamp?.toDate(),
            user: { _id: doc.data().senderId, name: doc.data().senderName },
          }}
        );
          setMessages(loadedMessages);
        }
      });
    return () => unsubscribe();
  }, [conversationId]);

  const onSend = (newMessages = []) => {
    try {
    const message = newMessages[0];
    const timestamp = serverTimestamp();
    firestore().collection("messages").add({
      conversationId: conversationId, // Replace with actual conversation ID
      text: message?.text,
      timestamp: timestamp,
      senderId: currentUser?.id, // Replace with the current user's ID
      senderName: currentUser?.firstName,
    });

    firestore()
      .collection("conversations")
      .doc(conversationId)
      .update({
        lastMessage: {
          text: message.text,
          timestamp: timestamp,
          senderId: currentUser?.id,
        },
        updatedAt: timestamp,
      });

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  } catch (error) {
    console.error("Error sending message:", error);
  }
  };

  return (
    <>
      {/* <Stack.Screen options={{ }} /> */}
      <GiftedChat
        messages={messages}
        renderUsernameOnMessage={true}
        renderAvatarOnTop={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.id,
          name: currentUser?.firstName,
        }}
      />
    </>
  );
};

export default Page;
