import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const CourseDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { course, mondayDate, idPlanning, numeroDeCompte } = route.params;
  const courseDate = new Date(Date.parse(mondayDate));
  
  if (isNaN(courseDate)) {
    console.warn('Date invalide :', mondayDate);
  }

  const handleReservation = async () => {
    try {
      if (!numeroDeCompte) {
        Alert.alert("Erreur", "Impossible de récupérer votre compte.");
        return;
      }
  
      const formData = {
        numeroDeCompte: numeroDeCompte,
        idPlanning: idPlanning
      };

      console.log(numeroDeCompte);
  
      const response = await axios.post(`http://192.168.88.7:8080/reservation/reserverCours`, formData);
  
      if (response.status === 200) {
        Alert.alert("Succès", "Réservation effectuée !", [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate('HistoriqueReservation', { numeroDeCompte });
            },
          },
        ]);
      } else {
        Alert.alert("Erreur", "Échec de la réservation.");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        Alert.alert("Erreur", error.response.data);
      } else {
        Alert.alert("Erreur", "Une erreur est survenue.");
      }
    }
  };  

  const confirmReservation = () => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment réserver ce cours ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: handleReservation }
      ]
    );
  };  

  // Formatage de la date pour l'affichage
  const formattedCourseDate = `${courseDate.toLocaleString('fr-FR', { weekday: 'long' })}, ${courseDate.getDate()} ${courseDate.toLocaleString('fr-FR', { month: 'long' })} ${courseDate.getFullYear()}`;
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    return endDate.toTimeString().slice(0, 5);
  };

  const endTime = calculateEndTime(course.time, course.duration);

  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      <View style={{ flex: 1, padding: 8, marginTop: 20 }}>
        <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>

              <Text style={styles.nom}>
                {course.discipline} {course.categorie}
                {course.sousCategorie ? ` (${course.sousCategorie})` : ''}
              </Text>

              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={24} style={styles.icon} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{formattedCourseDate}</Text>
                </View>
              </View>
            
              <View style={styles.row}>
                <Ionicons name="time-outline" size={24} style={styles.icon} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Horaire</Text>
                  <Text style={styles.value}>{`${course.time} - ${endTime}`} ({course.duration} min)</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Ionicons name="person-outline" size={24} style={styles.icon} />
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Professeur</Text>
                  <Text style={styles.value}>{course.professor}</Text>
                </View>
              </View>

            <TouchableOpacity style={styles.reserveButton} onPress={confirmReservation}>
              <Text style={styles.reserveButtonText}>Réserve maintenant</Text>
            </TouchableOpacity>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  nom: {
    fontSize: 25,           
    fontWeight: 'bold',     
    color: '#333',          
    marginBottom: 5,        
    textAlign: 'center', 
  },
  closeButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
  closeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  courseImage: {
    width: '100%',
    height: 500,
    marginBottom: 16,
    borderRadius: 8,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  reserveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CourseDetails;
