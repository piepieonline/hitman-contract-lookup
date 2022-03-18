
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.SERVER_PORT;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/contract', async (req, res) => {
    try {
        const options = { 
            method: 'GET', 
            headers: { 
                Accept: 'application/json',
                'X-API-Token': process.env.API_KEY
            }
        };

        fetch()
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));

        const response = await fetch(`https://ioiapi.hitmaps.com/api/contracts?platform=${req.query.platform}&publicId=${req.query.publicId}`, options);
        const json = await response.json();

        res.status(response.status).send(json);
    } catch (error) {
        res.send(error.response.body);
        console.log(error.response.body);
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})


