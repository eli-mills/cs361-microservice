const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3100;
const spotify = 'https://api.spotify.com/v1';

const getToken = async () => {
    const getTokenUrl = 'http://localhost:3000/';
    return fetch(getTokenUrl)
    .then(res=>res.text());
    
}

const getSongPlays = async (uri, token) => {
    console.log(`getSongPlays called with uri=${uri} and token=${token}\n`);
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }

    return fetch(`${spotify}/tracks/${uri}`, {headers})
    .then(track => track.json())
    .then(track => track.popularity)
}


app.get('/songuri/:uri', (req,res)=>{
    console.log("Request received at song uri route.");

    const uri = req.params.uri;
    
    // Get API token
    getToken()
    .then(token => getSongPlays(uri, token))
    .then(popularity => {
        console.log(`Popularity retrieved: ${popularity}`);
        res.send(popularity.toString());
    })
    .catch(err=>console.log(`There was an error: ${err}`));
    
})


app.listen(PORT, ()=>console.log(`Server listening on port ${PORT}`));