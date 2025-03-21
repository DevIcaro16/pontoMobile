import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import PontoScreen from '@/screens/PontoScreen';
import LoginScreen from '@/screens/LoginScreen';
import UserTabNavigation from '@/components/UserTabNavigation';
import { View, Text, Modal, ActivityIndicator, ToastAndroid, StyleSheet } from 'react-native';
import api from '@/config/api';
import { useUserDatabase } from '@/database/useUserDatabase';

const Stack = createStackNavigator();

const AuthNavigation = () => {
    const { user } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [apiVersion, setApiVersion] = useState("");
    const [dadosEmpresaSincronia, setDadosEmpresaSincronia] = useState([]);
    const [dadosSetoresSincronia, setDadosSetoresSincronia] = useState([]);
    const [dadosUsuariosSincronia, setDadosUsuariosSincronia] = useState([]);

    useEffect(() => {
        const fetchApiVersion = async () => {
            try {
                ToastAndroid.show("Verificando versão da API...", ToastAndroid.SHORT);

                const response = await api.get("/apiversion");

                if (response.data.success) {
                    setApiVersion(response.data.apiversion);
                    ToastAndroid.show(`API Versão: ${response.data.apiversion}`, ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show("Erro ao buscar versão da API", ToastAndroid.LONG);
                }
            } catch (error) {
                ToastAndroid.show("Falha na conexão com a API", ToastAndroid.LONG);
            }
        };

        const fetchSincronia = async () => {
            try {
                ToastAndroid.show("Aguarde, sincronizando com a base de dados...", ToastAndroid.SHORT);

                const response = await api.get("/sincronizar");

                if (response.data.success) {
                    setDadosEmpresaSincronia(response.data.empresas);
                    setDadosSetoresSincronia(response.data.setores);
                    setDadosUsuariosSincronia(response.data.usuarios);
                    ToastAndroid.show(`Sincronia Realizada!`, ToastAndroid.SHORT);
                    // console.log(dadosEmpresaSincronia);

                } else {
                    ToastAndroid.show("Erro ao tentar sincronizar com a base", ToastAndroid.LONG);
                }
            } catch (error) {
                ToastAndroid.show("Falha na conexão com a API", ToastAndroid.LONG);
            }
        };

        // Definindo o loading como true antes das requisições
        setLoading(true);
        fetchApiVersion();
        fetchSincronia();
    }, []);

    useEffect(() => {
        // Certificando-se de que a sincronização é feita somente após a autenticação do usuário
        const sincronizar = async () => {
            const useDatabase = useUserDatabase();
            try {
                await useDatabase.sincronizarEmpresas(dadosEmpresaSincronia);
                await useDatabase.sincronizarSetores(dadosSetoresSincronia);
                await useDatabase.sincronizarUsuarios(dadosUsuariosSincronia);
                console.log("Sincronizado com Sucesso!");
                setLoading(false);
            } catch (error) {
                console.error("Erro ao sincronizar empresas:", error);
                setLoading(false); // Certifique-se de atualizar o estado mesmo em caso de erro
            }
        };

        if (user && dadosEmpresaSincronia.length > 0) {
            // buscarUltimos30Pontos();
        }

        if (dadosEmpresaSincronia.length > 0 || dadosSetoresSincronia.length || dadosUsuariosSincronia.length) {
            sincronizar();
        }

    }, [user, dadosEmpresaSincronia, dadosSetoresSincronia, dadosUsuariosSincronia]);

    if (loading) {
        return (
            <Modal visible={true} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Aguarde...</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="PontoScreen" component={UserTabNavigation} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
};


// Estilos para o Modal de carregamento
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

const App = () => {
    return (
        <AuthProvider>
            <AuthNavigation />
        </AuthProvider>
    );
};

export default App;
