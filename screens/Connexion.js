import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import axios from 'axios';

import Background from '../components/Background';
import Header from '../components/Header';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { TextInput as PaperInput } from 'react-native-paper'; 
import TextInput from '../components/TextInput'

import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';  

import { theme } from '../core/theme';
import { passwordValidator } from '../helpers/passwordValidator';

import registerPushNotificationsAsync from './registerPushNotificationsAsync';
import { useUser } from './UserContext';

function Connexion({ navigation }) {
  const { setUser } = useUser();

  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Au chargement, on vérifie si userData est déjà sauvegardé
  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const user = JSON.parse(storedData);
          if (user.status === 'client') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard', params: { numeroDeCompte: user.numero_de_compte, email: user.email } }],
            });
          } else if (user.status === 'admin') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'ListeAbonnes', params: {numeroDeCompte: user.numero_de_compte, super_admin: user.super_admin, email: user.email } }],
            });
          }
        }
      } catch (e) {
        console.log('Erreur récupération AsyncStorage:', e);
      }
    };
    checkUser();
  }, []);

  const onLoginPressed = async () => {
    let emailError = '';
    const identifiant = email.value.trim();

    const isEmail = /\S+@\S+\.\S+/.test(identifiant);
    const isNumeroCompte = /^[A-Z]{2}-\d{5,}$/.test(identifiant);

    if (!identifiant) {
      emailError = "Champ identifiant requis.";
    } else if (!isEmail && !isNumeroCompte) {
      emailError = "Entrez un email valide ou un numéro de compte.";
    }

    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    try {
      const response = await axios.post(`http://192.168.88.7:8080/auth/login`, {
        email: identifiant,
        password: password.value,
      });

      console.log('Réponse API login:', response.data);

      const { status, super_admin, email: userEmail, numero_de_compte, id, prenom, nom} = response.data;
      const userData = {
        status,
        super_admin,
        prenom,
        nom,
        email: userEmail,
        numero_de_compte,
        id,
      };
      setUser(userData);

      if (rememberMe) {
        // Sauvegarde des infos utilisateur pour reconnexion automatique
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      } else {
        await AsyncStorage.removeItem('userData');
      }

      if (status === 'admin') {
        await registerPushNotificationsAsync(id);
        navigation.reset({
          index: 0,
          routes: [{ name: 'ListeAbonnes' }],
        });
      } else if (status === 'client') {
        await registerPushNotificationsAsync(id);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Dashboard',
              params: { numeroDeCompte: numero_de_compte },
            },
          ],
        });
      } else {
        alert("Statut utilisateur inconnu.");
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Échec de la connexion. Identifiants incorrects.");
      } else {
        console.error("Erreur lors de la connexion :", error);
        alert("Erreur réseau ou serveur.");
      }
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Header>Welcome back.</Header>

      <TextInput
        label="User"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        keyboardType="default"
      />

      <TextInput
        label="Mot de passe"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        right={
          <PaperInput.Icon
            icon={showPassword ? 'eye' : 'eye-off'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Checkbox
          value={rememberMe}
          onValueChange={setRememberMe}
          color={rememberMe ? theme.colors.primary : undefined}
        />
        <Text style={{ marginLeft: 8 }}>Se souvenir de moi</Text>
      </View>

      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline'}}>
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default Connexion;
