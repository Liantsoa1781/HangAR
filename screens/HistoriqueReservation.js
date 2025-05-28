import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HistoriqueReservation = ({ route, navigation }) => {
  const { numeroDeCompte } = route.params;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://192.168.88.7:8080/reservation/all/${numeroDeCompte}`);
  
      // Regrouper les réservations par mois/année
      const grouped = {};
  
      response.data.forEach(item => {
        const date = new Date(item.dateReservation);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        if (!grouped[monthYear]) grouped[monthYear] = [];
        grouped[monthYear].push(item);
      });


      // Transformer en tableau trié du plus récent au plus ancien
      const sortedGroups = Object.entries(grouped).sort((a, b) => {
        const dateA = new Date(`1 ${a[0]}`);
        const dateB = new Date(`1 ${b[0]}`);
        return dateB - dateA;
      });
  
      setReservations(sortedGroups); // tableau de [mois, [réservations]]
    } catch (error) {
      console.error("Erreur lors du chargement des réservations :", error);
      Alert.alert("Erreur", "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchReservations();
  }, []);

  const annulerReservation = async (id) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment annuler cette réservation ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          onPress: async () => {
            try {
              await axios.put(`http://192.168.88.7:8080/reservation/annuler/${id}`);
              fetchReservations(); 
            } catch (error) {
              console.error("Erreur lors de l'annulation :", error);
              Alert.alert("Erreur", "Impossible d'annuler la réservation.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    let borderColor;
    if (item.statut === 'confirmee') borderColor = '#28a745';
    else if (item.statut === 'annulee') borderColor = '#dc3545';
    else borderColor = '#f0ad4e';
  
    return (
      <View style={[styles.card, { borderLeftColor: borderColor }]}>
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {item.planning?.discipline?.discipline || 'Aucune discipline'}
            {item.planning?.categorie?.categorie ? ' - ' + item.planning.categorie.categorie : ''}
            {item.planning?.sousCategorie?.sousCategorie ? ' / ' + item.planning.sousCategorie.sousCategorie : ''}
          </Text>
            <Text style={styles.text}>
              Date : {new Date(item.dateReservation).toLocaleDateString()} à {item.planning.heureDebut}
            </Text>
            <Text style={[
              styles.status,
              item.statut === 'confirmee' ? styles.confirmed :
              item.statut === 'annulee' ? styles.cancelled :
              styles.pending
            ]}>
              {item.statut === 'annulee' ? 'Réservation annulée' :
               item.statut === 'confirmee' ? 'Réservation confirmée' : item.statut}
            </Text>
          </View>
  
          {/* Bouton Annuler */}
          {item.statut !== 'annulee' && item.statut !== 'confirmee' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => annulerReservation(item.id)}  
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffff' }}>

    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard', { numeroDeCompte })}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.header}>Mes Réservations à venir</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : reservations.length === 0 ? (
        <Text style={styles.noData}>Aucune réservation future</Text>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.monthTitle}>{item[0]}</Text>
              {item[1].map((res, index) => renderItem({ item: res, index }))}
            </View>
          )}
        />
      )}
    </View>
    </SafeAreaView>

  );
};

export default HistoriqueReservation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  header: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f7f9fc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    borderLeftWidth: 7, 
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
  },
  status: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmed: {
    color: 'green',
  },
  cancelled: {
    color: 'red',
  },
  pending: {
    color: '#e67e00',
  },
  cancelledCard: {
    backgroundColor: '#fcebea',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: 'italic',
    color: '#007bff',
    marginTop: 16,
    marginBottom: 8,
  },
  
});
