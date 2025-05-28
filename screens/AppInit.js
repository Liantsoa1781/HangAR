import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

function AppInit({ navigation }) {
  const { setUser } = useUser();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUser(user); // met à jour le contexte
          if (user.status === 'client') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard', params: { numeroDeCompte: user.numero_de_compte, email: user.email } }],
            });
          } else if (user.status === 'admin') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ListeAbonnes', params: { numeroDeCompte: user.numero_de_compte, super_admin: user.super_admin, email: user.email } }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Accueil' }],
            });
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Accueil' }],
          });
        }
      } catch (e) {
        console.error('Erreur AsyncStorage dans AppInit:', e);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Accueil' }],
        });
      }
    };
    checkUser();
  }, []);

  return null;
}

export default AppInit;
