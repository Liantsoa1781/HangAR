import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@react-navigation/native'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

const RenouvellementPage = ({ route, navigation }) => {
  const { idAbonnement, numeroDeCompte } = route.params;
  const theme = useTheme(); // pour accéder aux couleurs du thème
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleRenouvellement = () => {
    if (!date) {
      Alert.alert("Erreur", "Veuillez sélectionner une date.");
      return;
    }
    const url = `http://192.168.88.7:8080/abonnement/renouveler/${idAbonnement}/${numeroDeCompte}?nouvelleDate=${formatDate(date)}`;

    fetch(url, {
      method: 'PUT',
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(text); });
        }
        return res.json();
      })
      .then(() => {
        Alert.alert("Succès", "Abonnement renouvelé !");
        navigation.navigate("DetailsAbonnement", { numeroDeCompte });
      })
      .catch(err => {
        console.error("Erreur:", err);
        Alert.alert("Erreur", err.message || "Le renouvellement a échoué.");
      });
  };

  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
  };

  const onDayPress = (day) => {
    const selectedDate = new Date(day.dateString);
    if (selectedDate >= new Date()) {
      setDate(selectedDate);
      setShowCalendar(false);
    } else {
      Alert.alert("Date invalide", "Veuillez sélectionner une date future.");
    }
  };

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50, marginTop: 15 }}>
      <View style={styles.container}>
        <TouchableOpacity
              onPress={handleClose}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.label}>Nouvelle date de début :</Text>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowCalendar(!showCalendar)}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
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
                  [formatDate(date)]: {
                    selected: true,
                    selectedColor: theme.colors.primary,
                  }
                }}
                minDate={formatDate(new Date())}
              />
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleRenouvellement}>
            <Text style={styles.buttonText}>Confirmer le renouvellement</Text>
          </TouchableOpacity>
        </View>
        </View>
          </ScrollView>
      </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default RenouvellementPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  container: {
    padding: 24,
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    elevation: 3,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
