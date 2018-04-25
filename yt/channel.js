const {google} = require('googleapis');
const privatekey = require("./credentials.json");

// configure a JWT auth client
let jwtClient = new google.auth.JWT(privatekey.client_email, null, privatekey.private_key, ['https://www.googleapis.com/auth/youtube.force-ssl']);
//authenticate request
jwtClient.authorize(function (err, tokens) {
  if(err){
    console.log(err);
    return;
  }
  else{
    console.log("Successfully connected!");
  }
});


function channelsListById(auth, requestData) {
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  service.channels.list(parameters, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
  });
}
//See full code sample for authorize() function code.
authorize(JSON.parse(content), {
  'params': {
    'id': 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
    'part': 'snippet,contentDetails,statistics'
  }
}, channelsListById);
