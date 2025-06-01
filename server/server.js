const { discovery, redirect_uri, client_id } = require("./utils/var");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(express.json());

const getCurrentUser = async (access_token) => {
    console.log("access token: ", access_token);
    const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            console.log("response: ", response);
            return response.json()
        })
        .then((data) => {
            console.log('User Profile:', data);
            return data;
        })
        .catch((error) => {
            console.error('Error fetching user profile:', error);
        });
    return response;
};

// Example exchange function (in production, do this server-side!)
const exchangeCodeForToken = async (code, code_verifier) => {
    console.log(discovery.tokenEndpoint);
    try {
        // This is just a demonstration - in a real app, do this server-side
        const token_response = await fetch(discovery.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: client_id,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirect_uri,
                code_verifier: code_verifier || '' // PKCE code verifier
            }).toString()
        });

        const token_data = await token_response.json();
        return token_data.access_token;
    } catch (error) {
        console.error("Error exchanging code for token:", error);
    }
};

app.post('/exchangecodefortoken', async (req, res) => {
    const { code, code_verifier } = req.body;

    if (!code) {
        return res.status(400).send('Code is required');
    } else if (!code_verifier) {
        return res.status(400).send("Code verifier is required");
    }
    // Call the exchange function here
    const access_token = await exchangeCodeForToken(code, code_verifier);
    res.send({
        success: true,
        access_token: access_token,
    });
});

// Search Spotify
const searchSpotifySongs = async (access_token, query) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        console.error('Error searching Spotify:', error);
        throw error;
    }
};

const searchUser = async (access_token, query) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log("data: ", data);
        return data;
    } catch (error) {
        console.error('Error searching Spotify:', error);
        throw error;
    }
};

app.post('/searchSongs', async (req, res) => {
    const { access_token, query } = req.body;
    if (!access_token || !query) {
        return res.status(400).send('Access token and query are required');
    }
    try {
        const results = await searchSpotifySongs(access_token, query);
        res.json(results);
    } catch (error) {
        res.status(500).send('Error searching Spotify');
    }
});

app.post('/search-user', async (req, res) => {
    const { access_token, query } = req.body;
    if (!access_token || !query) {
        return res.status(400).send('Access token and query are required');
    }
    try {
        const results = await searchUser(access_token, query);
        res.json(results);
    } catch (error) {
        res.status(500).send('Error searching Spotify');
    }
});

// Create or update user
app.post('/getcurrentuser', async (req, res) => {
    const { access_token } = req.body;
    
    try {
        const userProfile = await getCurrentUser(access_token);
        console.log("userProfile: ", userProfile);

        if (!userProfile) {
            return res.status(400).send('Failed to get user profile');
        }

        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('spotify_id', userProfile.id)
            .single();

        console.log("existingUser: ", existingUser);
        console.log("fetchError: ", fetchError);

        if (fetchError && fetchError.code !== 'PGRST116') {
            return res.status(500).send('Error checking user existence');
        }

        if (existingUser) {
            // Update existing user
            const { error: updateError } = await supabase
                .from('users')
                .update({ name: userProfile.display_name })
                .eq('spotify_id', userProfile.id);

            if (updateError) {
                return res.status(500).send('Error updating user');
            }

            return res.json(userProfile);
        } else {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        spotify_id: userProfile.id,
                        name: userProfile.display_name
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.log("insertError: ", insertError);
                console.log("There was an error creating the user SUPPERER");
                return res.status(500).send('Error creating user');
            } else {
                console.log("newUser: ", newUser);
            }
            console.log("userProfile here here here: ", userProfile);
            return res.json(userProfile);
        }
    } catch (error) {
        console.error('Error in user creation/update:', error);
        res.status(500).send('Internal server error');
    }
});

// Update selected song
app.post('/update-selected-song', async (req, res) => {
    const { access_token, song } = req.body;
    console.log("updating selected song: ", song);
    try {
        const userProfile = await getCurrentUser(access_token);
        if (!userProfile) {
            return res.status(400).send('Failed to get user profile');
        }

        console.log("THIS IS ITHE SONGS: ",song);

        const { error } = await supabase
            .from('users')
            .update({ selected_song: song.id })
            .eq('spotify_id', userProfile.id);

        if (error) {
            console.log("error: ", error);
            return res.status(500).send('Error updating selected song');
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating selected song:', error);
        res.status(500).send('Internal server error');
    }
});

// Send friend request
app.post('/send-friend-request', async (req, res) => {
    const { receiver_spotify_id, sender_spotify_id } = req.body;
    console.log("sending friend request to: ", receiver_spotify_id);
    try {
        // Create friend request
        const { error: requestError } = await supabase
            .from('friend_requests')
            .insert([
                {
                    sender_id: sender_spotify_id,
                    receiver_id: receiver_spotify_id
                }
            ]);

        if (requestError) {
            return res.status(500).send('Error creating friend request');
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

