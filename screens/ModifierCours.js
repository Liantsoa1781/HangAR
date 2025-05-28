import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { SelectList } from 'react-native-dropdown-select-list';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

const ModifierCours = ({ route, navigation }) => {
  const { cours } = route.params;

  const [formData, setFormData] = useState({
    jour: cours.jour.toString(),
    heureDebut: cours.heureDebut,
    heureFin: cours.heureFin,
    discipline: cours.discipline.id,
    prof: cours.prof.id,
    categorie: cours.categorie || '',
  });

  const [disciplines, setDisciplines] = useState([]);
  const [profs, setProfs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategorie, setShowCategorie] = useState(false);

  const [sousCategories, setSousCategories] = useState([]);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState('');
  const [showSousCategorie, setShowSousCategorie] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disciplinesRes, profsRes] = await Promise.all([
          axios.get(`http://192.168.88.7:8080/disciplines/all`),
          axios.get(`http://192.168.88.7:8080/professeurs/all`),
        ]);
        setDisciplines(disciplinesRes.data);
        setProfs(profsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkCategorieRequirement = async () => {
      if (!formData.discipline) return;
      try {
        const response = await axios.get(`http://192.168.88.7:8080/disciplines/${formData.discipline}/requiertCategorie`);
        if (response.data.length === 0) {
          setShowCategorie(false);
          setCategories([]);
          setFormData(prev => ({ ...prev, categorie: '' }));
        } else {
          setShowCategorie(true);
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des catégories :", error);
        setShowCategorie(false);
        setCategories([]);
        setFormData(prev => ({ ...prev, categorie: '' }));
      }
    };

    checkCategorieRequirement();
  }, [formData.discipline]);

  useEffect(() => {
    const fetchSousCategories = async () => {
      if (formData.discipline && formData.categorie) {
        try {
          const response = await axios.get(
            `http://192.168.88.7:8080/sousCategorie/disciplines/${formData.discipline}/categories/${formData.categorie}/sous-categories`
          );
          if (response.data.length > 0) {
            setSousCategories(response.data);
            setShowSousCategorie(true);
          } else {
            setSousCategories([]);
            setShowSousCategorie(false);
            setSelectedSousCategorie('');
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des sous-catégories :", error);
          setSousCategories([]);
          setShowSousCategorie(false);
        }
      } else {
        setSousCategories([]);
        setShowSousCategorie(false);
      }
    };
  
    fetchSousCategories();
  }, [formData.discipline, formData.categorie]);


  const handleSave = () => {
    const [hourStart, minuteStart] = formData.heureDebut.split(":").map(Number);
    const [hourEnd, minuteEnd] = formData.heureFin.split(":").map(Number);

    if (hourEnd < hourStart || (hourEnd === hourStart && minuteEnd <= minuteStart)) {
      Alert.alert('Erreur', "L'heure de fin ne peut pas être inférieure à l'heure de début.");
      return;
    }

    Alert.alert('Confirmation', 'Voulez-vous vraiment enregistrer les modifications ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: async () => {
          try {
            const cleanData = {};

            if (formData.jour !== cours.jour.toString()) cleanData.jour = parseInt(formData.jour, 10);
            if (formData.heureDebut !== cours.heureDebut) cleanData.heureDebut = formData.heureDebut;
            if (formData.heureFin !== cours.heureFin) cleanData.heureFin = formData.heureFin;

            if (formData.discipline !== cours.discipline.id) {
              cleanData.discipline = disciplines.find(d => d.id === formData.discipline);
            }           

            if (formData.categorie !== cours.categorie) {
              if (formData.categorie === '') {
              } else {
                const selectedCategorie = categories.find(c => c.categorie === formData.categorie);
                if (selectedCategorie) cleanData.categorie = selectedCategorie;
              }
            }   
              
            if (selectedSousCategorie) {
              const sc = sousCategories.find(sc => sc.id === selectedSousCategorie);
              if (sc) cleanData.sousCategorie = sc;
            }

            if (formData.prof !== cours.prof.id) {
              const selectedProf = profs.find(p => p.id === parseInt(formData.prof));
              cleanData.prof = selectedProf;
            } 
                   
            console.log("Données envoyées :", cleanData);

            await axios.put(`http://192.168.88.7:8080/planning/modifier/${cours.id}`, cleanData);

            Alert.alert('Succès', 'Cours modifié');
            navigation.navigate('ModifierPlanning', { refresh: true });
          } catch (error) {
            console.error('Erreur lors de la modification du cours :', error);
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    Alert.alert('Quitter sans enregistrer', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Quitter', onPress: () => navigation.goBack() },
    ]);
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

      <Text style={styles.title}>Modifier le cours</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Le jour du cours:</Text>
        <SelectList
          setSelected={(val) => setFormData(prev => ({ ...prev, jour: val }))}
          data={[
            { key: '0', value: 'Lundi' },
            { key: '1', value: 'Mardi' },
            { key: '2', value: 'Mercredi' },
            { key: '3', value: 'Jeudi' },
            { key: '4', value: 'Vendredi' },
            { key: '5', value: 'Samedi' },
            { key: '6', value: 'Dimanche' },
          ]}
          save="key"
          defaultOption={{
            key: formData.jour,
            value: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][formData.jour],
          }}
          boxStyles={styles.picker}
          inputStyles={{ color: '#333' }}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>La discipline:</Text>
        <SelectList
          setSelected={(val) => setFormData(prev => ({ ...prev, discipline: parseInt(val) }))}
          data={disciplines.map(d => ({ key: d.id.toString(), value: d.discipline }))}
          save="key"
          defaultOption={{
            key: formData.discipline.toString(),
            value: disciplines.find(d => d.id === formData.discipline)?.discipline || '',
          }}
          boxStyles={styles.picker}
          inputStyles={{ color: '#333' }}
        />
      </View>

      {showCategorie && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>La catégorie:</Text>
          <SelectList
            setSelected={(val) => setFormData(prev => ({ ...prev, categorie: val }))}
            data={categories.map(c => ({ key: c.id, value: c.categorie }))}
            save="key"
            defaultOption={{ 
              key: formData.categorie,
              value: categories.find(c => c.id === formData.categorie)?.categorie || '', 
            }}
            boxStyles={styles.picker}
            inputStyles={{ color: '#333' }}
          />
        </View>
      )}

      {showSousCategorie && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>La sous-catégorie:</Text>
          <SelectList
            setSelected={(val) => setSelectedSousCategorie(val)}
            data={sousCategories.map(sc => ({ key: sc.id, value: sc.nom }))}
            save="key"
            defaultOption={{
              key: selectedSousCategorie,
              value: sousCategories.find(sc => sc.id === selectedSousCategorie)?.nom || '',
            }}
            boxStyles={styles.picker}
            inputStyles={{ color: '#333' }}
          />
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Le professeur:</Text>
        <SelectList
          setSelected={(val) => setFormData(prev => ({ ...prev, prof: val }))}
          data={profs.map(p => ({ key: p.id, value: p.prenom }))}
          save="key"
          defaultOption={{
            key: formData.prof,
            value: profs.find(p => p.id === formData.prof)?.prenom || '',
          }}
          boxStyles={styles.picker}
          inputStyles={{ color: '#333' }}
        />
      </View>

      <Text style={styles.label}>Heure de début:</Text>
      <TextInput
        value={formData.heureDebut}
        onChangeText={(text) => setFormData({ ...formData, heureDebut: text })}
        style={styles.input}
      />

      <Text style={styles.label}>Heure de fin:</Text>
      <TextInput
        value={formData.heureFin}
        onChangeText={(text) => setFormData({ ...formData, heureFin: text })}
        style={styles.input}
      />

    <View style={styles.container}>
      <Button mode="contained" onPress={handleSave}>
                Enregistrer      
      </Button>
    </View>

    </View>
    </ScrollView>
    </KeyboardAvoidingView>
</SafeAreaView>
  );
};

// styles (garde les tiens + complets si besoin)

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default ModifierCours;
