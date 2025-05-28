import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HamburgerMenu from '../components/HamburgerMenu';
import { Entypo } from '@expo/vector-icons';

const ModifierPlanning = ({ route }) => {
  const [plannings, setPlannings] = useState([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const scrollRef = useRef(null);

  const links = [
    { label: 'Les abonnés', screen: 'ListeAbonnes' },
    { label: 'Les reservations', screen: 'Reservation' },
  ];

  useEffect(() => {
    fetchPlannings();
  }, []);

  const fetchPlannings = async () => {
    try {
      const response = await axios.get(`http://192.168.88.7:8080/planning/all`);
      setPlannings(response.data);
      scrollRef.current?.scrollTo({ y: 0, animated: true }); 
    } catch (error) {
      console.error('Erreur lors de la récupération du planning :', error);
    }
  };  

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPlannings();
    });
  
    return unsubscribe;
  }, [navigation]);
  

  const getJourTexte = (jourNum) => {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return jours[jourNum] || '';
  };

  const handleModifierCours = (id) => {
    const cours = plannings.find(p => p.id === id);
    navigation.navigate('ModifierCours', { cours });
  };

  const handleRedirectionAjoutCours = () => {
    navigation.navigate('AjoutCours', { onRefresh: fetchPlannings });
  };

  const handleSupprimerCours = (id) => {
    Alert.alert(
      'Supprimer le cours',
      'Êtes-vous sûr de vouloir supprimer ce cours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.88.7:8080/planning/${id}/supprimer`);
              fetchPlannings();
              Alert.alert('Succès', 'Cours supprimé avec succès');
            } catch (error) {
              console.error('Erreur suppression du cours :', error);
              Alert.alert('Erreur', 'Impossible de supprimer le cours');
            }
          }
        }
      ]
    );
  };

  const formatHeure = (heure) => {
    const [h, m] = heure.split(':');
    return `${h}h${m}`;
  };

  const listerCoursParJour = (jourNum) => {
    const cours = plannings.filter(p => p.jour === jourNum);
    cours.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

    return (
      <>
        <Text style={{ fontStyle: 'italic', marginBottom: 5, color: '#555' }}>
          {cours.length} cours ce jour
        </Text>
        {
          cours.length ? cours.map(p => (
            <View key={p.id} style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 15,
              marginBottom: 10,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 5,
              elevation: 2
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <Icon name="chalkboard-teacher" size={16} color="#444" />
                <Text style={{ marginLeft: 6 }}>{p.prof.prenom}</Text>
              </View>

              {p.categorie && (
                <Text style={{ marginBottom: 5 }}>
                  <Icon name="users" size={14} color="#555" /> Catégorie : {p.categorie.categorie}
                </Text>
              )}

              <Text style={{ marginBottom: 10 }}>
                <Icon name="clock" size={14} color="#555" /> {formatHeure(p.heureDebut)} - {formatHeure(p.heureFin)}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => handleModifierCours(p.id)}
                  style={{
                    backgroundColor: '#007bff',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 5,
                    marginRight: 10
                  }}
                >
                  <Text style={{ color: 'white' }}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSupprimerCours(p.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 5
                  }}
                >
                  <Text style={{ color: 'white' }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )) : <Text style={{ color: 'gray', fontStyle: 'italic' }}>Aucun cours</Text>
        }
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Icons header */}
      {isMenuVisible && (
        <View style={styles.menuContainer}>
          <HamburgerMenu links={links} navigation={navigation} onClose={toggleMenu} />
        </View>
        )}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
          <Entypo name="menu" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
      >
      <Text style={styles.title}>Le Planning</Text>

      {[0, 1, 2, 3, 4, 5, 6].map(jourNum => {
        const cours = plannings.filter(p => p.jour === jourNum);
        cours.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
        const jourNom = getJourTexte(jourNum);

        return (
          <View key={jourNum} style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
              {jourNom}
            </Text>

            {cours.length ? cours.map((p, index) => (
              <View key={p.id} style={{
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
                backgroundColor: '#fff', // Retrait de la couleur dynamique
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 5,
                elevation: 2,
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                  {p.discipline.discipline}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Icon name="user-tie" size={14} color="#333" />
                  <Text style={{ marginLeft: 8 }}>{p.prof.prenom}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Icon name="clock" size={14} color="#333" />
                  <Text style={{ marginLeft: 8 }}>
                    {formatHeure(p.heureDebut)} - {formatHeure(p.heureFin)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity
                    onPress={() => handleModifierCours(p.id)}
                    style={{
                      backgroundColor: '#007bff',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 5,
                      marginRight: 10
                    }}
                  >
                    <Text style={{ color: 'white' }}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleSupprimerCours(p.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 5
                    }}
                  >
                    <Text style={{ color: 'white' }}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )) : (
              <Text style={{ fontStyle: 'italic', color: 'gray' }}>Aucun cours</Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        onPress={handleRedirectionAjoutCours}
        style={{
          backgroundColor: 'green',
          padding: 10,
          marginBottom: 30,
          borderRadius: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold'}}>
          Ajouter un cours
        </Text>

      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  iconButton: {
    padding: 5,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
});

export default ModifierPlanning;
