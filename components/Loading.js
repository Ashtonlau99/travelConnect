import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React from 'react'
import { themeColors } from '../theme'

export default function Loading() {
    return (
        <View style = {styles.loading}>
            <ActivityIndicator size="large" color={themeColors.lightgrey} />
        </View>
    )
}

const styles = StyleSheet.create({
    loading: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
    }
})