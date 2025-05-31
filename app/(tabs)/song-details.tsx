import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { useGlobalStore, useUserStore } from '../../utils/store';

export default function SongDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { accessToken, searchResults, setSelectedSong, selectionTimer, setSelectionTimer } = useUserStore();
    const { ip } = useGlobalStore();

    const song = searchResults.find(track => track.id === id);
    
    useEffect(() => {
        if (selectionTimer) {
            const timer = setTimeout(() => {
                setSelectedSong(null);
                setSelectionTimer(null);
            }, 60000); // 60000 ms = 1 minute

            return () => clearTimeout(timer);
        }
    }, [selectionTimer]);

    if (!song) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Song not found</Text>
            </View>
        );
    }

    const handleSongUpdate = async (songId: string) => {
        if (song) {
            // Update selected song in database
            if (accessToken) {
                console.log("UPDATING A SONG HEREREHUEISJNSIJEFNEIJFNIJEFNIJWEn");
                try {
                    await fetch(`http://${ip}:3000/update-selected-song`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: accessToken,
                            song: {
                                id: song.id,
                                name: song.name,
                                artists: song.artists.map(artist => artist.name)
                            }
                        }),
                    });
                } catch (error) {
                    console.error('Error updating selected song:', error);
                }
            }
        }
        router.push(`/song-details?id=${songId}`);
    };

    const handleSelectSong = () => {
        if (selectionTimer) {
            Alert.alert(
                "Cannot Select Song",
                "Please wait for the current selection timer to expire before selecting a new song.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Confirm Selection",
            "This selection cannot be changed for one minute. Are you sure you want to select this song?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Confirm",
                    onPress: () => {
                        handleSongUpdate(song.id);
                        setSelectedSong(song);
                        setSelectionTimer(Date.now());
                        router.back();
                    }
                }
            ]
        );
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Image 
                source={{ uri: song.album.images[0]?.url }} 
                style={styles.albumArt}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.songName}>{song.name}</Text>
                <Text style={styles.artistName}>
                    {song.artists.map(artist => artist.name).join(', ')}
                </Text>
                <Text style={styles.albumName}>Album: {song.album.name}</Text>
                <Text style={styles.releaseDate}>
                    Released: {new Date(song.album.release_date).toLocaleDateString()}
                </Text>
                <Text style={styles.duration}>
                    Duration: {formatDuration(song.duration_ms)}
                </Text>
                <Text style={styles.popularity}>
                    Popularity: {song.popularity}%
                </Text>
            </View>

            <TouchableHighlight
                onPress={handleSelectSong}
                style={[
                    styles.selectButton,
                    selectionTimer ? styles.selectButtonDisabled : null
                ]}
                underlayColor="#1DB954"
                disabled={!!selectionTimer}
            >
                <Text style={styles.selectButtonText}>
                    {selectionTimer ? 'Selection Locked' : 'Select Song'}
                </Text>
            </TouchableHighlight>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        padding: 20,
    },
    albumArt: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
    },
    songName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    artistName: {
        color: '#1DB954',
        fontSize: 18,
        marginBottom: 16,
        textAlign: 'center',
    },
    albumName: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    releaseDate: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    duration: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    popularity: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    selectButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
    },
    selectButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
    },
    selectButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.7,
    },
}); 