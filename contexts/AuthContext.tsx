import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    user: any;
    loginAuth: (userData: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

interface User {
    id: number;
    empresa: string;
    cliente: string;
    username: string | null;
    password: string;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Carrega os dados do usuário ao iniciar o app
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));  // Carrega os dados do usuário no estado
                }
            } catch (error) {
                console.error("Erro ao carregar o usuário:", error);
            }
        };

        loadUser();
    }, []);


    const loginAuth = (userData: any) => {
        console.log("Login realizado:", userData);
        setUser(userData);
        AsyncStorage.setItem("user", JSON.stringify(userData));
    };

    // const logout = async () => {
    //     setUser(null);
    //     await AsyncStorage.removeItem("user"); // Remove do AsyncS
    //     console.log("Logout realizado");

    // };

    const logout = async () => {
        try {
            setUser(null); // Limpa o estado
            await AsyncStorage.removeItem("user");
            console.log("Logout realizado");
        } catch (error) {
            console.error("Erro ao realizar logout:", error);
        }
    };


    return (
        <AuthContext.Provider value={{ user, loginAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
