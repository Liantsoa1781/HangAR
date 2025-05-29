// import messaging from '@react-native-firebase/messaging';

// export async function registerPushNotificationsAsync(userId, userType) {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (!enabled) {
//     alert("Permission de notifications refusée");
//     return;
//   }

//   const fcmToken = await messaging().getToken();

//   if (fcmToken) {
//     console.log('FCM Token:', fcmToken);
    
//     // Envoie le token à ton backend
//     await fetch(`http://192.168.88.7:8080/token/register?userId=${userId}&type=${userType}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'text/plain' },
//       body: fcmToken
//     });
//   }

//   return fcmToken;
// }
