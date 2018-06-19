//dependencies
const fs = require('fs');
const Twitter = require('twitter');
const mysqlpromise = require('promise-mysql');
const utf8 = require('utf8');
const ip = require("ip");

//testpath include on local machine
let testpath = "";
console.log("ip: "+ ip.address());
if(ip.address().match(/192\.168\.178\.59/g)){
    testpath = "/Users/Ebergen/Desktop";
}
else{
    testpath = "/root";
}
const twowned = require(testpath + "/prepdatahub/app_modules/tw_modules.js");
const twowned = require("/prepdatahub/app_modules/tw_modules.js");

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;

//load access data
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/access_files/dbdata_master.json", 'utf8'));
const mappingkeys = JSON.parse(fs.readFileSync("prepdatahub/mappingkeys.json", 'utf8'));
const accessdata = JSON.parse(fs.readFileSync("prepdatahub/access_files/tw_access_data.json", 'utf8'));

//current time
let currentTime = new Date();

//only retrieve data from enabled accounts
let accounts = [];
for(i=0;i<mappingkeys.map.length;i++){
    if(mappingkeys.map[i][5]!=="na" && mappingkeys.map[i][5]!=="twid" && mappingkeys.map[i][5]!==undefined){
        accounts.push(mappingkeys.map[i][5]);
    }
}
console.log(accounts);

//init twitter api
const client = new Twitter({
  consumer_key: accessdata.consumer_key,
  consumer_secret: accessdata.consumer_secret,
  access_token_key: accessdata.access_token_key,
  access_token_secret: accessdata.access_token_secret
});

let accountList = [];
//object to be pushed to database or endpoint
function app(accounts, client, dbdata){
    let accountLoop = 0;
    for(i=0;i<accounts.length;i++){
        var params = {screen_name: accounts[i]};
        client.get('users/show', params, function(error, tweets, response){
            accountLoop++;
            if (!error) {
                console.log(tweets);
                if(tweets!==undefined){
                    console.log("wotste")
                    //add tweets to the list to be pushed
                    cleanDateTime = currentTime.toISOString().slice(0,19).replace(/-/g,"-").replace("T", " ");
                    accountList.push([cleanDateTime, tweets.screen_name, tweets.name, tweets.id, tweets.location, tweets.entities.url.urls[0].display_url, tweets.followers_count, tweets.friends_count, tweets.listed_count, tweets.favourites_count, tweets.statuses_count ]);
                    console.log("tweet");
                }
                if(accountLoop===accounts.length){
                    console.log("test tweetList");
                    console.log(accountList.length);
                    console.log(accountList);
                    twowned.bulkmysqlaccounts(accountList, dbdata);
                }
            }
        });
    }
}
app(accounts, client, dbdata);