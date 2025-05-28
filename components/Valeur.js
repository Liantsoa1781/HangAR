import React from 'react'
import { View, StyleSheet, Text } from 'react-native'

export default function Valeur() {
  return (
        <View style={styles.textcontainer}> 
            <Text style={styles.title1}>PASSION</Text>
            <Text style={styles.title2}>HUMILITE</Text>
            <Text style={styles.title3}>DISCIPLINE</Text>
            <Text style={styles.title4}>PERSEVERENCE</Text>
        </View>
  );
}

const styles = StyleSheet.create({
  textcontainer:{
    backgroundColor: 'black',
    flexDirection: 'row', //aligne les textes horizontalement
    width: '100%',
    height: 'auto',
    borderRadius: 5,
    marginTop: 20,
  },
  title1: {
    fontSize: 18,
    color: '#ffffff',
  },
  title2: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
    marginTop: 20,
    marginLeft: -7,
  },
  title3: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: -7,
  },
  title4: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 20,
    marginLeft: -7,
  },
})