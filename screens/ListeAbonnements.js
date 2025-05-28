import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ListeAbonnements = ({ route, navigation }) => {
  const { numeroDeCompte } = route.params;
  const [abonnements, setAbonnements] = useState([]);
  const [tri, setTri] = useState('dateExpiration');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch(`http://192.168.88.7:8080/abonnement/detail?numeroDeCompte=${numeroDeCompte}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAbonnements(data);
          }
        })
        .catch(err => console.error(err));
    });
    return unsubscribe;
  }, [navigation, numeroDeCompte]);

  const abonnementsParMois = useMemo(() => {
    const groupés = {};

    abonnements
      .sort((a, b) => new Date(a[tri]) - new Date(b[tri]))
      .forEach(item => {
        const date = new Date(item.dateAbonnement);
        const mois = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        if (!groupés[mois]) groupés[mois] = [];
        groupés[mois].push(item);
      });

    return Object.keys(groupés).map(mois => ({
      title: mois.charAt(0).toUpperCase() + mois.slice(1),
      data: groupés[mois],
    }));
  }, [abonnements, tri]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('SuiviAboClient', { idAbonnement: item.id , numeroDeCompte})}
    >
      <View style={styles.coloredBorder} />
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.typeAbonnement}</Text>
        <Text style={styles.discipline}>
          {item.discipline}
          {item.categorie ? ` / ${item.categorie}` : ''}
          {item.sousCategorie ? ` (${item.sousCategorie})` : ''}
        </Text>
        <Text style={styles.expiration}>Expire le : {new Date(item.dateExpiration).toLocaleDateString()}</Text>
        <Text style={styles.abonnement}>Abonné le : {new Date(item.dateAbonnement).toLocaleDateString()}</Text>
      </View>
      <Icon name="chevron-forward" size={24} color="#888" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.monthHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { numeroDeCompte })} 
          style={styles.backButton} activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Abonnements</Text>
        <View style={{ width: 40 }} />
      </View>

      <SectionList
        sections={abonnementsParMois}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun abonnement trouvé</Text>}
        contentContainerStyle={abonnements.length === 0 && { flex: 1, justifyContent: 'center' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e6f0',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2d3d',
    textAlign: 'center',
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    marginTop: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  coloredBorder: {
    width: 6,
    height: '100%',
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 12,
  },
  type: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1e293b',
  },
  discipline: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  expiration: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  abonnement: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 80,
  },
});

export default ListeAbonnements;
