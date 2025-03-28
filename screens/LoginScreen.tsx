import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, Text, TouchableOpacity, StatusBar } from 'react-native';
import axios from 'axios';
import { useUserDatabase } from '@/database/useUserDatabase';
import { useNavigation } from 'expo-router';
import PontoScreen from '@/screens/PontoScreen';
import { useAuth } from '@/contexts/AuthContext';
import "../assets/images/icon.png";
import api from '@/config/api';

const LoginScreen = () => {

    const { loginAuth } = useAuth();

    const [id, setId] = useState<number>(0);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [empresa, setEmpresa] = useState<string>('');
    const [cliente, setCliente] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const navigation = useNavigation();

    useEffect(() => {
        if (isAuthenticated) {
            // navigation.navigate('Ponto');
            const user = true;
        }
    }, [isAuthenticated]);

    const userDatabase = useUserDatabase();


    async function login() {

        try {
            if (username === '' || password === '') {
                // Alert.alert("Preencha todos os campos!");
                // return;
            }


            // const response = await api.post("/login", {
            //     empresa: empresa,
            //     login: username,
            //     senha: password
            // });

            const response = await userDatabase.login(empresa, username, password);

            if (!response || typeof response === "string") {
                Alert.alert(response || "Erro desconhecido ao realizar login!");
                return;
            }

            Alert.alert("Usuário Logado com Sucesso!");

            loginAuth({ response });

            setIsAuthenticated(true);

        } catch (error: any) {
            if (error.response) {
                // Erros retornados pelo servidor (ex: 400, 404, 500)
                console.log("Erro da API:", error.response.data);
                Alert.alert("Erro ao fazer login", error.response.data.message || "Tente novamente.");
            } else if (error.request) {
                // Erro na requisição (ex: falha de conexão)
                console.log("Erro na requisição:", error.request);
                Alert.alert("Erro na conexão", "Não foi possível conectar ao servidor.");
            } else {
                // Erros desconhecidos
                console.log("Erro desconhecido:", error);
                Alert.alert("Erro inesperado", "Ocorreu um erro inesperado.");
            }
        }
    }


    return (

        <View style={styles.container}>
            {/* <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent /> */}

            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Login</Text>

            <TextInput
                autoCapitalize="none"
                placeholder="Empresa"
                value={empresa}
                onChangeText={setEmpresa}
                style={styles.input}
            />
            <TextInput
                autoCapitalize="none"
                placeholder="Usuário"
                value={username}
                // value="ADMIN"
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                autoCapitalize="none"
                placeholder="Senha"
                secureTextEntry
                value={password}
                // value="102030"
                onChangeText={setPassword}
                style={styles.input}
            />


            <TouchableOpacity style={styles.button} onPress={login}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.button} onPress={list}>
                <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity> */}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        padding: 10,
        marginBottom: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
    },
    logo: {
        width: 200, // Ajuste conforme necessário
        height: 100, // Ajuste conforme necessário
        marginTop: -48,
        marginBottom: 128,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#2196F3',
        height: 56,
        width: 160,
        marginTop: 20,
        padding: 18,
        borderRadius: 12
    },
    buttonText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 16
    }
});

export default LoginScreen;