import React, { useState } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import axios from 'axios';

import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { passwordValidator } from '../helpers/passwordValidator';
import { emailValidator } from '../helpers/emailValidator';

function InsertionAdmin({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [prenom, setPrenom] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [passwordConfirm, setPasswordConfirm] = useState({ value: '', error: '' });

  const onInsertPressed = async () => {
    const emailError = emailValidator(email.value);
    const prenomError = prenom.value ? '' : "Le prénom est requis.";
    const passwordError = passwordValidator(password.value);
    const passwordConfirmError =
      passwordConfirm.value !== password.value ? "Les mots de passe ne correspondent pas." : '';

    if (emailError || prenomError || passwordError || passwordConfirmError) {
      setEmail({ ...email, error: emailError });
      setPrenom({ ...prenom, error: prenomError });
      setPassword({ ...password, error: passwordError });
      setPasswordConfirm({ ...passwordConfirm, error: passwordConfirmError });
      return;
    }

    try {
      const response = await axios.post('http://192.168.88.7:8080/admin/add', {
        email: email.value.trim(),
        prenom: prenom.value.trim(),
        mot_de_passe: password.value,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Succès", "Administrateur ajouté avec succès !", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Erreur", "Impossible d'ajouter l'administrateur.");
      }
    } catch (error) {
      console.error("Erreur insertion admin :", error);
      Alert.alert("Erreur réseau ou serveur");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, marginTop: 15 }}>
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Header>Ajouter un Administrateur</Header>
      </View>

      <View style={styles.formContainer}>
      <TextInput
          label="Prénom"
          returnKeyType="next"
          value={prenom.value}
          onChangeText={(text) => setPrenom({ value: text, error: '' })}
          error={!!prenom.error}
          errorText={prenom.error}
        />
        
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setEmail({ value: text, error: '' })}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Mot de passe"
          returnKeyType="next"
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />

        <TextInput
          label="Confirmer mot de passe"
          returnKeyType="done"
          value={passwordConfirm.value}
          onChangeText={(text) => setPasswordConfirm({ value: text, error: '' })}
          error={!!passwordConfirm.error}
          errorText={passwordConfirm.error}
          secureTextEntry
        />

        <Button mode="contained" onPress={onInsertPressed} style={styles.button}>
          Ajouter
        </Button>
      </View>
      </View>
        </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',   
    paddingTop: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    width: '60%',
    alignSelf: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
    marginTop: -25,
  },
});

export default InsertionAdmin;
