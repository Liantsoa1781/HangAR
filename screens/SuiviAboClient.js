import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const SuiviAboClient = ({ route, navigation }) => {
  const { idAbonnement } = route.params;
  const [abonnements, setAbonnements] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch(`http://192.168.88.7:8080/abonnement/detailById?idAbonnement=${idAbonnement}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setAbonnements([data]); // envelopper dans un tableau
          } else {
            console.warn("Aucun abonnement trouvé.");
          }
        })        
        .catch(err => console.error('Erreur:', err));
    });
  
    return unsubscribe;
  }, [navigation, idAbonnement]);

  if (abonnements.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
         <View style={{ padding: 20, marginTop: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                  <Icon name="arrow-back" size={26} color="#000" />
                  <Text style={styles.closeButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Aucun abonnement actif.</Text>
      </View>
      </SafeAreaView>
    );
  }  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 50 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
          
          <Text style={styles.title}>Détails des mes abonnements</Text>
          
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
                  <Text style={styles.label}>Séances restantes :</Text>
                  <Text style={styles.value}>{abonnement.seancesRestantes}</Text>

                  <Text style={styles.label}>Séances effectuées :</Text>
                  <Text style={styles.value}>{abonnement.seancesEffectuees}</Text>
                </>
              )}

              {abonnement.typeAbonnement === 'Abonnement Mensuel' && (
                <>
                  <Text style={styles.label}>Jours restants avant l'expiration :</Text>
                  <Text style={styles.value}>{abonnement.joursRestants} jours</Text>

                  <View style={styles.seanceBox}>
                    <Text style={styles.seanceText}>Séances restantes : {abonnement.seancesRestantes} scéances</Text>
                    {Array.isArray(abonnement.seancesRestantesDetails) ? (
                      <View style={{ marginTop: 5 }}>
                        {abonnement.seancesRestantesDetails.map((seance, idx) => (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletText}>{seance}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.seanceDetail}>{abonnement.seancesRestantesDetails}</Text>
                    )}

                  </View>
                </>
              )}

              {abonnement.typeAbonnement !== 'Carnet' && abonnement.joursRestants <= 3 && (
                <Text style={[styles.statusWarning]}>
                  ⚠️ Attention : cet abonnement expire dans {abonnement.joursRestants} jour{abonnement.joursRestants > 1 ? 's' : ''} !
                </Text>
              )}
              
              {abonnement.typeAbonnement === 'carnet' && abonnement.seancesRestantes === 1 && (
                <Text style={[styles.statusWarning]}>
                  ⚠️ Attention : il ne vous reste plus qu'une séance dans votre carnet !
                </Text>
              )}

              {abonnement.typeAbonnement === 'carnet' && abonnement.seancesRestantes === 0 && (
                <Text style={[styles.statusWarning]}>
                  ⚠️ Votre carnet est épuisé.
                </Text>
              )}

              {abonnement.typeAbonnement !== 'Carnet' && (
                <Text style={[styles.statut, abonnement.joursRestants <= 3 ? styles.statutExpiring : styles.statutOk]}>
                  Statut : {abonnement.statut}
                </Text>
                )}

                </View>
              ))}
              
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#b90244',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginTop: 2,
  },
  valueCategorie: {
    fontSize: 14,
    color: '#b90244',
    fontStyle: 'italic',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  seanceBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 5,
    borderLeftColor: '#66bb6a',
    marginBottom: 10,
  },
  seanceText: {
    fontSize: 15,
    fontWeight: '600',
  },
  seanceDetail: {
    fontSize: 14,
    marginTop: 6,
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 14,
    color: '#1b5e20',
  },
  statut: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statutExpiring: {
    color: '#d32f2f',
  },
  statutOk: {
    color: '#388e3c',
  },
  statusWarning: {
    color: '#e53935',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'left',
  },
  renewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SuiviAboClient;
