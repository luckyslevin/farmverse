import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Divider, Text, Title } from 'react-native-paper';

const StoreScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.storeInfo}>
        <Avatar.Text size={56} label="T" style={styles.avatar} />
        <Title>Ken's Store</Title>
        <View style={styles.actionButtons}>
          <Button mode="contained" onPress={() => console.log('Edit Store')}>
            Edit Store
          </Button>
          <Button mode="outlined" onPress={() => console.log('View Store')}>
            View Store
          </Button>
        </View>
        <Button onPress={() => console.log('Remove Store')} textColor="red">
          Remove Store
        </Button>
      </View>

      <Divider />

      <View style={styles.productSection}>
        <Text>You don’t have products</Text>
        <Button mode="outlined" onPress={() => console.log('Add Product')}>
          Add Product
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5F3E5',
  },
  storeInfo: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 10,
  },
  productSection: {
    alignItems: 'center',
    marginTop: 40,
  },
});

export default StoreScreen;