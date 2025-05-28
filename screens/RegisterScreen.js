import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native'
import Logo from '../components/Logo'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { TextInput as PaperInput } from 'react-native-paper'; 

import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [passwordConfirm, setPasswordConfirm] = useState({ value: '', error: '' })
  const [emailVerified, setEmailVerified] = useState(false)
  const [numeroDeCompte, setNumeroDeCompte] = useState(null)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour vérifier l'email via API
  const verifyEmail = async () => {
    const emailError = emailValidator(email.value)
    if (emailError) {
      setEmail({ ...email, error: emailError })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://192.168.88.7:8080/clients/check-email?email=${encodeURIComponent(email.value)}`)
      const data = await response.json()
  
      if (!data.exists) {
        Alert.alert('Erreur', 'Veuillez contacter votre agence pour vous abonner.')
        setEmailVerified(false)
        return
      }
  
      if (data.exists && data.actif) {
        Alert.alert('Information', 'Vous avez déjà un compte. Veuillez vous connecter.')
        setEmailVerified(false)
        return
      }
  
      // Si existe et non actif
      setEmailVerified(true)
      setNumeroDeCompte(data.numeroDeCompte)
      setEmail({ ...email, error: '' })
  
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue, veuillez réessayer.')
    }
  
    setLoading(false)
  }
  

  // Fonction d'activation du compte (mot de passe + email)
  const activateAccount = async () => {
    const passwordError = passwordValidator(password.value)
    const passwordConfirmError = passwordConfirm.value !== password.value ? 'Les mots de passe ne correspondent pas.' : ''
    setPassword({ ...password, error: passwordError })
    setPasswordConfirm({ ...passwordConfirm, error: passwordConfirmError })

    if (passwordError || passwordConfirmError) return

    setLoading(true)
    try {
      // Appel API activation compte
      const response = await fetch(`http://192.168.88.7:8080/clients/activer-compte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          motDePasse: password.value,
        }),
      })
      const data = await response.json()

      if (data.success) {
        console.log(data);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard', params: { numeroDeCompte: data.numeroDeCompte } }],
        })
      } else {
        Alert.alert('Erreur', data.message || 'Activation échouée')
      }
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue, veuillez réessayer.')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 50 }}>
    <View style={styles.container}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      
      <View style= {styles.logoContainer}>
        <Logo style={ styles.logo }/>
      </View>

      <Animatable.View animation="pulse" duration={1000} style={styles.animatedView}>
        <TextInput
          label="Email"
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => {
            setEmail({ value: text, error: '' })
            setEmailVerified(false) // reset si on change l'email
            setPassword({ value: '', error: '' })
            setPasswordConfirm({ value: '', error: '' })
            setNumeroDeCompte(null)
          }}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          editable={!emailVerified} // bloque si email validé
        />

        {emailVerified && (
            <Animatable.View animation="bounceIn" duration={800} style={styles.successIconContainer}>
              <Icon name="checkmark-circle" size={28} color="green" />
            </Animatable.View>
          )}
      </Animatable.View>

      {!emailVerified && (
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={verifyEmail} style={{ marginTop: 24 }}>
            Valider
          </Button>
        </View>
      )}

      {emailVerified && (
        <>
          <TextInput
            style={styles.customInput}
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
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
        }
          />
          <TextInput
            label="Confirmer mot de passe"
            style={styles.customInput}
            returnKeyType="done"
            value={passwordConfirm.value}
            onChangeText={(text) => setPasswordConfirm({ value: text, error: '' })}
            error={!!passwordConfirm.error}
            errorText={passwordConfirm.error}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            right={
              <PaperInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
          }
          />

          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={activateAccount} style={{ marginTop: 24 }}>
              Enregistrer
            </Button>
          </View>

        </>
      )}
      </View>
        </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignContent: 'center',
    height: 100,
    backgroundColor: '#fff',
  },
  logo: {
    width: 220,
    height: 100,
    marginLeft: 75,
  },
  animatedView: {
    marginTop: 75,
    flexDirection: 'row',       
    alignItems: 'center',       
    position: 'relative',       
  },
  successIconContainer: {
    marginLeft: 1,            
    position: 'relative',       
  },
  slimInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    width: 100,
    marginTop: 20,
    alignItems: 'center', 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le bouton horizontalement
    alignItems: 'center', // Centrer le bouton verticalement si nécessaire
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
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 80,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginVertical: 20,
    },
    button: {
      marginTop: 24,
      backgroundColor: '#007AFF',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 16,
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginBottom: 8,
    },
})
