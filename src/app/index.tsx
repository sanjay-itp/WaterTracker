import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import Background from "@/assets/svg/background.svg";
import { Button } from "@/components/button";
import { auth } from "@/services/firebaseConfig";
import { Link, Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between",
    },
    actionContainer: {
        padding: 18,
    },
    logo: {
        position: "absolute",
        top: 100,
        left: 0,
        right:  0,
        bottom: 0,
    },
    loginContainer: {
        alignItems: "center",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: 'center',
    },
    loginText: {
        color: "#444444",
        fontSize: 16,
    },
    loginTextLink: {
        color: "#000003",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    Welcometext: {
        color: "black",
        fontSize: 30,
        textAlign:"center",
        padding: 25,
        fontFamily: "times new roman",
        //margin: 3,
        fontWeight: "bold",
    },
});

export default function index(){
    const router = useRouter();

   if (auth.currentUser) {
      return <Redirect href="/(home)/homepage" />;
    }
    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View> 
                <Text style={styles.Welcometext}>Our app will help you drink more water and lead a healthy lifestyle everyday!</Text>
            </View>
            </SafeAreaView>
            <View>
                <Background />
                {/* <Image
                    source={require('../assets/svg/background.svg')}
                    style={styles.logo} /> */}
            </View>
            
            <SafeAreaView edges={["bottom"]} style={styles.actionContainer}>
                <Button title="Get Started" type="primary" onPress={() => router.replace('/signup')} />
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have account? </Text>
                    <Link href="/login" style={styles.loginTextLink}>Log In</Link>
                </View>
            </SafeAreaView>
        </View>
    );
}