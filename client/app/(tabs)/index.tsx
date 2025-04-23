import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");

  useEffect(() => {
    registerForPushNotifications().then(
      (token) => token && setExpoPushToken(token)
    );

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification Received:", notification);
        Alert.alert(
          notification.request.content.title || "New Notification",
          notification.request.content.body || "Check your app for details."
        );
      }
    );

    return () => subscription.remove();
  }, []);

  async function registerForPushNotifications() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      Alert.alert("Must use a physical device for push notifications");
    }

    console.log("first",token)
    return token;
  }

  const sendPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert("Error", "Expo push token is not available.");
      return;
    }

    if (!notificationTitle || !notificationBody) {
      Alert.alert("Error", "Please enter a title and body.");
      return;
    }

    const apiUrl = "http://10.58.158.121:3000/send-notification"; // Replace with your server URL

    await axios
      .post(apiUrl, {
        to: expoPushToken,
        title: notificationTitle,
        body: notificationBody,
        data: { from: "ExpoApp" },
      })
      .then((res) => {
        console.log("Notification sent successfully:", res.data);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText>Send Expo Push Notification</ThemedText>
      {expoPushToken ? (
        <Text>Expo Push Token: {expoPushToken}</Text>
      ) : (
        <Text>Fetching Expo Push Token...</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Notification Title"
        value={notificationTitle}
        onChangeText={setNotificationTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Notification Body"
        value={notificationBody}
        onChangeText={setNotificationBody}
      />

      <Button title="Send Notification" onPress={sendPushNotification} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
