const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT;
const spotify = 'https://api.spotify.com/v1';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let apiToken;

const getHeaders = () => {
    return {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
    }
}

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
    const {access_token} = await tokenPromise.json(); 
    apiToken = access_token;
    console.log(`Received API token: ${JSON.stringify(apiToken)}`);
}


const getTrackPopularity = async (uri) => {
    if (!apiToken) await getToken();
    console.log(`getTrackPopularity called with uri=${uri}\n`);
    let headers = getHeaders();
    const url = `${spotify}/tracks/${uri}`;

    try {let results = await fetch(url, {headers});
        let track = await results.json();

        // Refresh token if API call fails
        if (!track.popularity) {
            await getToken();
            headers = getHeaders();
            results = await fetch(url, {headers});
            track = await results.json();
        }

        return track.popularity ? track.popularity : new Error(`Error - improper fetch:\n${JSON.stringify(track)}`);
    } catch (err) {
        console.error(`Error resolving Spotify fetch promise:\n${err}`);
    }
}


app.get('/track-uri/:uri', (req,res)=>{
    console.log("Request received at track-uri route.");

    const uri = req.params.uri;

    getTrackPopularity(uri)
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