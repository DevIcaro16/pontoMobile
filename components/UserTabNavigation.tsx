import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import PontoScreen from '../screens/PontoScreen';
// import HistoricoScreen from '../screens/HistoricoScreen';
import InfoScreen from '../screens/InfoScreen'; // Supondo que este seja o caminho correto

import { useAuth } from '../contexts/AuthContext';//todo contexto
import ExportarScreen from '@/screens/ExportarScreen';
import HistoricoScreen from '@/screens/HistoricoScreen';


const Tab = createBottomTabNavigator();

const UserTabNavigation = () => {

  const { user } = useAuth(); // Obtém o usuário do contexto

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Ponto':
              iconName = 'fingerprint';
              break;
            case 'Exportar':
              iconName = 'file-upload';
              break;
            case 'Info':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'error'; // Ícone padrão para qualquer caso não tratado
          }

          // Retorno do ícone com o nome adequado
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Ponto" component={PontoScreen} />
      {/* <Tab.Screen name="Exportar" component={ExportarScreen} /> */}
      <Tab.Screen name="Histórico" component={HistoricoScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
    </Tab.Navigator>
  );
};

export default UserTabNavigation;
