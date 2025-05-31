import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useUserStore } from './../../utils/store';

export default function AboutScreen() {
    const { userData, selectedSong } = useUserStore();

    useEffect(() => {
        console.log("userData: ", userData);
    }, [userData]);

    if (!userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Please connect to Spotify first</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {userData.images && userData.images[0] && (
                <Image 
                    source={{ uri: userData.images[0].url }} 
                    style={styles.profileImage}
                />
            )}
            <Text style={styles.text}>Welcome, {userData.display_name}!</Text>
            <Text style={styles.text}>Email: {userData.email}</Text>
            <Text style={styles.text}>Followers: {userData.followers?.total}</Text>
            
            {selectedSong && (
                <View style={styles.selectedSongContainer}>
                    <Text style={styles.sectionTitle}>Currently Selected Song</Text>
                    <Image 
                        source={{ uri: selectedSong.album.images[0]?.url }} 
                        style={styles.albumArt}
                    />
                    <Text style={styles.songTitle}>{selectedSong.name}</Text>
                    <Text style={styles.artistName}>
                        {selectedSong.artists.map(artist => artist.name).join(', ')}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        padding: 20,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginVertical: 5,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        alignSelf: 'center',
    },
    selectedSongContainer: {
        marginTop: 30,
        alignItems: 'center',
        backgroundColor: '#1DB954',
        padding: 15,
        borderRadius: 10,
        width: '100%',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    albumArt: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginBottom: 10,
    },
    songTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    artistName: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
        textAlign: 'center',
    },
});
