import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import Button from '../components/Button';
import {KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const AjouterAbonnement = ({ route, navigation }) => {
  const { numeroDeCompte } = route.params;

  const [subscriptionType, setSubscriptionType] = useState(null);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discipline, setDiscipline] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [categorieRequise, setCategorieRequise] = useState(false);
  const [showDisciplinePicker, setShowDisciplinePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const [sousCategories, setSousCategories] = useState([]);
  const [sousCategorie, setSousCategorie] = useState(null);
  const [sousCategorieRequise, setSousCategorieRequise] = useState(false);


  useEffect(() => {
    axios.get('http://192.168.88.7:8080/type_abonnements')
      .then(res => setSubscriptionTypes(res.data))
      .catch(err => {
        console.error('Erreur chargement types abonnement', err);
        Alert.alert('Erreur', 'Impossible de charger les types d\'abonnement.');
      });
  }, []);

  useEffect(() => {
    if (subscriptionType) {
      const typeAbonnement = subscriptionType.libelle;
      if (['Abonnement Mensuel'].includes(typeAbonnement)) {
        axios.get('http://192.168.88.7:8080/disciplines/all')
          .then(res => {
            setDisciplines(res.data);
            setShowDisciplinePicker(true);
          })
          .catch(err => {
            console.error('Erreur chargement disciplines', err);
            Alert.alert('Erreur', 'Impossible de charger les disciplines.');
          });
      } else {
        setDisciplines([]);
        setShowDisciplinePicker(false);
      }
    }
  }, [subscriptionType]);

  useEffect(() => {
    if (discipline) {
      axios.get(`http://192.168.88.7:8080/disciplines/${discipline}/requiertCategorie`)
        .then(res => {
            setCategorieRequise(true);
            setCategories(res.data);
        })
        .catch(err => {
          console.error("Erreur vérification catégorie", err);
          setCategorieRequise(false);
          setCategories([]);
          setCategorie(null);
        });
      }else {
        setSousCategories([]);
    }
  }, [discipline]);

  useEffect(() => {
    if (discipline && categorie) {
      axios.get(`http://192.168.88.7:8080/sousCategorie/disciplines/${discipline}/categories/${categorie.id}/sous-categories`)
        .then(res => {
            setSousCategories(res.data);
        })
        .catch(err => {
          console.error("Erreur chargement sous-catégories", err);
          setSousCategories([]);
        });
    } else {
      setSousCategories([]);
    }
  }, [discipline, categorie]);
  

  const formatDate = (dateString) => {
    const date = new Date(dateString || new Date());
    const y = date.getFullYear();
    const m = ("0" + (date.getMonth() + 1)).slice(-2);
    const d = ("0" + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  };

  const handleInsert = () => {
    const today = new Date();
    const selectedDate = new Date(startDate || today);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert('Erreur', 'La date d\'abonnement ne peut pas être dans le passé.');
      return;
    }

    const formattedStartDate = formatDate(startDate || today);

    const abonnement = {
      numeroDeCompte: numeroDeCompte,
      typeAbonnementId: subscriptionType.id,
      disciplineId: discipline || null,
      categorieId: categorie ? categorie.id : null,
      sousCategorieId: sousCategorie || null,
      dateAbonnement: formattedStartDate,
    };    

    console.log('Réponse reçue du serveur:',abonnement);
    axios.post('http://192.168.88.7:8080/clients/ajouter-abonnement', abonnement)
      .then(res => {
        Alert.alert('Succès', 'Abonnement ajouté avec succès !', [
          { text: 'OK', onPress: () => navigation.navigate('ListeAbonnes') }
        ]);
      })
      .catch(err => {
        console.error("Erreur ajout abonnement", err);
        Alert.alert('Erreur', 'Échec de l\'ajout de l\'abonnement.');
      });
  };

  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
  };

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
    >   
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>

        <View style={styles.header}>
          <Header>Ajouter un Abonnement</Header>
        </View>

            <Text style={styles.label}>Type d’abonnement</Text>
            <SelectList
                data={subscriptionTypes.map(t => ({ key: t.id, value: t.libelle }))}
                setSelected={key => {
                const selected = subscriptionTypes.find(t => t.id === key);
                setSubscriptionType(selected);
                }}
                boxStyles={styles.selectBox}
                placeholder="Choisir un type"
            />

            {showDisciplinePicker && (
                <>
                <Text style={styles.label}>Discipline</Text>
                <SelectList
                    data={disciplines.map(d => ({ key: d.id, value: d.discipline }))}
                    setSelected={key => setDiscipline(key)}
                    boxStyles={styles.selectBox}
                    placeholder="Choisir une discipline"
                />
                </>
            )}

          {categorieRequise && categories.length > 0 && (
              <>
                <Text style={styles.label}>Catégorie</Text>
                <SelectList
                  data={categories.map(c => ({
                    key: c.id,
                    value: c.categorie, // ou c.nom selon ton backend
                    full: c
                  }))}
                  setSelected={key => {
                    const selectedCategorie = categories.find(c => c.id === key);
                    setCategorie(selectedCategorie);
                  }}
                  save="key"
                  boxStyles={styles.selectBox}
                  placeholder="Choisir une catégorie"
                />
              </>
          )}

          {sousCategories.length > 0 && (
            <>
              <Text style={styles.label}>Sous-catégorie</Text>
              <SelectList
                data={sousCategories.map(s => ({ key: s.id, value: s.nom }))}
                setSelected={key => setSousCategorie(key)}
                save="key"
                boxStyles={styles.selectBox}
                placeholder="Choisir une sous-catégorie"
              />
            </>
          )}

            <Text style={styles.label}>Date d’abonnement</Text>
            <TouchableOpacity onPress={toggleCalendar}>
                <Text style={styles.input}>
                {startDate ? formatDate(startDate) : "Choisir une date"}
                </Text>
            </TouchableOpacity>
            {showCalendar && (
                <Calendar
                onDayPress={day => {
                    setStartDate(day.dateString);
                    setShowCalendar(false);
                }}
                markedDates={{ [startDate]: { selected: true } }}
                />
            )}

            <View style={styles.container}>
                <Button mode="contained" onPress={handleInsert}>
                    Enregistrer
                </Button>
            </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',   
    paddingTop: 10,
  },
  container: {
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  selectBox: { borderColor: '#ccc' },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
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

export default AjouterAbonnement;
