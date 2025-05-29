import React, { useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Alert} from 'react-native'
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext';

import HamburgerMenu from '../components/HamburgerMenu';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import Planning from '../components/Planning';

export default function Dashboard({ navigation , route }) {
  const { user, setUser } = useUser();
  const { numeroDeCompte } = route.params || {};
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const links = [
    { label: 'Accueil', screen: 'Accueil' },
    { label: 'Mes Abonnements', screen: 'ListeAbonnements', params: { numeroDeCompte } },
    { label: 'Mes réservations', screen: 'HistoriqueReservation', params: { numeroDeCompte } },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

    <View style= {styles.container}>
      {/* {isMenuVisible && (
        <View>
          <HamburgerMenu links={links} navigation={navigation} onClose={toggleMenu} />
        </View>
        )} */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
              <Entypo name="menu" size={30} color="black" />
            </TouchableOpacity>


            <TouchableOpacity onPress={() => setShowProfile(prev => !prev)} style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={33} color="black" />
            </TouchableOpacity>
          </View>

          {showProfile && (
          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}> 👤 {user.nom} {user.prenom} </Text>
            <Text>Compte : {user.numero_de_compte}</Text>
          
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  'Déconnexion',
                  'Voulez-vous vraiment vous déconnecter ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Oui',
                      onPress: () => {
                        setUser(null);
                        setShowProfile(false);
                        navigation.reset({ index: 0, routes: [{ name: 'Connexion' }] });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text style={{ color: 'white' }}>Déconnexion</Text>
           </TouchableOpacity>
          </View>
          )}

      <View style= {styles.logoContainer}>
        <Logo style={ styles.logo }/>
      </View>

      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >

      <Planning numeroDeCompte={numeroDeCompte} />

        <Footer />

        </ScrollView>
      </KeyboardAvoidingView>

    </View>
    </SafeAreaView>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  scrollContainer: {
    marginTop: 20,
    flex: 1,
  },
  logoContainer: {
    alignContent: 'center',
    marginTop: 15,
    height: 100,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 220,
    height: 100,
    marginLeft: 75,
  },
    profileCard: {
      position: 'absolute',
      top: 50,
      right: 15,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      zIndex: 2000,
    },
  profileTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  }
});
