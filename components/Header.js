import React from 'react'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

export default function Header(props) {
  return <Text style={styles.header}>{props.children}</Text>
}

const styles = StyleSheet.create({
  header: {
    fontSize: 21,
    color: '#6990b9',
    fontWeight: 'bold',
    paddingVertical: 12,
  },
})
