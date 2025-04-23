const express = require("express");
const bodyParser = require("body-parser");
const { Expo } = require("expo-server-sdk");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Create a new Expo SDK client
const expo = new Expo();

app.post('/send-notification', async (req, res) => {
    console.log("first mrk")
  const { to, title, body, data } = req.body;

  // Validate the push token
  if (!Expo.isExpoPushToken(to)) {
    console.error(`Push token ${to} is not a valid Expo push token`);
    return res.status(400).json({ error: 'Invalid push token' });
  }

  // Create the message payload
  const message = {
    to: to,
    sound: 'default',
    title: title,
    body: body,
    data: data || {},
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log(ticket);
    return res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
