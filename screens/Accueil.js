import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Paragraph from '../components/Paragraph';
import Boutton from '../components/Button';
import Logo from '../components/Logo';

import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

function Accueil({ navigation }) {
  const bienvenu = "Bienvenu sur votre espace Hang'AR";
  const footer = "Cette application n'est utilisable que par les abonnés de Hang'AR";

  useEffect(() => {
    // Quand app est ouverte et notification cliquée
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data?.reservationId) {
        navigation.navigate('Reservation', { id: remoteMessage.data.reservationId });
      }
    });

    // Quand app est fermée, notification cliquée → récupération
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data?.reservationId) {
          navigation.navigate('Reservation', { id: remoteMessage.data.reservationId });
        }
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Notification reçue en foreground:', remoteMessage);
      // Optionnel : afficher une alerte ou stocker l'info
      alert(remoteMessage.notification.title + '\n' + remoteMessage.notification.body);
    });
  
    return unsubscribeForeground;
  }, []);

  return (
    <View style={styles.container}>
      <Logo/>
      <Paragraph>{bienvenu}</Paragraph>
      <Boutton  mode="contained" onPress={() => navigation.navigate('RegisterScreen')}>Je m'inscris</Boutton>
      <Boutton  mode="contained" onPress={() => navigation.navigate('Connexion')}>Je me connecte</Boutton>
      <Text style={styles.footer}>{footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 50,
    textAlign: 'center',
  },
});

export default Accueil;