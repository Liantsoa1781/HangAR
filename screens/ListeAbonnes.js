  import React, { useState, useEffect , useRef, useCallback } from 'react';
  import { useFocusEffect } from '@react-navigation/native';
  import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    FlatList, ActivityIndicator, Alert
  } from 'react-native';
  import { theme } from '../core/theme';
  import HamburgerMenu from '../components/HamburgerMenu';
  import { Entypo } from '@expo/vector-icons';
  import DropDownPicker from 'react-native-dropdown-picker';
  import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useUser } from './UserContext';
  import { Ionicons } from '@expo/vector-icons';

  
  const normalizeString = (str) => str?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');

  const ListeAbonnes = ({ navigation, route  }) => {
    const { user, setUser } = useUser();

    useEffect(() => {
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: 'Connexion' }] });
        return;
      }
      if (user.status !== 'admin') {
        alert('Accès refusé');
        navigation.goBack();
        return;
      }
    }, [user]);
  
    const isSuperAdmin = user?.super_admin === true;

    const [isMenuVisible, setMenuVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const toggleMenu = () => setMenuVisible(prev => !prev);
    const toggleFilters = () => setShowFilters(prev => !prev);

    const links = [
      { label: 'Nouvel abonné', screen: 'InsertionAbonnee' },
      ...(isSuperAdmin ? [{ label: 'Liste des admins', screen: 'ListeAdmin' }] : []),
      { label: 'Les Reservations', screen: 'Reservation' },
      { label: 'Planning', screen: 'ModifierPlanning' },
      { label: 'Tableau de bord', screen: 'DashboardAdmin' },
    ];

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('startDate');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('');

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(statusFilter);
    const [items, setItems] = useState([
      { label: 'Tous', value: 'tous' },
      { label: 'Expiré', value: 'expiré' },
      { label: 'En cours', value: '' },
      { label: 'À venir', value: 'a venir' },
    ]);  

    const flatListRef = useRef(null);

    const fetchAbonnements = () => {
      let url;
    
      if (statusFilter === 'tous') {
        url = `http://192.168.88.7:8080/abonnement/tous`;
      } else if (statusFilter === '') {
        url = `http://192.168.88.7:8080/abonnement/en-cours`;
      } else {
        url = `http://192.168.88.7:8080/abonnement/statut?val=${statusFilter}`;
      }
    
      setLoading(true);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const formattedData = data.map((item) => ({
            id: item.id.toString(),
            numeroDeCompte: item.numeroDeCompte || '—',
            nomClient: item.nomClient,
            prenomClient: item.prenomClient,
            typeAbonnement: item.typeAbonnement,
            dateAbonnement: new Date(item.dateAbonnement),
            dateExpiration: new Date(item.dateExpiration),
            joursRestants: item.joursRestants,
            seancesRestantes: item.seancesRestantes,
            disciplines: item.disciplines || [],
          }));
          setSubscriptions(formattedData);
        })
        .catch(error => console.error('Erreur API abonnements :', error))
        .finally(() => setLoading(false));
    };
    
    useFocusEffect(
      useCallback(() => {
        fetchAbonnements();
      }, [statusFilter])
    );    

    const sortedSubscriptions = [...subscriptions].sort((a, b) => {
      const dateA = sortBy === 'startDate' ? a.dateAbonnement : a.dateExpiration;
      const dateB = sortBy === 'startDate' ? b.dateAbonnement : b.dateExpiration;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, statusFilter]);  

    const filteredSubscriptions = sortedSubscriptions.filter((item) => {
      const query = normalizeString(searchQuery);
    
      const numeroSansPrefixe = normalizeString(item.numeroDeCompte?.replace(/^HG-/, ''));
    
      const fields = [
        numeroSansPrefixe,
        normalizeString(item.numeroDeCompte),
        item.nomClient,
        item.prenomClient,
      ];
    
      return fields.some(field =>
        normalizeString(String(field)).includes(query)
      );
    });  

    const paginatedSubscriptions = filteredSubscriptions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);  

    const toggleSortByName = () => {
      setSortBy('name');
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      setShowFilters(false); // Ferme le menu automatiquement
    };

    const handleStatusChange = (itemValue) => {
      setStatusFilter(itemValue);
      setShowFilters(false); // Ferme le menu automatiquement
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Icons header */}
        {isMenuVisible && (
            <HamburgerMenu links={links} navigation={navigation} onClose={toggleMenu} />
          )}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
            <Entypo name="menu" size={30} color="black" />
          </TouchableOpacity>

          <View style={{ flex: 1 }} /> {/* Pour pousser l'icône à droite */}

          {/* Icône de profil */}
            <TouchableOpacity onPress={() => setShowProfile(prev => !prev)} style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={33} color="black" />
            </TouchableOpacity>

          <TouchableOpacity onPress={toggleFilters} style={styles.iconButton}>
            <Entypo name="dots-three-horizontal" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Liste des Abonnés</Text>
        <TextInput
          style={styles.input}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {showFilters && (
          <View style={styles.filterMenuContainer}>
            <Text style={styles.sortLabel}>Trier par :</Text>
            <TouchableOpacity style={styles.sortButton} onPress={toggleSortByName}>
              <Text style={styles.sortButtonText}>🔤 Nom (A → Z / Z → A)</Text>
            </TouchableOpacity>

            <Text style={styles.sortLabel}>Filtrer par statut :</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={(callback) => {
                const selected = callback(value);
                setValue(selected);
                handleStatusChange(selected);
              }}
              setItems={setItems}
              style={{ marginBottom: open ? 120 : 10 }}
              placeholder="Filtrer par statut"
              dropDownDirection="BOTTOM"
              zIndex={1000}
              zIndexInverse={1000}
            />
          </View>
        )}

          {showProfile && (
            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>👤 {user.prenom} </Text>
              <Text>Statut : {user.status}</Text>
            
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  Alert.alert(
                    'Déconnexion',
                    'Voulez-vous vraiment vous déconnecter ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Oui',
                        onPress: () => {
                          setUser(null);
                          setShowProfile(false);
                          navigation.reset({ index: 0, routes: [{ name: 'Accueil' }] });
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text style={{ color: 'white' }}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          )}

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <ScrollView horizontal>
            <View>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Numero de compte</Text>
                <Text style={styles.tableHeaderText}>Nom</Text>
              </View>

              <FlatList
                ref={flatListRef}
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <TouchableOpacity
                      style={styles.tableCell}
                      onPress={() => navigation.navigate('DetailsAbonnement', { numeroDeCompte: item.numeroDeCompte })}
                    >
                      <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline'}}>
                        {item.numeroDeCompte}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.tableCell}>{item.nomClient} {item.prenomClient}</Text>
                  </View>
                )}
                getItemLayout={(data, index) => ({
                  length: 60, // hauteur approximative d'un item (ajuste si nécessaire)
                  offset: 60 * index,
                  index,
                })}
              />


            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: totalPages }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentPage(index + 1)}
                  style={{
                    padding: 8,
                    margin: 4,
                    backgroundColor: currentPage === index + 1 ? theme.colors.primary : '#ccc',
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: '#fff' }}>{index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>

            </View>
          </ScrollView>
        )}
      </View>
      </View>
  </KeyboardAvoidingView>
  </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      marginTop: 10,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginBottom: 10,
    },
    iconButton: {
      padding: 5,
    },
    
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    sortContainer: {
      marginBottom: 10,
    },
    sortLabel: {
      fontSize: 16,
      marginBottom: 5,
    },
    sortButton: {
      padding: 8,
      backgroundColor: '#f0f0f0',
      marginBottom: 6,
      borderRadius: 5,
    },
    sortButtonText: {
      fontSize: 16,
    },
    filterContainer: {
      marginBottom: 20,
    },

    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f1f1f1',
      padding: 10,
    },
    tableHeaderText: {
      flex: 1,
      fontWeight: 'bold',
      fontSize: 14,
      minWidth: 150,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    tableCell: {
      flex: 1,
      fontSize: 14,
      minWidth: 170,
    },
    filterMenuContainer: {
      position: 'absolute',
      top: 50,
      right: 10,
      zIndex: 20,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 15,
      elevation: 5,
      width: 270,
      height: 200,
    },
    profileCard: {
      position: 'absolute',
      top: 50,
      right: 15,
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      zIndex: 2000,
    },
    profileTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
    },
    logoutButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: 'red',
      borderRadius: 5,
      alignItems: 'center',
    }
    
  });

  export default ListeAbonnes; 