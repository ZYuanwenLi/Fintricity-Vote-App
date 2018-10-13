export const URL =  window.location.protocol+"//"+window.location.hostname;
//var api = URL+':'+process.env.PORT || 3001;
var api = URL+':3000';
console.log("window.location.hostname:"+window.location.hostname);
console.log("process.env.PORT"+process.env.PORT);
if(window.location.hostname!='localhost')
    var api = 'https://fintricity-vote-app.eu-gb.mybluemix.net'//the page address
export const API=api;
