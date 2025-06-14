import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#25292e',
                },
            }}
        >

            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="song-details"
                options={{
                    title: 'Song Details',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} color={color} size={24} />
                    ),
                }}
            />
             <Tabs.Screen
                name="about"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person-circle-outline' : 'person-circle-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
