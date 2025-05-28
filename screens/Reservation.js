import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const Reservation = ({ navigation, route }) => {
  const { id } = route.params;

  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);

  const fetchCoursesFromPlanning = async () => {
    try {
      const response = await axios.get('http://192.168.88.7:8080/planning/all');
      const planningData = response.data;
      const allCourses = planningData.map((p) => {
        const discipline = p.discipline?.discipline || 'N/A';
        const categorie = p.categorie?.categorie || '';
        const sousCategorie = p.sousCategorie?.nom || '';
        return `${discipline}${categorie ? ' - ' + categorie : ''}${sousCategorie ? ' (' + sousCategorie + ')' : ''}`;
      });
      setAvailableCourses([...new Set(allCourses)].sort());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les cours du planning.');
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://192.168.88.7:8080/reservation/pending`);
      const data = response.data;
      setReservations(data);
      setFilteredReservations(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesFromPlanning();
  
    if (id) {
      // Charger une réservation spécifique par ID
      axios.get(`http://192.168.88.7:8080/reservation/${id}`)
        .then(response => {
          setFilteredReservations([response.data]);
          setReservations([response.data]); // Si tu veux le garder dans la liste
        })
        .catch(() => {
          Alert.alert('Erreur', 'Impossible de charger la réservation.');
        })
        .finally(() => setLoading(false));
    } else {
      fetchReservations();
    }
  }, []);  

  const updateReservationStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://192.168.88.7:8080/reservation/update/${id}`, { status: newStatus });
      Alert.alert('Succès', `Réservation ${newStatus}`);
      fetchReservations();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la réservation.');
    }
  };

  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = date.toLocaleDateString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} à ${hours}h${minutes}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmee':
      case 'confirmé':
        return styles.statusConfirmed;
      case 'annulee':
      case 'annulé':
        return styles.statusCancelled;
      case 'en_attente':
      case 'pending':
      default:
        return styles.statusPending;
    }
  };

  const handleFilter = (value) => {
    setSelectedCourse(value);
    if (value === '') {
      setFilteredReservations(reservations);
    } else {
      const filtered = reservations.filter((item) => {
        const discipline = item.planning?.discipline?.discipline || 'N/A';
        const categorie = item.planning?.categorie?.categorie || '';
        const sousCategorie = item.planning?.sousCategorie?.nom || '';
        const cours = `${discipline}${categorie ? ' - ' + categorie : ''}${sousCategorie ? ' (' + sousCategorie + ')' : ''}`;
        return cours === value;
      });
      setFilteredReservations(filtered);
    }
  };

  const renderItem = ({ item }) => {
    const discipline = item.planning?.discipline?.discipline || 'N/A';
    const categorie = item.planning?.categorie?.categorie || '';
    const sousCategorie = item.planning?.sousCategorie?.nom || '';
    const cours = `${discipline}${categorie ? ' - ' + categorie : ''}${sousCategorie ? ' (' + sousCategorie + ')' : ''}`;

    return (
      <View style={styles.item}>
        <Text style={styles.clientText}>
          Client : {item.client?.prenom} {item.client?.nom}
        </Text>
        <Text style={styles.dateText}>Réservé le : {formatDateTime(item.dateReservation)}</Text>
        <Text style={styles.courseText}>Cours : {cours}</Text>
        <Text style={[styles.statusText, getStatusStyle(item.statut)]}>
          Statut : {item.statut}
        </Text>

        {item.statut === 'en_attente' && (
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.confirm]}
              onPress={() =>
                Alert.alert('Confirmation', 'Confirmer cette réservation ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Confirmer', onPress: () => updateReservationStatus(item.id, 'confirmee') },
                ])
              }
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Confirmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={() =>
                Alert.alert('Confirmation', 'Annuler cette réservation ?', [
                  { text: 'Non', style: 'cancel' },
                  { text: 'Oui, annuler', onPress: () => updateReservationStatus(item.id, 'annulee') },
                ])
              }
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0066cc" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleClose} style={styles.backButton} activeOpacity={0.7}>
        <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Liste des réservations</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCourse}
            onValueChange={handleFilter}
            style={styles.picker}
            dropdownIconColor="#007AFF" // couleur de l'icône si pris en charge
          >
            <Picker.Item label="Tous les cours" value="" />
            {availableCourses.map((course, index) => (
              <Picker.Item key={index} label={course} value={course} />
            ))}
          </Picker>
        </View> 

      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000', // pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
  
  list: { paddingBottom: 20 },
  item: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    marginBottom: 25,
    elevation: 8,
  },
  clientText: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: '#333' },
  courseText: { fontSize: 14, fontStyle: 'italic' },
  statusText: { fontSize: 14, marginTop: 5 },
  statusConfirmed: { color: 'green' },
  statusCancelled: { color: 'red' },
  statusPending: { color: 'orange' },
  buttons: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  button: { padding: 10, borderRadius: 8, width: '48%', alignItems: 'center' },
  confirm: { backgroundColor: '#4CAF50', elevation: 5 },
  cancel: { backgroundColor: '#F44336', elevation: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default Reservation;
