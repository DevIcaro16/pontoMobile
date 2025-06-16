import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import NetInfo from '@react-native-community/netinfo';
import PontoScreen from '@/screens/PontoScreen';
import LoginScreen from '@/screens/LoginScreen';
import UserTabNavigation from '@/components/UserTabNavigation';
import { View, Text, Modal, ActivityIndicator, ToastAndroid, StyleSheet, Alert } from 'react-native';
import api from '@/config/api';
import { getDatabase, useUserDatabase } from '@/database/useUserDatabase';

const Stack = createStackNavigator();

const AuthNavigation = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [apiVersion, setApiVersion] = useState("");
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [dadosEmpresaSincronia, setDadosEmpresaSincronia] = useState([]);
    const [dadosSetoresSincronia, setDadosSetoresSincronia] = useState([]);
    const [dadosFuncoesSincronia, setDadosFuncoesSincronia] = useState([]);
    const [dadosUsuariosSincronia, setDadosUsuariosSincronia] = useState([]);
    const [dadosParametrosSincronia, setDadosParametrosSincronia] = useState([]);
    const [dadosRequisicoesSincronia, setDadosRequisicoesSincronia] = useState([]);

    const userID = user?.id || user?.response?.[0]?.id;
    console.log(userID);

    // Função para sincronizar batidas (agora chamada dentro de useEffect)
    // const sincronizarBatidas = async (userId: number) => {
    //     try {
    //         const unsubscribe = NetInfo.addEventListener(state => {
    //             setIsConnected(state.isConnected ?? false);
    //         });

    //         if (!isConnected) return;

    //         const response = await api.post("/sincronizarBatidas", {
    //             userId: userId
    //         });

    //         console.log(response.data.pontos);

    //         const useDatabase = useUserDatabase();

    //         const puxarPontos = await useDatabase.registrarBatidasPonto(response.data.pontos);

    //         if (puxarPontos.isSuccess) {
    //             Alert.alert('Aviso', puxarPontos.message);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // Fetch de versão da API e sincronização inicial
    useEffect(() => {
        const fetchApiVersion = async () => {
            try {
                ToastAndroid.show("Verificando versão da API...", ToastAndroid.SHORT);
                const response = await api.get("/apiversion");

                if (response.data.success) {
                    console.log("Conectado com a Versão da API");
                    // setLoading(false)
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
            // const useDatabase = useUserDatabase();
            try {
                ToastAndroid.show("Aguarde, sincronizando com a base de dados...", ToastAndroid.SHORT);

                const response = await api.get("/sincronizar");
                console.log("SINCRONIA: " + response.data.success);

                if (response.data.success) {
                    setDadosEmpresaSincronia(response.data.empresas);
                    setDadosSetoresSincronia(response.data.clientes);
                    setDadosFuncoesSincronia(response.data.funcoes);
                    setDadosUsuariosSincronia(response.data.users);
                    setDadosParametrosSincronia(response.data.parametros);
                    ToastAndroid.show("Sincronia Realizada!", ToastAndroid.SHORT);
                } else {
                    ToastAndroid.show("Erro ao tentar sincronizar com a base", ToastAndroid.LONG);
                }
            } catch (error) {
                setTimeout(() => {
                    setLoading(false);
                }, 5000);
                ToastAndroid.show("Falha na conexão com a API", ToastAndroid.LONG);
                // await useDatabase.buscarEmpresas();
            }
        };

        setLoading(true);
        fetchApiVersion();
        fetchSincronia();
    }, []); // ✅ Executa apenas uma vez ao montar o componente

    // Sincroniza batidas apenas quando `user` muda
    // useEffect(() => {
    //     if (user) {
    //         sincronizarBatidas(userID);
    //     }
    // }, [user]);

    // Sincroniza os dados obtidos
    useEffect(() => {
        const sincronizar = async () => {
            const useDatabase = useUserDatabase();
            try {
                await useDatabase.sincronizarEmpresas(dadosEmpresaSincronia);
                await useDatabase.sincronizarSetores(dadosSetoresSincronia);
                await useDatabase.sincronizarFuncoes(dadosFuncoesSincronia);
                await useDatabase.sincronizarUsuarios(dadosUsuariosSincronia);
                await useDatabase.sincronizarParametros(dadosParametrosSincronia);
                await useDatabase.sincronizarRequisicoes(dadosRequisicoesSincronia);
                console.log("Sincronizado com Sucesso!");
                setLoading(false);
            } catch (error) {
                console.error("Erro ao sincronizar empresas:", error);
                setLoading(false);
            }
        };

        // if (

        //     (dadosEmpresaSincronia.length > 0 ||
        //         dadosSetoresSincronia.length > 0 ||
        //         dadosFuncoesSincronia.length > 0 ||
        //         dadosUsuariosSincronia.length > 0)
        // ) {
        sincronizar();
        // }
    }, [user, dadosEmpresaSincronia, dadosSetoresSincronia, dadosFuncoesSincronia, dadosUsuariosSincronia]);

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
