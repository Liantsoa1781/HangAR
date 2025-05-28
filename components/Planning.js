import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { SelectList } from 'react-native-dropdown-select-list';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const Planning = ({ numeroDeCompte }) => {
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDanceType, setSelectedDanceType] = useState('Toutes les disciplines');
  const [selectedProfessor, setSelectedProfessor] = useState('Tous les profs');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [hourFilter, setHourFilter] = useState('');

  const [disciplines, setDisciplines] = useState([]);
  const [professors, setProfessors] = useState([]);
  
  const [allowedToReserveNextWeekByDiscipline, setAllowedToReserveNextWeekByDiscipline] = useState({});
   // Helper pour récupérer le lundi de la semaine d'une date
   const getMondayOfWeeks = (date) => {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    monday.setHours(0,0,0,0);
    monday.setDate(monday.getDate() + diff);
    return monday;
  };

  // Fonction pour vérifier la réservation possible semaine suivante par discipline
  const checkReservationAllowed = () => {
    const today = new Date();
    const currentMonday = getMondayOfWeeks(today);
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    // 1. Filtrer les cours peutReserver = true de la semaine en cours
    const thisWeekCourses = schedule.filter(course => {
      if (!course.peutReserver) return false;

      // Date du cours (jour dans la semaine + heure)
      const courseDate = new Date(currentMonday);
      courseDate.setDate(currentMonday.getDate() + course.day);

      // Heure du cours
      const [hour, min] = course.time.split(':').map(Number);
      courseDate.setHours(hour, min, 0, 0);

      // Vérifier que la date du cours est dans la semaine en cours
      return courseDate >= currentMonday && courseDate < nextMonday;
    });

    // 2. Groupage par discipline
    const coursesByDiscipline = {};
    thisWeekCourses.forEach(course => {
      if (!coursesByDiscipline[course.discipline]) {
        coursesByDiscipline[course.discipline] = [];
      }
      coursesByDiscipline[course.discipline].push(course);
    });

    // 3. Pour chaque discipline, vérifier si tous les cours sont passés
    const allowedMap = {};
    Object.entries(coursesByDiscipline).forEach(([discipline, courses]) => {
      // Si au moins un cours n'est pas passé, on interdit la réservation
      const allPassed = courses.every(course => {
        const courseDate = new Date(currentMonday);
        courseDate.setDate(currentMonday.getDate() + course.day);
        const [hour, min] = course.time.split(':').map(Number);
        courseDate.setHours(hour, min, 0, 0);
        return courseDate < today;
      });
      allowedMap[discipline] = allPassed; // true si ok pour réserver la semaine prochaine
    });

    setAllowedToReserveNextWeekByDiscipline(allowedMap);
  };

  useEffect(() => {
    if(schedule.length > 0) {
      checkReservationAllowed();
    }
  }, [schedule]);

      const fetchData = async () => {

        try {
          const response = await axios.get(`http://192.168.88.7:8080/planning/client?numeroDeCompte=${numeroDeCompte}`);
          const data = response.data;
      
          const formattedData = data.map(item => {
            const planning = item.planning || {};
            return {
              id: planning.id,
              day: planning.jour,
              time: planning.heureDebut ? planning.heureDebut.slice(0, 5) : "",
              timeFin: planning.heureFin ? planning.heureFin.slice(0, 5) : "",
              duration: calculateDuration(planning.heureDebut, planning.heureFin),
              discipline: planning.discipline?.discipline || "",
              professor: planning.prof?.prenom || "",
              categorie: planning.categorie?.categorie || "",
              sousCategorie: planning.sousCategorie?.nom || "", 
              peutReserver: item.peutReserver,
              raisonRefus: item.raisonRefus,
              dejaReserve: item.dejaReserve || false
            };
          });
          setSchedule(formattedData);
          setFilteredSchedule(formattedData);
        } catch (error) {
          console.error("Erreur lors de la récupération du planning client :", error);
        }
      };
      
      useEffect(() => {
        fetchData();
      }, []);
      
      useFocusEffect(
        useCallback(() => {
          fetchData();
        }, [])
      );

      useEffect(() => {
        const fetchFilters = async () => {
          try {
            const [disciplineRes, profRes] = await Promise.all([
              axios.get('http://192.168.88.7:8080/disciplines/all'),
              axios.get('http://192.168.88.7:8080/professeurs/all'),
            ]);
      
            setDisciplines(disciplineRes.data);
            setProfessors(profRes.data);
          } catch (error) {
            console.error('Erreur lors du chargement des filtres :', error);
          }
        };
      
        fetchFilters();
      }, []);
      
      const calculateDuration = (start, end) => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        return (endHour * 60 + endMin) - (startHour * 60 + startMin);
      };  

      const days = [0,1,2,3,4,5,6];
      const colors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC'];

      const getMondayOfWeek = (date) => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        monday.setDate(monday.getDate() + diff);
        return monday;
      };

      const getDateForCourse = (monday, dayIndex) => {
        const courseDate = new Date(monday);
        courseDate.setDate(monday.getDate() + dayIndex);
        return courseDate;
      };

      const getDateString = (date) => {
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      };

      const changeWeek = (delta) => {
        const today = new Date();
        const minDate = getMondayOfWeek(today);
        const maxDate = new Date(minDate);
        maxDate.setMonth(maxDate.getMonth() + 1);
      
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + delta * 7);
      
        if (newDate >= minDate && newDate <= maxDate) {
          setCurrentWeek(newDate);
        }
      };  

      // Filtre les cours lorsque la sélection de discipline ou de professeur change
      useEffect(() => {
        const filtered = schedule.filter(course => {
          const disciplineId = disciplines.find(d => d.discipline === course.discipline)?.id.toString() || '0';
          const professorId = professors.find(p => p.prenom === course.professor)?.id.toString() || '0';
      
          const matchesDiscipline = selectedDanceType === '0' || disciplineId === selectedDanceType;
          const matchesProfessor = selectedProfessor === '0' || professorId === selectedProfessor;
      
          return matchesDiscipline && matchesProfessor;
        });
        setFilteredCourses(filtered);
      }, [selectedDanceType, selectedProfessor, schedule, disciplines, professors]);
      

      const renderCoursesByPeriod = (period, courses) => {
        const monday = getMondayOfWeek(currentWeek);
        return (
          <View style={styles.row}>
            {days.map((index) => {
              const dayCourses = courses.filter(course => course.day === index);
              const categorizedCourses = categorizeCourses(dayCourses)[period];
    
              const filteredByHour = hourFilter
                ? categorizedCourses.filter(course => course.time.toLowerCase().includes(hourFilter))
                : categorizedCourses;
    
              return (
                <View key={index} style={styles.column}>
                  {filteredByHour.map((course, i) => {
                    console.log('Cours rendu :', course.id, 'Déjà réservé :', course.dejaReserve);

                    // Vérifier si c'est la semaine prochaine
                    const courseDate = new Date(monday);
                    courseDate.setDate(monday.getDate() + course.day);
                    const [hour, min] = course.time.split(':').map(Number);
                    courseDate.setHours(hour, min, 0, 0);
    
                    // Semaine suivante ?
                    const nextMonday = new Date(getMondayOfWeek(new Date()));
                    nextMonday.setDate(nextMonday.getDate() + 7);
                    const isNextWeek = courseDate >= nextMonday && courseDate < new Date(nextMonday.getTime() + 7*24*60*60*1000);
    
                          // Autorisation de réservation
                    let canReserve = true;
                    if (isNextWeek) {
                      canReserve = allowedToReserveNextWeekByDiscipline[course.discipline] ?? true;
                    }

                    // Si le cours est déjà réservé, on interdit la réservation
                    if (course.dejaReserve) {
                      canReserve = false;
                    }
    
                    return (
                      <View key={i}>
                        <CourseCard
                          numeroDeCompte={numeroDeCompte}
                          course={course}
                          color={colors[(index + i) % colors.length]}
                          date={courseDate}
                          canReserve={canReserve}
                          dejaReserve={course.dejaReserve}
                          onReservation={() => fetchData()} 
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        );
      };
  
    const getDateRangeString = (monday) => {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const options = { day: 'numeric', month: 'short' };
      const start = monday.toLocaleDateString('fr-FR', options);
      const end = sunday.toLocaleDateString('fr-FR', options);

      return ` ${start} - ${end}`;
    };

    const sortByTime = (a, b) => {
      const [h1, m1] = a.time.split(':').map(Number);
      const [h2, m2] = b.time.split(':').map(Number);
      return (h1 * 60 + m1) - (h2 * 60 + m2);
    };


    const categorizeCourses = (courses) => {
      const morning = courses.filter(course => parseInt(course.time.split(':')[0]) < 12).sort(sortByTime);
      const afternoon = courses.filter(course => {
        const hour = parseInt(course.time.split(':')[0]);
        return hour >= 12 && hour < 18;
      }).sort(sortByTime);
      const evening = courses.filter(course => parseInt(course.time.split(':')[0]) >= 18).sort(sortByTime);
      return { morning, afternoon, evening };
    };

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
    <ScrollView
      contentContainerStyle={{ paddingBottom: 10 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScrollView horizontal>
        <View>
          <View style={styles.searchBar}>
          <TouchableOpacity 
            onPress={() => changeWeek(-1)} 
            style={styles.arrowButton}
            disabled={getMondayOfWeek(currentWeek) <= getMondayOfWeek(new Date())}
          >
            <Ionicons name="chevron-back" size={24} color={getMondayOfWeek(currentWeek) <= getMondayOfWeek(new Date()) ? "#ccc" : "#555"} />
          </TouchableOpacity>

          <Text style={styles.weekText}>
            {getDateRangeString(getMondayOfWeek(currentWeek))}
          </Text>

          <TouchableOpacity 
            onPress={() => changeWeek(1)} 
            style={styles.arrowButton}
            disabled={getMondayOfWeek(currentWeek) >= (() => {
              const maxDate = new Date();
              const monday = getMondayOfWeek(maxDate);
              monday.setMonth(monday.getMonth() + 1);
              return monday;
            })()}
          >
            <Ionicons name="chevron-forward" size={24} color={getMondayOfWeek(currentWeek) >= (() => {
              const maxDate = new Date();
              const monday = getMondayOfWeek(maxDate);
              monday.setMonth(monday.getMonth() + 1);
              return monday;
            })() ? "#ccc" : "#555"} />
          </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Filtrer par heure (ex: 10, 14h)"
              onChangeText={text => setHourFilter(text.trim().toLowerCase())}
              value={hourFilter}
            />

            <View style={{ marginBottom: 10 }}>
            <SelectList
              setSelected={(val) => setSelectedDanceType(val)}  // val = id en string
              data={[
                { key: '0', value: 'Toutes les disciplines' },
                ...disciplines.map(d => ({ key: d.id.toString(), value: d.discipline }))
              ]}
              save="key"  // IMPORTANT : on sauvegarde la key (id)
              defaultOption={{ key: '0', value: 'Toutes les disciplines' }}
              boxStyles={styles.picker}
              inputStyles={{ color: '#333' }}
            />
            </View>

            <View style={{ marginBottom: 10 }}>
            <SelectList
              setSelected={(val) => setSelectedProfessor(val)}  // val = id en string
              data={[
                { key: '0', value: 'Tous les profs' },
                ...professors.map(p => ({ key: p.id.toString(), value: p.prenom }))
              ]}
              save="key"
              defaultOption={{ key: '0', value: 'Tous les profs' }}
              boxStyles={styles.picker}
              inputStyles={{ color: '#333' }}
            />
            </View>


          </View>

          <View style={styles.headerRow}>
            {days.map((index) => (
              <Text key={index} style={styles.dayHeader}>
                {`${getDateString(getDateForCourse(getMondayOfWeek(currentWeek), index))}`}
              </Text>
            ))}
          </View>

            <View>
            {/* Matin */}
            <View style={styles.periodRow}>
              <Ionicons name="sunny-outline" size={24} color="#FFD700" style={styles.icon} />
            </View>
            {renderCoursesByPeriod('morning', filteredCourses)}
            <View style={styles.separator} />

            {/* Après-midi */}
            <View style={styles.periodRow}>
              <Ionicons name="sunny" size={24} color="#FFA500" style={styles.icon} />
            </View>
            {renderCoursesByPeriod('afternoon', filteredCourses)}
            <View style={styles.separator} />

            {/* Soir */}
            <View style={styles.periodRow}>
              <Ionicons name="moon" size={24} color="#1E90FF" style={styles.icon} />
            </View>
            {renderCoursesByPeriod('evening', filteredCourses)}
          </View>

        </View>
      </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
    );
};

const CourseCard = ({ course, color, date, numeroDeCompte, canReserve }) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  // Date complète du cours (date + heure)
  const courseDateTime = new Date(date);
  const [hour, minute] = course.time.split(':').map(Number);
  courseDateTime.setHours(hour, minute, 0, 0);

  // Le cours est-il passé ?
  const isPast = courseDateTime < new Date();

  const canAccessDetails = course.peutReserver && !isPast;

  const handlePressIn = () => {
    if (!canAccessDetails) return;
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!canAccessDetails) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (canAccessDetails) {
      navigation.navigate('CourseDetails',  { course, mondayDate: date.toISOString(), idPlanning: course.id, numeroDeCompte });
    }
  };

  return (
    <Animated.View
      style={[
        styles.courseCard,
        { backgroundColor: isPast ? '#ddd' : color, transform: [{ scale: scaleValue }] }
      ]}
    >
      <View style={styles.courseInfo}>
        <View>
          <Text style={[styles.courseTime, isPast && { color: '#999' }]}>
            {course.time} - {course.timeFin} ({course.duration} min)
          </Text>

          <Text style={[styles.courseName, isPast && { color: '#999' }]}>
            {course.discipline}
            {course.categorie && (
              <Text style={styles.courseName}> {course.categorie}</Text>
            )}
            {course.sousCategorie && (
              <Text style={{ fontSize: 13, fontStyle: 'italic' }}> ({course.sousCategorie})</Text>
            )}
          </Text>
        </View>

        {canAccessDetails ? (
          course.dejaReserve ? (
            <Text style={{ color: 'green', marginTop: 7, fontWeight: 'bold' }}>
              Cours déjà réservé
            </Text>
          ) : canReserve ? (
            <TouchableOpacity
              onPress={handlePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.plusButton}
            >
              <Ionicons style={{ marginTop: 5 }} name="add-circle-outline" size={35} color="#555" />
            </TouchableOpacity>
          ) : (
            <Text style={{ color: 'red', marginTop: 7 }}>Pas encore disponible</Text>
          )
        ) : isPast ? (
          <Text style={{ color: '#999', fontStyle: 'italic', marginTop: 5 }}>Cours passé</Text>
        ) : (
          <Text style={{ color: '#999', fontStyle: 'italic', marginTop: 5 }}>Vous n'etes pas abonné a ce cours</Text>
        )}
      </View>
    </Animated.View>
  );
};

  const styles = StyleSheet.create({
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
    },
    disabledButton: {
      backgroundColor: '#ccc'
    },
    courseCategorie: {
      fontSize: 13,
      fontStyle: 'italic',
      color: '#444',
    },
    arrowButton: {
      paddingHorizontal: 10,
    },
    dateText: {
      marginHorizontal: 20,
      fontSize: 16,
    },
    picker: {
      height: 50,
      width: 235,  // Augmenter la largeur pour mieux afficher le texte
      marginHorizontal: 10,
      backgroundColor: '#fff',
      borderColor: '#bbb',
      borderWidth: 1,
      borderRadius: 5,
      overflow: 'visible',  // Assurer que le texte soit visible
    },
    headerRow: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: '#eee',
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 5,
    },
    iconContainer: { justifyContent: 'center', paddingHorizontal: 5 },
    column: {
      flex: 1,
      minWidth: 200,
      paddingHorizontal: 5,
    },
    dayHeader: {
      flex: 1,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
    },
    courseCard: {
      padding: 10,
      borderRadius: 5,
      marginBottom: 8,
      width: 200,
      height: 120,
    },
    courseTime: {
      fontWeight: 'bold',
      marginBottom: 10,
    },
    courseName: {
      marginTop: 2,
      fontSize: 17,
    },
    courseProfessor: {
      fontSize: 15,
      color: '#555',
    },
    plusButton: {
      paddingLeft: 140,
    },
    separator: {
      height: 1,
      backgroundColor: '#ccc',
      marginVertical: 10,
    },
    icon: {
      marginRight: 15,
    },
    periodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 8,
      marginVertical: 10,
      marginHorizontal: 10,
      backgroundColor: '#fff'
    },
    weekText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginHorizontal: 10,
    },
    weekNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
    },
    
});

export default Planning;
