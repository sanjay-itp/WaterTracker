import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
    container: {
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        alignSelf: 'flex-start'
    },
});

export function BackButton({ type = 'dark' }: { type?: 'light' | 'dark' }) {
    const router = useRouter();
    return (
        <TouchableOpacity onPress={() => router.back()} style={styles.container}>
            <Ionicons name="chevron-back" size={24} color={type == "dark" ? "black" : "white"} />
        </TouchableOpacity>
    )
}