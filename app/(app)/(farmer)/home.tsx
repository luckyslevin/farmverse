import { View } from 'react-native';
import { Text } from 'react-native-paper'
export default function Page() {
  console.log("home1")
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Products Screen</Text>
    </View>
  );
}