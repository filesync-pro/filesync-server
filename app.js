'use strict';

const express = require('express');
const request = require('request');
const {google} = require('googleapis');
const uuid = require('uuid');

const config = require("./config/config.json");


const app = express();


const oauth2Client = new google.auth.OAuth2(
  config.YOUR_CLIENT_ID,
  config.YOUR_CLIENT_SECRET,
  config.YOUR_REDIRECT_URL
);


// Access scopes for read & write Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.file'
];


const sessionMap = {};


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
  const code = req.query.code;
  let { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  google.options({auth: oauth2Client});

  const people = google.people('v1');

   const result = await people.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses,names,photos',
  });

  const sessionId = uuid.v4();

  sessionMap[sessionId] = {
    name: result.data.names[0] ? result.data.names[0].displayName : '',
    email: result.data.emailAddresses[0] ? result.data.emailAddresses[0].value : '',
    photo: result.data.photos[0] ? result.data.photos[0].url : ''
  };

  if (!error) {
    res.redirect(config.REAL_REDIRECT_URL + "?session_id=" + sessionId);
  } else {
    res.status(401).send({
      message: error
    });
  }
});


app.get('/session_data', async (req, res) => {
  const sessionId = req.query.session_id;
  if (sessionMap[sessionId]) {
    res.send(sessionMap[sessionId]);
  } else {
    res.status(404).send({
      message: 'Not Found'
    });
  }
});


app.get('/sync_files', async (req, res) => {
  // TODO: sync files to web3.storage
});


app.listen(config.PORT);

module.exports = app;
