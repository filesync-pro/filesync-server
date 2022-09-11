'use strict';

const express = require('express');
const request = require('request');
const {google} = require('googleapis');

const config = require("./config/config.json");


const app = express();


const oauth2Client = new google.auth.OAuth2(
  config.YOUR_CLIENT_ID,
  config.YOUR_CLIENT_SECRET,
  config.YOUR_REDIRECT_URL
);


// Access scopes for read & write Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive.file'
];


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/auth_0', async (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });

  res.redirect(authorizationUrl);
});

app.get('/auth_1', async (req, res) => {
  const error = req.query.error;
  // const code = req.query.code;
  // let { tokens } = await oauth2Client.getToken(code);
  // oauth2Client.setCredentials(tokens);

  if (!error) {
    res.send({
      message: 'ok'
    });
  } else {
    res.status(401).send({
      message: error
    });
  }
});

app.get('/sync_files', async (req, res) => {
  // TODO: sync files to web3.storage
});


app.listen(config.PORT);

module.exports = app;
