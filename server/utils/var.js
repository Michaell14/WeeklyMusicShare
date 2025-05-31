const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const redirect_uri = "exp://127.0.0.1:8081/";
const client_id = 'd824f096ba1248849c8fa9a755d77091';

module.exports = { discovery, redirect_uri, client_id };