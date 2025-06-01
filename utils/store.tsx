// store.ts
import { create } from 'zustand';

interface SpotifyUser {
    display_name: string;
    email: string;
    followers: {
        total: number;
    };
    id: string;
    images: Array<{
        url: string;
    }>;
}

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        images: Array<{ url: string }>;
        name: string;
        release_date: string;
    };
    duration_ms: number;
    popularity: number;
    preview_url: string;
}

interface UserState {
    accessToken: string;
    userData: SpotifyUser | null;
    isAuthenticated: boolean;
    searchQuery: string;
    searchResults: Track[];
    isSearching: boolean;
    selectedSong: Track | null;
    selectionTimer: number | null;
    setAccessToken: (newAccessToken: string) => void;
    setUserData: (newUserData: SpotifyUser) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: Track[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    setSelectedSong: (song: Track | null) => void;
    setSelectionTimer: (timer: number | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    accessToken: "",
    userData: null,
    isAuthenticated: false,
    searchQuery: "",
    searchResults: [],
    isSearching: false,
    selectedSong: null,
    selectionTimer: null,
    setAccessToken: (newAccessToken: string) => {
        set({ accessToken: newAccessToken })
    },
    setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated })
    },
    setSearchQuery: (query: string) => {
        set({ searchQuery: query })
    },
    setSearchResults: (results: Track[]) => {
        set({ searchResults: results })
    },
    setIsSearching: (isSearching: boolean) => {
        set({ isSearching })
    },
    setSelectedSong: (song: Track | null) => {
        set({ selectedSong: song })
    },
    setSelectionTimer: (timer: number | null) => {
        set({ selectionTimer: timer })
    },
    setUserData: (newUserData: SpotifyUser) => {
        set({ userData: newUserData })
    },
}));