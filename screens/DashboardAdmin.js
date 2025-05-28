import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker'; // npm install @react-native-picker/picker

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '6', strokeWidth: '2', stroke: '#007AFF' },
};

export default function DashboardAdmin({ navigation }) {
  const [clientsActifsMensuels, setClientsActifsMensuels] = useState({});
  const moisFrancais = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const [stats, setStats] = useState({
    totalAbonnes: 0,
    revenuTotal: 0,
    disciplineRentable: '',
    revenusParDiscipline: [],
    revenusMensuels: [],
  });

  const [moisSelectionne, setMoisSelectionne] = useState(''); // pour filtrer

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const moisActuel = now.getMonth() + 1;
        const anneeActuelle = now.getFullYear();
    
        // 1. D'abord on fetch les données
        const responseRevenusMensuels = await fetch('http://192.168.88.7:8080/statistique/revenu-discipline-par-mois');
        const dataRevenusMensuels = await responseRevenusMensuels.json();
    
        const responseClientsActifs = await fetch('http://192.168.88.7:8080/abonnement/statistiquesClientsActifsMensuels');
        const dataClientsActifs = await responseClientsActifs.json();
        setClientsActifsMensuels(dataClientsActifs);
    
        // 2. Ensuite on peut filtrer
        const revenusMoisCourant = dataRevenusMensuels.filter(item => {
          const [annee, mois] = item.mois.split('-').map(Number);
          return annee === anneeActuelle && mois === moisActuel;
        });
    
        // 3. Puis calculer les stats
        const revenusParDisciplineMap = {};
        let totalRevenu = 0;
        let totalAbonnes = 0;
    
        revenusMoisCourant.forEach(item => {
          const { discipline, revenuTotal, nbClientsActifs } = item;
    
          if (!revenusParDisciplineMap[discipline]) {
            revenusParDisciplineMap[discipline] = {
              discipline,
              revenu: 0,
            };
          }
          revenusParDisciplineMap[discipline].revenu += revenuTotal;
    
          totalRevenu += revenuTotal;
          totalAbonnes += nbClientsActifs;
        });
    
        const revenusParDiscipline = Object.values(revenusParDisciplineMap);
        revenusParDiscipline.sort((a, b) => b.revenu - a.revenu);
        const disciplineRentable = revenusParDiscipline.length > 0 ? revenusParDiscipline[0].discipline : 'N/A';
    
        setStats({
          totalAbonnes,
          revenuTotal: totalRevenu,
          disciplineRentable,
          revenusMensuels: dataRevenusMensuels,
        });
    
      } catch (error) {
        console.error('Erreur chargement statistiques mensuelles', error);
      }
    };    

    fetchStats();
  }, []);

  const calculerStats = (moisCible = '') => {
    const revenusFiltrés = moisCible
      ? stats.revenusMensuels.filter(item => item.mois === moisCible)
      : stats.revenusMensuels;
  
    const revenusParDisciplineMap = {};
    let totalRevenu = 0;
    let totalAbonnes = 0;
  
    revenusFiltrés.forEach(item => {
      const { discipline, revenuTotal, nbClientsActifs } = item;
  
      if (!revenusParDisciplineMap[discipline]) {
        revenusParDisciplineMap[discipline] = {
          discipline,
          revenu: 0,
        };
      }
      revenusParDisciplineMap[discipline].revenu += revenuTotal;
  
      totalRevenu += revenuTotal;
      totalAbonnes += nbClientsActifs;
    });
  
    const revenusParDiscipline = Object.values(revenusParDisciplineMap);
    revenusParDiscipline.sort((a, b) => b.revenu - a.revenu);
    const disciplineRentable = revenusParDiscipline.length > 0 ? revenusParDiscipline[0].discipline : 'N/A';
  
    return {
      totalAbonnes,
      revenuTotal: totalRevenu,
      disciplineRentable,
    };
  };

  useEffect(() => {
    const nouveauxStats = calculerStats(moisSelectionne);
    setStats(prev => ({
      ...prev,
      ...nouveauxStats,
    }));
  }, [moisSelectionne]);  

  // Préparation données BarChart
  const barChartLabels = Object.keys(clientsActifsMensuels)
  .filter(label => label != null)
  .map((label) => {
    const [year, month] = label.split('-');
    const moisNom = moisFrancais[parseInt(month) - 1];
    return `${moisNom}`;
  });
  const barChartData = Object.values(clientsActifsMensuels)
    .map(val => (typeof val === 'number' && !isNaN(val) ? val : 0));

  // Groupement des données revenus mensuels par mois
  const groupedData = {};
  stats.revenusMensuels.forEach(item => {
    const mois = item.mois;
    if (!groupedData[mois]) {
      groupedData[mois] = [];
    }
    groupedData[mois].push(item);
  });

  // Liste des mois disponibles triés pour le picker
  const moisDisponibles = Object.keys(groupedData).sort();

  // Filtrage selon mois sélectionné (si vide = tous)
  const dataFiltree = moisSelectionne
    ? { [moisSelectionne]: groupedData[moisSelectionne] || [] }
    : groupedData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>

          {/* Cartes statistiques */}
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Discipline la Plus Rentable</Text>
              <Text style={styles.cardValue}>{stats.disciplineRentable}</Text>
            </View>
          </View>

          <View style={styles.cardsContainer}></View>
          {/* Bar Chart - Clients Actifs Mensuels */}
          <Text style={styles.chartTitle}>Évolution des Clients Actifs par mois</Text>
          {barChartLabels.length > 0 ? (
            <BarChart
              data={{
                labels: barChartLabels, 
                datasets: [{ data: barChartData }],
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}

              style={styles.chart}
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Chargement des données...</Text>
          )}

          <View style={styles.cardsContainer}></View>
          {/* Sélecteur mois */}
            <Text style={styles.chartTitle}>Tableau des Revenus par Discipline et mois</Text>

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filtrer par mois :</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={moisSelectionne}
                  onValueChange={(itemValue) => setMoisSelectionne(itemValue)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="Tous les mois" value="" />
                  {moisDisponibles.map((mois) => {
                    const dateObj = new Date(`${mois}-01`);
                    const moisFormate = `${moisFrancais[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
                    return <Picker.Item key={mois} label={moisFormate} value={mois} />;
                  })}
                </Picker>
              </View>
          </View>

          {/* Tableau des Revenus */}
          <View style={styles.tableContainer}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.6 }]}>Discipline</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.6 }]}>Abonnements Actifs</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Revenu (Ar)</Text>
            </View>

            {Object.entries(dataFiltree).map(([mois, lignes]) => {
              const dateObj = new Date(`${mois}-01`);
              const moisFormate = `${moisFrancais[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

              return (
                <View key={mois}>
                  {/* Ligne titre du mois sur toute la largeur */}
                  <View style={[styles.tableRow]}>
                    <Text style={[styles.tableCell, { flex: 4, fontWeight: 'bold', fontSize: 16, textAlign: 'center', }]}>
                      {moisFormate}
                    </Text>
                  </View>

                  {/* Lignes des disciplines du mois */}
                  {lignes.map((item, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.tableRow,
                        idx % 2 === 0 ? null : { backgroundColor: '#f9f9f9' },
                      ]}
                    >
                      {/* Ici on ne met pas le mois */}
                      <Text style={[styles.tableCell, { flex: 2 }]}>{item.discipline}</Text>
                      <Text style={[styles.tableCell, { flex: 1.6 }]}>{item.nbClientsActifs}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>
                        {item.revenuTotal.toLocaleString()} Ar
                      </Text>
                    </View>
                  ))}

                  {/* Ligne total du mois */}
                  <View style={[styles.tableRow, { backgroundColor: '#e6f0ff' }]}>
                    <Text style={[styles.tableCell, { flex: 1.6, fontWeight: 'bold' }]}>Total</Text>
                    <Text style={[styles.tableCell, { flex: 1.6, fontWeight: 'bold' }]}>
                      {lignes.reduce((sum, item) => sum + item.nbClientsActifs, 0)} Abonnements
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>
                      {lignes.reduce((sum, item) => sum + item.revenuTotal, 0).toLocaleString()} Ar
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
    marginTop: -25,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  cardValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 8,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  filterContainer: {
    marginTop: 24,
    marginHorizontal: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    color: '#007AFF',
  },
  tableContainer: {
    marginHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  
});
