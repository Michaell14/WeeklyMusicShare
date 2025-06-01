import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUserStore } from '../utils/store';

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        images: Array<{ url: string }>;
    };
}


export default function FriendsList() {
    const { accessToken, userData } = useUserStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<{ display_name: string, id: string } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSendingRequest, setIsSendingRequest] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !accessToken) return;

        setIsSearching(true);
        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/search-user`, {
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
            setSearchResult(data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendFriendRequest = async () => {
        if (!searchResult || !accessToken) return;
        
        setIsSendingRequest(true);
        console.log("sending friend request to: ", searchResult.id);
        console.log("ip: ", process.env.EXPO_PUBLIC_IP);
        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP}:3000/send-friend-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    sender_spotify_id: userData?.id,
                    receiver_spotify_id: searchResult.id
                }),
            });
            console.log("response: ", response);
            const data = await response.json();
            console.log("data: ", data);
            if (data.success) {
                alert('Friend request sent successfully!');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert('Failed to send friend request');
        } finally {
            setIsSendingRequest(false);
        }
    };

    const renderTrackItem = ({ item }: { item: Track }) => (
        <TouchableOpacity
            style={styles.trackItem}
            onPress={() => { }}
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a friend..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                {isSearching && <Text style={styles.loadingText}>Searching...</Text>}

                
                {searchResult && (
                    <View style={styles.searchResultItem}>
                        <Text style={styles.searchResultText}>{searchResult.display_name}</Text>
                        <TouchableOpacity 
                            style={[styles.requestButton, styles.acceptButton]}
                            onPress={handleSendFriendRequest}
                            disabled={isSendingRequest}
                        >
                            <Text style={styles.buttonText}>
                                {isSendingRequest ? 'Sending...' : 'Send Friend Request'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flex: 1,
        backgroundColor: '#25292e',
    },
    searchContainer: {
        width: '100%',
        padding: 20,
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        color: '#000',
        width: '100%',
    },
    searchResults: {
        backgroundColor: '#333',
        borderRadius: 8,
        marginTop: 8,
    },
    searchResultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    searchResultText: {
        color: '#fff',
    },
    requestsContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    requestItem: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    requestText: {
        color: '#fff',
        marginBottom: 8,
    },
    requestButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    requestButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
    },
    acceptButton: {
        backgroundColor: '#1DB954',
    },
    rejectButton: {
        backgroundColor: '#ff4444',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    friendsContainer: {
        flex: 1,
    },
    friendItem: {
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    friendName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    songInfo: {
        marginTop: 4,
    },
    songName: {
        color: '#fff',
        fontSize: 14,
    },
    artistName: {
        color: '#999',
        fontSize: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tabText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#1DB954',
    },
    activeTab: {
        borderBottomColor: '#1DB954',
    },
    loadingText: {
        color: '#fff',
        marginBottom: 10,
    },
    selectedSongContainer: {
        marginBottom: 10,
    },
    selectedSongText: {
        color: '#fff',
        marginBottom: 5,
    },
    timerText: {
        color: '#fff',
        marginBottom: 5,
    },
    resultsList: {
        marginTop: 10,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    albumArt: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    trackInfo: {
        marginLeft: 10,
    },
    trackName: {
        color: '#fff',
        fontSize: 16,
    },


}); 