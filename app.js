const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT;
const spotify = 'https://api.spotify.com/v1';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const getToken = async () => {
    const clientCreds = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const tokenPromise = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
        'Authorization': `Basic ${clientCreds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
        grant_type: 'client_credentials'
        })
    });
    const { access_token } = (await tokenPromise.json());
    return access_token;  
}

const getTrackPopularity = async (uri, token) => {
    console.log(`getTrackPopularity called with uri=${uri} and token=${token}\n`);
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }

    return fetch(`${spotify}/tracks/${uri}`, {headers})
    .then(track => track.json())
    .then(track => track.popularity)
}


app.get('/track-uri/:uri', (req,res)=>{
    console.log("Request received at track-uri route.");

    const uri = req.params.uri;

    getToken()
    .then(token => getTrackPopularity(uri, token))
    .then(popularity => {
        console.log(`Popularity retrieved: ${popularity}`);
        res.send(popularity.toString());
    })
    .catch(err => {
        console.error(`There was an error: ${err}`);
        res.status(500).send(`Error with Spotify API call. Error message:\n${err}`);
    });
    
})


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));