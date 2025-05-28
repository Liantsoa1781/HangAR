import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Connexion from './screens/Connexion';
import Accueil from './screens/Accueil';
import Dashboard from './screens/Dashboard';
import CourseDetails from './screens/CourseDetails';
import SuiviAboClient from './screens/SuiviAboClient';
import InsertionAbonnee from './screens/InsertionAbonnee'; 
import HistoriqueReservation from './screens/HistoriqueReservation';
import ListeAbonnes from './screens/ListeAbonnes';
import ModifierPlanning from './screens/ModifierPlanning';
import ModifierCours from './screens/ModifierCours';
import AjoutCours from './screens/AjoutCours';
import DetailsAbonnement from './screens/DetailsAbonnement';
import AjouterAbonnement from './screens/AjouterAbonnement';
import RenouvellementPage from './screens/RenouvellementPage';
import InsertionAdmin from './screens/InsertionAdmin';
import ListeAdmin from './screens/ListeAdmin';
import ListeAbonnements from './screens/ListeAbonnements';
import Reservation from './screens/Reservation';
import RegisterScreen from './screens/RegisterScreen';
import { UserProvider } from './screens/UserContext';
import DashboardAdmin from './screens/DashboardAdmin';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
    <NavigationContainer>
    <Stack.Navigator
        initialRouteName="AppInit"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Accueil" component={Accueil} options={{ headerShown: false }} />
        <Stack.Screen name="Connexion" component={Connexion} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        <Stack.Screen name="CourseDetails" component={CourseDetails} options={{ headerShown: false }} />
        <Stack.Screen name="SuiviAboClient" component={SuiviAboClient} options={{ headerShown: false }} />
        <Stack.Screen name="ListeAbonnements" component={ListeAbonnements} options={{ headerShown: false }}  />
        <Stack.Screen name="InsertionAbonnee" component={InsertionAbonnee} options={{ headerShown: false }} />
        <Stack.Screen name="HistoriqueReservation" component={HistoriqueReservation} options={{ headerShown: false }} />
        <Stack.Screen name="ListeAbonnes" component={ListeAbonnes} options={{ headerShown: false }} />
        <Stack.Screen name="ModifierPlanning" component={ModifierPlanning} options={{ headerShown: false }} />
        <Stack.Screen name="ModifierCours" component={ModifierCours} options={{ headerShown: false }}/>
        <Stack.Screen name="AjoutCours" component={AjoutCours} options={{ headerShown: false }}/>
        <Stack.Screen name="DetailsAbonnement" component={DetailsAbonnement} options={{ headerShown: false }}/>
        <Stack.Screen name="AjouterAbonnement" component={AjouterAbonnement} options={{ headerShown: false }}/>
        <Stack.Screen name="RenouvellementPage" component={RenouvellementPage} options={{ headerShown: false }}/>
        <Stack.Screen name="InsertionAdmin" component={InsertionAdmin} options={{ headerShown: false }}/>
        <Stack.Screen name="ListeAdmin" component={ListeAdmin} options={{ headerShown: false }}/>
        <Stack.Screen name="Reservation" component={Reservation} options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} options={{ headerShown: false }}/>
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}
