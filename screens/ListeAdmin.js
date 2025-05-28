import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';


function ListeAdmins({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const isFocused = useIsFocused(); // recharge à chaque retour sur la page

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`http://192.168.88.3:8080/admin/list`);
      setAdmins(response.data); 
    } catch (error) {
      console.error('Erreur lors du chargement des admins :', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des administrateurs.');
    }
  };

  const supprimerAdmin = async (id) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cet administrateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.88.7:8080/admin/delete/${id}`);
              fetchAdmins(); // Recharge la liste
            } catch (error) {
              console.error('Erreur suppression :', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'administrateur.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  useEffect(() => {
    fetchAdmins();
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.adminItem}>
      <View>
        <Text style={styles.adminText}>{item.prenom}</Text>
        <Text style={styles.adminEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => supprimerAdmin(item.id)}>
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 , backgroundColor: "#ffff", }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
      <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>

      <Text style={styles.title}>Liste des Administrateurs</Text>

      <FlatList
        data={admins}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InsertionAdmin')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
      </View>
</ScrollView>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
title: {
  marginTop: 75,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    height: 200,
    width: 300,
  },
  adminItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  adminText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminEmail: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    padding: 8,
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200ee',
    borderRadius: 30,
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  
  closeButton: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: 'bold',
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

export default ListeAdmins;
