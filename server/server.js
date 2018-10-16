// Uncomment following to enable zipkin tracing, tailor to fit your network configuration:
// var appzip = require('appmetrics-zipkin')({
//     host: 'localhost',
//     port: 9411,
//     serviceName:'frontend'
// });

require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();
const appName = require('./../package').name;
const http = require('http');
const express = require('express');
const log4js = require('log4js');
const localConfig = require('./config/local.json');
const path = require('path');
var _ = require("underscore");
const logger = log4js.getLogger(appName);
const app = express();
const server = http.createServer(app);

app.use(log4js.connectLogger(logger, { level: process.env.LOG_LEVEL || 'info' }));
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routers/index')(app, server);

// Add your code here
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

var Client = require("node-rest-client").Client;
var client = new Client();
const port = process.env.PORT || 3001;
//const port = process.env.PORT || localConfig.port;
//var API = `http://localhost:${port}/api`;
var API = 'https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api';
/*
*  allow cross domain access
*/
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*
* get ballots history
*/
app.get('/candidate', function (req,res) {
  //client.get(API+'Candidate', function(data, response) {
  client.get("https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api/Candidate", function(data, response) {
    console.log("server+candidate_data"+data[1]);
    res.json(data);
  });
});
/*
* get Ballot by 'code' used for check ballot valid
*/
app.get('/ballot/:code', function (req, res) {
  client.get(API+'/Ballot/'+req.params.code, function(data, response) {
    res.json(data);
  });
});
  
/*
* get ballot by id 'code', 
*/
app.get('/vote/:ballotCode', function (req, res) {
  client.get(API+'/queries/selectVoteByBallot?ballot='+encodeURIComponent("resource:org.acme.fintricityvote.Ballot#"+req.params.ballotCode), function(data, response) {
    res.json(data);
  });
});
/*
* get ballots history
*/
app.get('/ballotshistory/:startDate/:endDate', function (req, res) {
  console.log("server ballotshistory:"+API+'/queries/listPolls?startTime='+req.params.startDate+'&endTime='+req.params.endDate)
  client.get(API+'/queries/listPolls?startTime='+req.params.startDate+'&endTime='+req.params.endDate, function(data, response) {
    data = _.map(data, function(obj){ return _.omit(obj,['ballot','$class']); });
    res.json(data);
  });
});
  

/*
* vote for one candidate
*/
app.post('/pickman', function(req, res) {
  var args = {
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json"
    },
    data: {
      "$class": "org.acme.fintricityvote.PickMan",
      "ballot": "resource:org.acme.fintricityvote.Ballot#"+req.body.code ,
      "candidate": "resource:org.acme.fintricityvote.Candidate#"+req.body.candidate,
      "timestamp": Date.now()
    }
  };
  client.post(API+"/PickMan", args, function(data, response) {
    res.json(data);
  });
});

/*
*   Ballot generate API
*/
app.post('/ballot', function(req, res) {
  var args = {
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json"
    },
    data: {
      "$class": "org.acme.fintricityvote.Ballot",
      "code": req.body.code,
      "voted": "false"
    }
    
  };
  client.post(API+'/Ballot', args, function(data, response) {
    res.json(data);
  });
});


  
  //app.listen(port, () => console.log(`Example app listening on port ${port}!`));
  


server.listen(port, function(){
  logger.info(`FintricityVote listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`FintricityVote listening on http://localhost:${port}`);
});

app.use(function (req, res, next) {
    res.sendFile(path.join(__dirname, '../public', '404.html'));
});

app.use(function (err, req, res, next) {
    console.log("error: ",err);
    res.sendFile(path.join(__dirname, '../public', '500.html'));
});