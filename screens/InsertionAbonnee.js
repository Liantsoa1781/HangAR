import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars'; 
import { theme } from '../core/theme';
import { useNavigation } from '@react-navigation/native';
import { SelectList } from 'react-native-dropdown-select-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import axios from 'axios';

import Button from '../components/Button';

const InsertionAbonnee = () => {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discipline, setDiscipline] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [categorieRequise, setCategorieRequise] = useState(false);
  const [showDisciplinePicker, setShowDisciplinePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false); // État pour gérer la visibilité du calendrier
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [sousCategorie, setSousCategorie] = useState(null);
  const [sousCategories, setSousCategories] = useState([]);

  const [isMenuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const links = [
    { label: 'Les abonnés', screen: 'ListeAbonnes' },
    { label: 'Le Planning', screen: 'ModifierPlanning' },
  ];

  // Effect hook pour récupérer les types d'abonnement
  useEffect(() => {
    axios.get(`http://192.168.88.7:8080/type_abonnements`) // Remplacer par ton URL d'API
      .then(response => {
        setSubscriptionTypes(response.data); // Mettre à jour le state avec les données de l'API
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des types d\'abonnement', error);
        Alert.alert('Erreur', 'Impossible de charger les types d\'abonnement.');
      });
  }, []); // Le tableau vide [] assure que l'effet se déclenche une seule fois au montage du composant

  // Charger les disciplines si le type d'abonnement sélectionné nécessite des disciplines
  useEffect(() => {
    if (subscriptionType) {
      const typeAbonnement = subscriptionType.libelle;
      if (['Abonnement Mensuel'].includes(typeAbonnement)) {
        axios.get(`http://192.168.88.7:8080/disciplines/all`)
          .then(response => {
            setDisciplines(response.data);
            setShowDisciplinePicker(true);
          })
          .catch(error => {
            console.error('Erreur lors du chargement des disciplines', error);
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
        .then(response => {
          setCategorieRequise(true);
          setCategories(response.data);           
        })
        .catch(error => {
          console.error("Erreur lors de la vérification :", error);
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
        .then(response => {
          setSousCategories(response.data);
        })  
        .catch(error => {
          console.error("Erreur lors de la récupération des sous-catégories :", error);
          setSousCategories([]);
        });
    } else {
      setSousCategories([]);
    }
  }, [discipline, categorie]);  


  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convertir la chaîne en objet Date
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Ajouter un 0 si le mois est inférieur à 10
    const day = ("0" + date.getDate()).slice(-2); // Ajouter un 0 si le jour est inférieur à 10
  
    return `${year}-${month}-${day}`; // Format final : yyyy-MM-dd
  };

  const handleInsert = () => {
    let formattedStartDate = startDate ? formatDate(startDate) : formatDate(new Date());
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const startDateObj = new Date(formattedStartDate);
    startDateObj.setHours(0, 0, 0, 0);
  
    // Plage autorisée : 1 mois avant aujourd'hui jusqu'à 1 mois après
    const minDate = new Date(today);
    minDate.setMonth(minDate.getMonth() - 3); // 1 mois en arriere
  
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1); // 1 mois en avant
  
    if (startDateObj < minDate || startDateObj > maxDate) {
      Alert.alert(
        'Erreur',
        `La date d'abonnement doit être comprise entre le ${formatDate(minDate)} et le ${formatDate(maxDate)}.`
      );
      return;
    }
  
    if (!startDate) {
      formattedStartDate = formatDate(today);
    }
  
    const newAbonne = {
      nom: lastName,
      prenom: firstName,
      telephone: phoneNumber,
      email: email,
      id_type_abonnement: subscriptionType.id,
      date_abonnement: formattedStartDate,
      id_discipline: discipline || null,
      id_categorie: categorie ? categorie.id : null,
      id_sous_categorie: sousCategorie || null
    };

    axios.post(`http://192.168.88.7:8080/clients/inscription`, newAbonne)
      .then(response => {
        const { numeroDeCompte, motDePasse } = response.data;
  
        Alert.alert(
          'Succès',
          `Abonné ajouté : ${lastName} ${firstName}\n\Numero De Compte : ${numeroDeCompte}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ListeAbonnes', {
                numeroDeCompte: numeroDeCompte,
                nomClient: lastName
              })
            }
          ]
        );

        // Réinitialisation des champs
        setLastName('');
        setFirstName('');
        setPhoneNumber('');
        setEmail('');
        setSubscriptionType(null);
        setStartDate('');
        setDiscipline(null);
        setCategorie(null);
        setSousCategorie(null);
      })
      .catch(error => {
        console.error('Erreur lors de l\'insertion de l\'abonné', error);
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'abonné.');
      });
  };
  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
  };

  const onDayPress = (day) => {
    setStartDate(day.dateString); // Stocke la date sélectionnée
    setShowCalendar(false); // Ferme le calendrier après la sélection
  };

  const toggleCalendar = () => {
    setShowCalendar((prevState) => !prevState); // Inverse l'état de showCalendar
  };

  const isFormValid = lastName && firstName && phoneNumber && email && subscriptionType;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 50 }}>
        <View style={styles.container}>
          {/* Icons header */}
           <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Insertion d'Abonnés</Text>

          <Text style={styles.label}>Nom du client :</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Prenom du client:</Text>
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <Text style={styles.label}>Numéro de téléphone:</Text>
          <TextInput
            style={styles.input}
            placeholder="Numero"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>Addresse email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

        <Text style={styles.label}>Type de l'abonnement</Text>
        <SelectList
          data={subscriptionTypes.map(type => ({ key: type.id, value: type.libelle, full: type }))}
          setSelected={key => {
            const selectedType = subscriptionTypes.find(type => type.id === key);
            setSubscriptionType(selectedType);
          }}
          save="key"
          boxStyles={styles.selectBox}
          placeholder="Choisir le type d'abonnement"
        />

          {/* Afficher le Picker de disciplines uniquement si nécessaire */}
          {showDisciplinePicker && (
            <>
              <Text style={styles.label}> Discipline </Text>
              <SelectList
                data={disciplines.map(d => ({ key: d.id, value: d.discipline }))}
                setSelected={key => setDiscipline(key)}
                save="key"
                boxStyles={styles.selectBox}
                placeholder="Choisir une discipline"
              />
            </>
          )}

          {/* Affichage du picker catégorie si nécessaire */}
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

          <TouchableOpacity
            style={styles.dateButton}
            onPress={toggleCalendar} // Modifie ici pour inverser la visibilité du calendrier
          >
            <Text style={styles.dateText}>
              {startDate ? `Date de début : ${startDate}` : 'Sélectionner une date'}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                monthFormat={'MMMM yyyy'}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: theme.colors.primary,
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: theme.colors.primary,
                  selectedDotColor: '#ffffff',
                  arrowColor: theme.colors.primary,
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: theme.colors.primary,
                  indicatorColor: theme.colors.primary,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                onDayPress={onDayPress}
                markedDates={{
                  [startDate]: {
                    selected: true,
                    selectedColor: theme.colors.primary,
                  }
                }}
              />
            </View>
            )}

          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleInsert}  disabled={!isFormValid}>
              Ajouter Abonné
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
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    marginVertical: 10,
    padding: 8,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dateButton: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  calendar: {
    width: '80%',  // Ajuste la largeur du calendrier (par exemple 90% de la largeur de l'écran)
    height: 70,   // Ajuste la hauteur du calendrier
    marginTop: 10, // Un peu d'espace en haut
    marginBottom: 300,
    alignSelf: 'center', // Centrer le calendrier
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le bouton horizontalement
    alignItems: 'center', // Centrer le bouton verticalement si nécessaire
    marginTop: 20, // Un peu d'espace en haut
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  iconButton: {
    padding: 4,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  calendarContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#fff',
    elevation: 2,
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

export default InsertionAbonnee;
