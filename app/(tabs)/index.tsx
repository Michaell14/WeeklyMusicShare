import { useAuthRequest } from "expo-auth-session";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import FriendsList from '../../components/FriendsList';
import { useUserStore } from "./../../utils/store";
import { client_id, discovery, redirect_uri } from './../../var';

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        images: Array<{ url: string }>;
    };
}

export default function Index() {
    const router = useRouter();

    const {
        accessToken,
        isAuthenticated,
        searchQuery,
        searchResults,
        isSearching,
        selectedSong,
        selectionTimer,
    } = useUserStore();

    const {
        setAccessToken,
        setIsAuthenticated,
        setSearchQuery,
        setSearchResults,
        setIsSearching,
        setUserData
    } = useUserStore();

    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'search' | 'friends'>('search');

    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: client_id,
            scopes: ['user-read-email', 'playlist-modify-public'],
            usePKCE: true,
            redirectUri: redirect_uri,
        },
        discovery
    );

    useEffect(() => {
        async function handleResponse() {
            if (response?.type === 'success') {
                const { code } = response.params;

                const codeResponse = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/exchangeCodeForToken`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code,
                        code_verifier: request?.codeVerifier
                    }),
                })
                const codeData = await codeResponse.json();
                if (codeData.access_token) {
                    setIsAuthenticated(true);
                    setAccessToken(codeData.access_token);
                    console.log("codeData.access_token: ", codeData.access_token);
                    // Create or update user
                    const userResponse = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/getcurrentuser`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: codeData.access_token
                        }),
                    })
                    const userData = await userResponse.json();
                    console.log("userData: ", userData);
                    if (userData) {
                        console.log("setting userData: ", userData);
                        setUserData(userData);
                    } else {
                        console.log('Error', 'Failed to get user data');
                    }
                }
            }
        }
        handleResponse();
    }, [response, request]);

    useEffect(() => {
        if (selectionTimer) {
            const updateRemainingTime = () => {
                const now = Date.now();
                const elapsed = now - selectionTimer;
                const remaining = Math.max(0, 60000 - elapsed);
                setRemainingTime(remaining);

                if (remaining === 0) {
                    setRemainingTime(0);
                }
            };

            updateRemainingTime();
            const interval = setInterval(updateRemainingTime, 1000);

            return () => clearInterval(interval);
        } else {
            setRemainingTime(0);
        }
    }, [selectionTimer]);

    const formatTime = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        return `${seconds}s`;
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || !accessToken) return;

        setIsSearching(true);
        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/searchSongs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    query: searchQuery
                }),
            });
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSongPress = async (songId: string) => {
        router.push(`/song-details?id=${songId}`);
    };

    const renderTrackItem = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.trackItem}
            onPress={() => handleSongPress(item.id)}
        >
            <Image
                source={{ uri: item.album.images[0]?.url }}
                style={styles.albumArt}
            />
            <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{item.name}</Text>
                <Text style={styles.artistName}>{item.artists.map((artist: { name: string }) => artist.name).join(', ')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {isAuthenticated && (
                <>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
                            onPress={() => setActiveTab('search')}
                        >
                            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                                Search
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                            onPress={() => setActiveTab('friends')}
                        >
                            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                                Friends
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'search' ? (
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a song..."
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                            />
                            {isSearching && <Text style={styles.loadingText}>Searching...</Text>}
                            {selectedSong && (
                                <View style={styles.selectedSongContainer}>
                                    <Text style={styles.selectedSongText}>
                                        Selected Song: {selectedSong.name}
                                    </Text>
                                    {remainingTime > 0 && (
                                        <Text style={styles.timerText}>
                                            Time remaining: {formatTime(remainingTime)}
                                        </Text>
                                    )}
                                </View>
                            )}
                            <FlatList
                                data={searchResults}
                                renderItem={renderTrackItem}
                                keyExtractor={item => item.id}
                                style={styles.resultsList}
                            />
                        </View>
                    ) : (
                        <FriendsList />
                    )}
                </>
            )}

            {!isAuthenticated && (
                <TouchableHighlight
                    onPress={() => promptAsync()}
                    style={styles.connectButton}
                    underlayColor="#1DB954"
                >
                    <Text style={styles.connectButtonText}>
                        Connect to Spotify
                    </Text>
                </TouchableHighlight>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: "center",
        alignItems: "center",
    },
    searchContainer: {
        width: '100%',
        padding: 20,
        flex: 1,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        marginBottom: 10,
        color: '#000',
    },
    resultsList: {
        flex: 1,
    },
    trackItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        alignItems: 'center',
    },
    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    trackInfo: {
        marginLeft: 10,
        flex: 1,
    },
    trackName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    artistName: {
        color: '#999',
        fontSize: 14,
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginVertical: 10,
    },
    connectButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
        width: '80%',
    },
    connectButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedSongContainer: {
        backgroundColor: '#1DB954',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    selectedSongText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    timerText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 5,
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
    },
    activeTab: {
        borderBottomColor: '#1DB954',
    },
    tabText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#1DB954',
    },
});