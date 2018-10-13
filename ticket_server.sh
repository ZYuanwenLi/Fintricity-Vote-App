#!/bin/sh

ballot = $( head -c16 </dev/urandom|xxd -p -u )

curl_cmd = "curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "$class": "org.acme.fintricityvote.Ballot", \ 
   "code": $ballot, \ 
   "voted": "false" \ 
 }' 'https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api/Ballot'
"
eval $ballot

