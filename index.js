
const express = require('express');
var cors = require('cors')
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/images/epic.svg', (req, res) => { res.sendFile(path.join(__dirname, '/images/epic.svg')); });
app.get('/images/playstation.svg', (req, res) => { res.sendFile(path.join(__dirname, '/images/playstation.svg')); });
app.get('/images/steam.svg', (req, res) => { res.sendFile(path.join(__dirname, '/images/steam.svg')); });
app.get('/images/xbox.svg', (req, res) => { res.sendFile(path.join(__dirname, '/images/xbox.svg')); });
app.get('/images/greenguns.png', (req, res) => { res.sendFile(path.join(__dirname, '/images/greenguns.png')); });
app.get('/images/redguns.png', (req, res) => { res.sendFile(path.join(__dirname, '/images/redguns.png')); });

const platformMapping = {
    epic: 'Epic',
    playstation: 'PlayStation',
    steam: 'Steam',
    xbox: 'Xbox'
};

const options = { 
    method: 'GET', 
    headers: { 
        Accept: 'application/json',
        'X-API-Token': process.env.API_KEY
    }
};

app.get('/contract', cors(), async (req, res) => {
    try {
        const platform = platformMapping[req.query.platform.toLowerCase()];

        const contractResponse = await fetch(`https://ioiapi.hitmaps.com/api/contracts?platform=${platform}&publicId=${req.query.publicId}`, options);
        const contractJson = await contractResponse.json();

        const platformsToCheck = [platform, 'Steam', 'Epic'].filter((value, index, self) => self.indexOf(value) === index);
        const contractGuids = new Array(platformsToCheck.length).fill(contractJson.internalId)

        const leaderboardResponse  = await fetch(`https://ioiapi.hitmaps.com/api/leaderboards-by-guid?platforms=${platformsToCheck.join(',')}&contractGuids=${contractGuids.join(',')}`, options);
        const leaderboardJson = await leaderboardResponse.json();

        res.status(contractResponse.status).send({ ...contractJson, leaderboard: leaderboardJson });
    } catch (error) {
        res.send(error?.response?.body || error);
        console.log(error?.response?.body || error);
    }
});

app.get('/serverStatus', cors(), async (req, res) => {
    try {
        const platformsToCheck = Object.values(platformMapping)
        const contractGuids = new Array(platformsToCheck.length).fill('00d5a5cf-d6d0-48ac-b130-85bef738bc1b')

        const leaderboardResponse  = await fetch(`https://ioiapi.hitmaps.com/api/leaderboards-by-guid?platforms=${platformsToCheck.join(',')}&contractGuids=${contractGuids.join(',')}`, options);
        const leaderboardJson = await leaderboardResponse.json();

        const activePlatforms = leaderboardJson.entries.map(entry => entry.platform).filter((value, index, self) => self.indexOf(value) === index);

        const allPlatforms = Object.keys(platformMapping).reduce((obj, key) =>  { obj[key] = activePlatforms.includes(platformMapping[key]); return obj; }, {})

        res.status(leaderboardResponse.status).send(allPlatforms);
    } catch (error) {
        res.send(error?.response?.body || error);
        console.log(error?.response?.body || error);
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})


