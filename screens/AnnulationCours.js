import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { theme } from '../core/theme';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';


const AnnulationCours = ({ navigation }) => {
  const [discipline, setDiscipline] = useState('');
  const [professor, setProfessor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState({ start: false, end: false });
  const [cancellations, setCancellations] = useState([]);

  const professors = [
    { name: 'Jean Dupont', courses: [{ discipline: 'Jazz', date: '2024-11-10' }, { discipline: 'Blues', date: '2024-11-15' }] },
    { name: 'Marie Martin', courses: [{ discipline: 'Classique', date: '2024-11-12' }, { discipline: 'Rock', date: '2024-11-18' }] }
  ]; // Exemple de professeurs et leurs cours

  // Demander la permission pour les notifications (à faire au démarrage)
  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Vous devez activer les notifications pour recevoir les alertes.');
      }
    });
  }, []);
  

  // Fonction pour envoyer une notification de cours annulé
  const sendNotification = async (professor, discipline, startDate, endDate) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cours annulé',
        body: `Le cours de ${discipline} avec ${professor} est annulé du ${startDate} au ${endDate}.`,
        sound: true,
      },
      trigger: { seconds: 1 }, // Notification dans 1 seconde
    });
  };

  // Calculer le nombre de jours d'absence sans compter les dimanches
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let days = 0;

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) days++; // Ignorer les dimanches (day 0)
    }
    return days;
  };

  // Vérifier que la date de début est dans le futur
  const validateDate = (date) => {
    const today = new Date();
    const selectedDate = new Date(date);
    return selectedDate > today; // La date de début doit être dans le futur
  };

  // Toggle calendar visibility
  const toggleCalendar = (type) => {
    setShowCalendar((prevState) => ({
      start: type === 'start' ? !prevState.start : prevState.start,
      end: type === 'end' ? !prevState.end : prevState.end,
    }));
  };

  // Fonction pour obtenir les cours annulés pour un professeur dans une période donnée
  const getCancelledCourses = () => {
    if (!professor || !startDate || !endDate) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
    }
  
    if (!validateDate(startDate)) {
      return Alert.alert('Erreur', 'La date de début doit être dans le futur.');
    }
  
    // Vérification que la date de fin n'est pas antérieure à la date de début
    if (new Date(endDate) < new Date(startDate)) {
      return Alert.alert('Erreur', 'La date de fin ne peut pas être antérieure à la date de début.');
    }
  
    // Trouver les cours du professeur sélectionné
    const selectedProfessor = professors.find((p) => p.name === professor);
    const cancelledCourses = selectedProfessor.courses.filter((course) => {
      const courseDate = new Date(course.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return courseDate >= start && courseDate <= end; // Vérifier si la date du cours est dans la période d'absence
    });
  
    // Ajouter les cours annulés à la liste
    const cancellationsList = cancelledCourses.map((course) => ({
      discipline: course.discipline,
      professor: professor,
      date: course.date,
      daysAbsent: calculateDays(startDate, endDate),
    }));
  
    // Ajouter la nouvelle annulation à l'ancienne liste au lieu de la remplacer
    setCancellations((prevCancellations) => [...prevCancellations, ...cancellationsList]);
  
    // Envoyer la notification
    sendNotification(professor, cancellationsList.map(c => c.discipline).join(', '), startDate, endDate); // Notification
  
    Alert.alert('Succès', 'Annulation de cours ajoutée.');
  };
  
    
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <BackButton goBack={navigation.goBack} />

      <Text style={styles.title}>Annulation de Cours</Text>

      <Picker selectedValue={professor} style={styles.picker} onValueChange={(itemValue) => setProfessor(itemValue)}>
        <Picker.Item label="Sélectionner un professeur" value="" />
        {professors.map((item) => <Picker.Item key={item.name} label={item.name} value={item.name} />)}
      </Picker>

      <TouchableOpacity onPress={() => toggleCalendar('start')} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {startDate ? `Début de l'absence : ${startDate}` : 'Sélectionner la date de début'}
        </Text>
      </TouchableOpacity>

      {showCalendar.start && (
        <Calendar
          onDayPress={(day) => {
            setStartDate(day.dateString);
            setShowCalendar({ start: false, end: false });
          }}
          markedDates={{ [startDate]: { selected: true, selectedColor: theme.colors.primary } }}
          theme={{
            todayTextColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
          }}
          firstDay={1}
          style={styles.calendar}
        />
      )}

      <TouchableOpacity onPress={() => toggleCalendar('end')} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {endDate ? `Fin de l'absence : ${endDate}` : 'Sélectionner la date de fin'}
        </Text>
      </TouchableOpacity>

      {showCalendar.end && (
        <Calendar
          onDayPress={(day) => {
            setEndDate(day.dateString);
            setShowCalendar({ start: false, end: false });
          }}
          markedDates={{ [endDate]: { selected: true, selectedColor: theme.colors.primary } }}
          theme={{
            todayTextColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
          }}
          firstDay={1}
          style={styles.calendar}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={getCancelledCourses}>Confirmer</Button>
      </View>

      <Text style={styles.title}>Liste des Annulations</Text>
      <FlatList
        data={cancellations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.cancellationItem}>
            <Text>Professeur : {item.professor}</Text>
            <Text>Discipline : {item.discipline}</Text>
            <Text>Date du Cours : {item.date}</Text>
            <Text>Jours d'absence : {item.daysAbsent}</Text>
          </View>
        )}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    marginTop: 55,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
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
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  calendar: {
    width: '80%',
    alignSelf: 'center',
  },
  cancellationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default AnnulationCours;
