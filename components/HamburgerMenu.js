import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HamburgerMenu = ({ links, navigation, onClose }) => {
  return (
    <View style={styles.menu}>
      {links.map((link, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => {
            onClose(); // Fermer le menu
            navigation.navigate(link.screen, link.params || {}); // Passer les params
          }}
        >
          <Text style={styles.link}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    backgroundColor: '#fff',
    padding: 20,
    position: 'absolute',
    top: 35,
    left: 9,
    minWidth: 200,
    maxHeight: 300, // limite la hauteur max pour éviter que ce soit trop grand
    zIndex: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 15,
  },
  link: {
    marginVertical: 10,
    fontSize: 18,
  },
});

export default HamburgerMenu;
