import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const AjoutCours = ({ route, navigation }) => {
  const [selected, setSelected] = useState({
    jour: null,
    heureDebut: '',
    heureFin: '',
    discipline: null,
    categorie: null,
    sousCategorie: null,
    prof: null,
  });

  const jours = [
    { key: 0, value: 'Lundi' },
    { key: 1, value: 'Mardi' },
    { key: 2, value: 'Mercredi' },
    { key: 3, value: 'Jeudi' },
    { key: 4, value: 'Vendredi' },
    { key: 5, value: 'Samedi' },
    { key: 6, value: 'Dimanche' },
  ];

  const [disciplines, setDisciplines] = useState([]);
  const [profs, setProfs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [requiertCategorie, setRequiertCategorie] = useState(false);
  const [requiertSousCategorie, setRequiertSousCategorie] = useState(false);

  useEffect(() => {
    axios.get(`http://192.168.88.7:8080/disciplines/all`).then(res => {
      setDisciplines(res.data);
    });

    axios.get(`http://192.168.88.7:8080/professeurs/all`).then(res => {
      setProfs(res.data);
    });
  }, []);

  useEffect(() => {
    if (selected.discipline) {
      axios
        .get(`http://192.168.88.7:8080/disciplines/${selected.discipline}/requiertCategorie`)
        .then(res => {
            setRequiertCategorie(true);
            setCategories(res.data);
        })
        .catch(err => {
          console.error("Erreur lors du chargement des catégories :", err);
          setRequiertCategorie(false);
          setCategories([]);
        });
      }else {
        setSousCategories([]);
    }
  }, [selected.discipline]);

  useEffect(() => {
    if (selected.discipline && selected.categorie != null) {
      axios
        .get(`http://192.168.88.7:8080/sousCategorie/disciplines/${selected.discipline}/categories/${selected.categorie}/sous-categories`)
        .then(res => {
            setSousCategories(res.data);
            setRequiertSousCategorie(true);
        })
        .catch(err => {
          console.error("Erreur lors du chargement des sous-catégories :", err);
          setSousCategories([]);
        });
    } else {
      setSousCategories([]);
    }
  }, [selected.discipline, selected.categorie]);

  const handleClose = () => {
    Alert.alert(
      'Quitter sans enregistrer',
      'Êtes-vous sûr de vouloir quitter sans enregistrer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Quitter', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleAjoutCours = async () => {
    const heureDebut = selected.heureDebut.split(":").map(Number);
    const heureFin = selected.heureFin.split(":").map(Number);

    if (heureFin[0] < heureDebut[0] || (heureFin[0] === heureDebut[0] && heureFin[1] < heureDebut[1])) {
      Alert.alert('Erreur', 'L\'heure de fin ne peut pas être inférieure à l\'heure de début.');
      return;
    }

    const formData = {
      jour: selected.jour,
      heureDebut: selected.heureDebut,
      heureFin: selected.heureFin,
      discipline: disciplines.find(d => d.id === selected.discipline),
      categorie: selected.categorie != null ? categories.find(c => c.id === selected.categorie) : null,
      sousCategorie: selected.sousCategorie != null ? sousCategories.find(sc => sc.id === selected.sousCategorie) : null,
      prof: profs.find(p => p.id === selected.prof),
    };

    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment ajouter ce cours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await axios.post(`http://192.168.88.7:8080/planning/ajouter`, formData);
              Alert.alert('Succès', 'Cours ajouté avec succès');
              if (route.params?.onRefresh) {
                route.params.onRefresh();
              }
              navigation.goBack();
            } catch (error) {
              console.error("Erreur lors de l'ajout du cours :", error);
              const msg = error.response?.data || 'Une erreur est survenue';
              Alert.alert('Erreur', msg);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 50 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="arrow-back" size={26} color="#000" />
            <Text style={styles.closeButtonText}>Retour</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Ajouter un cours</Text>

          <Text style={styles.label}>Le jour du cours :</Text>
          <SelectList
            setSelected={(val) => setSelected(prev => ({ ...prev, jour: val }))}
            data={jours}
            placeholder="Choisir un jour"
            save="key"
            boxStyles={styles.picker}
          />

          <Text style={styles.label}>Discipline :</Text>
          <SelectList
            setSelected={(val) => setSelected(prev => ({ ...prev, discipline: val }))}
            data={disciplines.map(d => ({ key: d.id, value: d.discipline }))}
            placeholder="Choisir une discipline"
            save="key"
            boxStyles={styles.picker}
          />

          {requiertCategorie && categories.length > 0 && (
            <>
              <Text style={styles.label}>Catégorie :</Text>
              <SelectList
                setSelected={(val) => setSelected(prev => ({ ...prev, categorie: val }))}
                data={categories.map(c => ({ key: c.id, value: c.categorie, full: c }))}
                placeholder="Choisir une catégorie"
                save="key"
                boxStyles={styles.picker}
              />
            </>
          )}

          {requiertSousCategorie && (
              <>
                <Text style={styles.label}>Sous-catégorie :</Text>
                <SelectList
                  setSelected={(val) => setSelected(prev => ({ ...prev, sousCategorie: val }))}
                  data={sousCategories.map(sc => ({ key: sc.id, value: sc.nom }))}
                  placeholder="Choisir une sous-catégorie"
                  save="key"
                  boxStyles={styles.picker}
                />
              </>
          )}

          <Text style={styles.label}>Professeur :</Text>
          <SelectList
            setSelected={(val) => setSelected(prev => ({ ...prev, prof: val }))}
            data={profs.map(p => ({ key: p.id, value: `${p.prenom}` }))}
            placeholder="Choisir un professeur"
            save="key"
            boxStyles={styles.picker}
          />

          <Text style={styles.label}>Heure de début :</Text>
          <TextInput
            placeholder="ex: 09:00"
            value={selected.heureDebut}
            onChangeText={(text) => setSelected({ ...selected, heureDebut: text })}
            style={styles.input}
          />

          <Text style={styles.label}>Heure de fin :</Text>
          <TextInput
            placeholder="ex: 10:30"
            value={selected.heureFin}
            onChangeText={(text) => setSelected({ ...selected, heureFin: text })}
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={handleAjoutCours}>
                Ajouter le Cours
                </Button>
          </View>

        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    marginVertical: 10,
    padding: 8,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrer le bouton horizontalement
    alignItems: 'center', // Centrer le bouton verticalement si nécessaire
    marginTop: 20, // Un peu d'espace en haut
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
});

export default AjoutCours;
