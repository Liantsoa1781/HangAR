import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const DetailsAbonnement = ({ route, navigation }) => {
  const { numeroDeCompte } = route.params;
  const [abonnements, setAbonnements] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch(`http://192.168.88.7:8080/abonnement/detail?numeroDeCompte=${numeroDeCompte}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAbonnements(data);

          } else {
            console.warn("Aucun abonnement trouvé.");
          }
        })
        .catch(err => console.error('Erreur:', err));
    });  
    return unsubscribe;
  }, [navigation, numeroDeCompte]);
  

  const isRenewable = (abonnement) => {
    if (!abonnement) return false;
  
    const statut = abonnement.statut?.toLowerCase();
    const expirationDate = abonnement.dateExpiration ? new Date(abonnement.dateExpiration) : null;
    const today = new Date();
  
    if (statut === 'expiré') {
      return true;
    }
  
    if (statut === 'en cours' && expirationDate) {
      const diff = (expirationDate - today) / (1000 * 60 * 60 * 24);
      return diff <= 3;
    }
  
    return false;
  };  

  if (abonnements.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
         <View style={{ padding: 20, marginTop: 20 }}>
         <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Aucun abonnement actif.</Text>
          <View style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
              <Button mode="contained" onPress={() => navigation.navigate('AjouterAbonnement', { numeroDeCompte: numeroDeCompte })}>
                  Nouvel Abo 
              </Button>
          </View>
      </View>
      </SafeAreaView>
    );
  }  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 50 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <Icon name="arrow-back" size={26} color="#000" />
                <Text style={styles.closeButtonText}>Retour</Text>
            </TouchableOpacity>
          
          <Text style={styles.title}>Détails des abonnements de</Text>
          <Text style={{ fontSize : 17 , textAlign: 'center', fontFamily: 'areal', marginBottom: 15}}>{abonnements[0]?.nomClient}  {abonnements[0]?.prenomClient} </Text>

          {abonnements.map((abonnement, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.label}>Type :</Text>
              <Text style={styles.value}>{abonnement.typeAbonnement}</Text>

              {abonnement.typeAbonnement === 'Abonnement Mensuel' && (
                <>
                  <Text style={styles.label}>Discipline :</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text style={styles.value}>{abonnement.discipline}</Text>
                    {abonnement.categorie && (
                      <Text style={[styles.valueCategorie, { marginLeft: 7 }]}>
                        {abonnement.categorie}
                        {abonnement.sousCategorie && (
                          <Text style={styles.value}> ({abonnement.sousCategorie})</Text>
                        )}
                      </Text>
                    )}
                  </View>
                </>
              )}

              <Text style={styles.label}>Début :</Text>
              <Text style={styles.value}>{new Date(abonnement.dateAbonnement).toLocaleDateString('fr-FR')}</Text>

              {abonnement.dateExpiration && (
                <>
                  <Text style={styles.label}>Expiration :</Text>
                  <Text style={styles.value}>{new Date(abonnement.dateExpiration).toLocaleDateString('fr-FR')}</Text>
                </>
              )}

              {abonnement.typeAbonnement === 'Carnet' && (
                <>
                  <Text style={styles.label}>Statut :</Text>
                  <Text style={[styles.value, { color: abonnement.statut?.toLowerCase() === 'expiré' ? 'red' : 'green' }]}>
                    {abonnement.statut || 'Inconnu'}
                  </Text>

                    <Text style={styles.label}>Séances effectuées :</Text>
                    <Text style={styles.value}>{abonnement.seancesEffectuees}</Text>

                    <Text style={styles.label}>Séances restantes :</Text>
                    <Text style={styles.value}>{abonnement.seancesRestantes}</Text>
                </>
              )}

              {abonnement.typeAbonnement === 'Abonnement Mensuel' && (
                <>
                  {/* Afficher le statut */}
                  <Text style={styles.label}>Statut :</Text>
                  <Text style={[styles.value, { 
                    color: abonnement.statut?.toLowerCase() === 'expiré' ? 'red' : 'green' 
                  }]}>
                    {abonnement.statut || 'Inconnu'}
                  </Text>

                  {/* Afficher les jours restants seulement si > 0 */}
                  {abonnement.joursRestants > 0 && abonnement.statut?.toLowerCase() !== 'à venir' && (
                    <>
                      <Text style={styles.label}>Jours restants avant l'expiration :</Text>
                      <Text style={styles.value}>{abonnement.joursRestants} jours</Text>
                    </>
                  )}
                </>
              )}

              {isRenewable(abonnement) ? (
                    <View style={styles.buttonWrapper}>
                      <TouchableOpacity
                        style={styles.renewButton}
                        onPress={() => navigation.navigate('RenouvellementPage', {
                          idAbonnement: abonnement.id, // ou l’identifiant correct de l’abonnement
                          numeroDeCompte: numeroDeCompte,
                        })}
                      >
                        <Text style={styles.renewButtonText}>Renouveler →</Text>
                      </TouchableOpacity>
                   </View>
                  ) : (
                    <Text style={styles.nonRenewable}>Non renouvelable pour le moment</Text>
                  )}
                </View>
              ))}

            <View style={{ marginTop: 10, flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                <Button mode="contained" onPress={() => navigation.navigate('AjouterAbonnement', { numeroDeCompte: route.params.numeroDeCompte })}>
                    Nouvel Abo 
                </Button>
            </View>
              
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 10,
    borderLeftWidth: 6,           
    borderLeftColor: '#4A90E2',  
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
  },
  value: {
    color: '#222',
  },
  buttonWrapper: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loading: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  seanceBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
    marginBottom: 10,
  },
  seanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  seanceDetail: {
    fontSize: 14,
    color: '#1b5e20',
    marginTop: 4,
    paddingLeft: 8,
  },
  buttonWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  renewButton: {
    backgroundColor: '#4CAF50', // Vert
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 10,
    marginLeft: 150,
  },
  renewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nonRenewable: {
    textAlign: 'center',
    color: 'red',
    fontStyle: 'italic',
    marginTop: 10,
    fontSize: 14,
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

export default DetailsAbonnement;
