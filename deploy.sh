
#ibmcloud dev build

cf push Fintricity-Vote-App -f ./manifest.yml -i 1 -m 512M --random-route --no-start
cf bind-service Fintricity-Vote-App Blockchain-FV -c '{"permissions":"read-only"}'
cf set-env Fintricity-Vote-App fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net '{"fintricity-vote-rest-2": {"httpURL": "https://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net/api", "webSocketURL": "wss://fintricity-vote-rest-2-happy-crane.eu-gb.mybluemix.net"}}'

cf start Fintricity-Vote-App
