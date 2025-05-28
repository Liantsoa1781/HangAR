import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Entypo, MaterialIcons, Foundation } from '@expo/vector-icons';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.item}>
        <Entypo name="location-pin" size={24} color="black" />
        <Text style={styles.text}>
          Zone Zital - Enceinte Carrefour Akorondrano
        </Text>
      </View>

      <View style={styles.item}>
        <Foundation name="telephone" size={24} color="black" />
        <Text style={styles.text}>
          +261 38 74 010 08
        </Text>
      </View>

      <View style={styles.item}>
        <MaterialIcons name="email" size={24} color="black" />
        <Text style={styles.text}>
          hangardancestudio@gmail.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  text: {
    marginLeft: 10,
  },
});