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
const twowned = require(testpath + "/prepdatahub/app_modules/tw_modules.js");

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;

//load access data
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/access_files/dbdata_master.json", 'utf8'));
const mappingkeys = JSON.parse(fs.readFileSync("prepdatahub/mappingkeys.json", 'utf8'));
const accessdata = JSON.parse(fs.readFileSync("prepdatahub/access_files/tw_access_data.json", 'utf8'));

//current time
let currentTime = new Date();
let currentTimePlusOne = new Date(new Date().setHours(new Date().getHours() + 0.5));
let currentTimeMinusOne = new Date(new Date().setHours(new Date().getHours() - 0.5));

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

function app(accounts, client, dbdata){
    //object to be pushed to database or endpoint
    let accountLoop = 0;
    let tweetList = [];
    //loop through enabled pages to retrieve current hour's tweets
    for(i=0;i<accounts.length;i++){
        let currentaccount = accounts[i];
        client.get('search/tweets', {
            q: accounts[i],
            count: 100,
            result_type: 'recent',
            tweet_mode: 'extended',
            lang: 'nl'
            }, function(error, tweets, response){
                accountLoop++;
                //console.log(tweets);
                if(tweets!==undefined){
                    for(j=0;j<tweets.statuses.length;j++){
                        let tweettime = new Date(tweets.statuses[j].created_at);
                        if(tweettime < currentTimePlusOne && tweettime > currentTimeMinusOne){
                            //add tweets to the list to be pushed
                            cleanDateTime = tweettime.toISOString().slice(0,19).replace(/-/g,"-").replace("T", " ");
                            let tweettimeClean = tweettime.toString().replace("T", " ").split(".")[1];
                            tweetList.push([cleanDateTime, tweets.statuses[j].created_at, currentaccount, tweets.statuses[j].id, tweets.statuses[j].user.screen_name, utf8.encode(tweets.statuses[j].full_text), tweets.statuses[j].retweet_count, tweets.statuses[j].favorite_count]);
                        }
                    }
                }
                if(accountLoop===accounts.length){
                    console.log("test tweetList");
                    console.log(tweetList.length);
                    console.log(tweetList);
                    twowned.bulkmysqltweets(tweetList, dbdata);
                }
            }
        );
    };
}
app(accounts, client, dbdata);