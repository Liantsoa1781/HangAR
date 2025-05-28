import React from 'react'
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';

export default function Paragraph(props) {
  return <Text style={styles.text} {...props} />
}

const styles = StyleSheet.create({
  text: {
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 50,
  },
})
