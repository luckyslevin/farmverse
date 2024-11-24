import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Divider, Avatar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/stores/user';
import auth from "@react-native-firebase/auth";

export default function ProfilePage() {
  const currentUser = useAtomValue(userAtom);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newAvatarUri, setNewAvatarUri] = useState(null); // To store new avatar URI temporarily
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userRef = firestore().collection('users').doc(currentUser.id);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setUserData(data);
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.email);
          setPassword(data.password);
          setAvatarUrl(data.avatarUrl || '');
          setAddress(data.address || ''); // Set address
        } else {
          console.error("No user data found!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload new avatar image if a new image is selected
      if (newAvatarUri) {
        const filename = `${currentUser.id}_avatar.jpg`;
        const storageRef = storage().ref(`avatars/${filename}`);
        await storageRef.putFile(newAvatarUri);
        finalAvatarUrl = await storageRef.getDownloadURL();
      }

      // Update Firestore with new data
      const userRef = firestore().collection('users').doc(currentUser.id);
      await userRef.update({
        firstName,
        lastName,
        email,
        address, // Include address in Firestore update
        avatarUrl: finalAvatarUrl,
      });

      setUserData({ ...userData, firstName, lastName, email, address, avatarUrl: finalAvatarUrl });
      setAvatarUrl(finalAvatarUrl); // Update displayed avatar URL
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const selectNewAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant camera roll permissions to select an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const onCancel = () => {
    setEditing(false);
    setFirstName(userData?.firstName || "");
    setLastName(userData?.lastName || "");
    setEmail(userData?.email || "");
    setPassword(userData?.password || "");
    setAvatarUrl(userData?.avatarUrl || "");
    setAddress(userData?.address || ""); // Reset address
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={editing ? selectNewAvatar : null}>
          {newAvatarUri ? (
            <Avatar.Image size={100} source={{ uri: newAvatarUri }} style={styles.avatar} />
          ) : avatarUrl ? (
            <Avatar.Image size={100} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={100} label={firstName.charAt(0)} style={styles.avatar} />
          )}
        </TouchableOpacity>
      </View>

      {/* Name Section */}
      <View style={styles.section}>
        <Text style={styles.label}>First name</Text>
        {editing ? (
          <TextInput
            mode="outlined"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
        ) : (
          <Text style={styles.value}>{userData?.firstName || "N/A"}</Text>
        )}
      </View>
      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.label}>Last name</Text>
        {editing ? (
          <TextInput
            mode="outlined"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
        ) : (
          <Text style={styles.value}>{userData?.lastName || "N/A"}</Text>
        )}
      </View>
      <Divider style={styles.divider} />

      {/* Email Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        {editing ? (
          <TextInput
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Text style={styles.value}>{userData?.email || "N/A"}</Text>
        )}
      </View>
      <Divider style={styles.divider} />

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Address</Text>
        {editing ? (
          <TextInput
            mode="outlined"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
        ) : (
          <Text style={styles.value}>{userData?.address || "N/A"}</Text>
        )}
      </View>
      <Divider style={styles.divider} />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {editing ? (
          <>
            <Button mode="contained" style={styles.saveButton} onPress={handleSave}>
              Save
            </Button>
            <Button mode="text" style={styles.cancelButton} onPress={onCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button mode="contained" style={styles.editButton} onPress={() => setEditing(true)}>
              Edit Profile
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {},
  section: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {},
  divider: {
    height: 1,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  editButton: {
    width: '80%',
    borderRadius: 20,
    marginBottom: 10,
  },
  saveButton: {
    width: '80%',
    borderRadius: 20,
    marginBottom: 10,
  },
  cancelButton: {},
});
