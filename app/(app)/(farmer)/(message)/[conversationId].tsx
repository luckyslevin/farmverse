import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image } from "react-native";

import { GiftedChat } from "react-native-gifted-chat";

const Page = () => {
  const [messages, setMessages] = useState([]);
  const { conversationId, title } = useLocalSearchParams();
  console.log(conversationId, title);
  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg",
        },
      },
    ]);
  }, []);
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const headerTitle = useMemo(
    () => (
      <View
        style={{
          flexDirection: "row",
          width: 220,
          alignItems: "center",
          gap: 10,
          paddingBottom: 4,
        }}
      >
        <Image
          source={{
            uri: "https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg",
          }}
          style={{ width: 40, height: 40, borderRadius: 50 }}
        />
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          {title || "Simon Grimm"}
        </Text>
      </View>
    ),
    [title]
  );

  return (
    <>
      {/* <Stack.Screen options={{ }} /> */}
      <GiftedChat
        messages={messages}
        renderUsernameOnMessage={true}
        renderAvatarOnTop={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: 1,
        }}
      />
    </>
  );
}

export default Page