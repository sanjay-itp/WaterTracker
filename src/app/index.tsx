import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import Logo from "@/assets/svg/logo.svg";
import { Button } from "@/components/button";
import { auth } from "@/services/firebaseConfig";
import { Link, Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",          
        justifyContent: "space-between",
    },
    actionContainer: {
        padding: 18,
    },
    logoBox: {
        width: "50%",               
        maxWidth: 2000,              
        aspectRatio: 1,             
        maxHeight: "100%",          
        right: 50, 
        bottom: 50,
    },
    loginContainer: {
        alignItems: "center",
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
    },
    loginText: {
        color: "#BBBBBB",                 
        fontSize: 16,
    },
    loginTextLink: {
        color: "#FFFFFF",                 
        fontSize: 16,
        textDecorationLine: "underline",
    },
    Welcometext: {
        color: "#FFFFFF",                 
        fontSize: 30,
        textAlign: "center",
        padding: 20,
        fontFamily: "times new roman",
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
                <Logo style={styles.logoBox}/>
                {/* <Image
                    source={require(../assets/svg/background.svg')}
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