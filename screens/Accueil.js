import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Paragraph from '../components/Paragraph';
import Boutton from '../components/Button';
import Logo from '../components/Logo';

function Accueil({ navigation }) {
  const bienvenu = "Bienvenu sur votre espace Hang'AR";
  const footer = "Cette application n'est utilisable que par les abonnés de Hang'AR";

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