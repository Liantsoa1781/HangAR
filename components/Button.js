import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper';

export default function Boutton({ mode, style, ...props }) {
  return (
    <PaperButton
      style={[
        styles.button,
        {backgroundColor: '#b90244'},
        style,
      ]}
      labelStyle={styles.text}
      mode={mode}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    marginVertical: 10,
    paddingVertical: 2,
  },
  text: {
    fontSize: 20,
    lineHeight: 26,
  },
})
