const fs = require('fs');
const Twitter = require('twitter');
const mysqlpromise = require('promise-mysql');


//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;
const pathsource = "prepdatahub/tw/";

//load access data
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/" + 'dbdata_master.json', 'utf8'));
let accounts = [];
const mappingkeys = JSON.parse(fs.readFileSync('prepdatahub/' + 'mappingkeys.json', 'utf8'));

for(i=0;i<mappingkeys.map.length;i++){
    if(mappingkeys.map[i][5]!=="na" && mappingkeys.map[i][5]!=="twid" && mappingkeys.map[i][5]!==undefined){
        //push the page_url_id and the fbsent status
        //console.log(mappingkeys.map[i][2], mappingkeys.map[i][4]);
        accounts.push(mappingkeys.map[i][5]);
    }
}
console.log(accounts);
 
var client = new Twitter({
  consumer_key: 'WmYQ9txYh9ZGep7iRjzBHPKpz',
  consumer_secret: 'RFgKRVsNBjcoNtWFsH53WkANBdxItRvehSCEx5HCLcU9FRMaQ5',
  access_token_key: '2276153034-ZuZnx48IsmHIUvMYRdA6WUc6A2JtaNvQ2IZoUZw',
  access_token_secret: 'bTnfofGtvMcMA1Y5YcBvdBXpoFPMEF137LJ7vTurXoVBI'
});

let accountList = [];
let tweetList = [];
 
for(i=0;i<accounts.length;i++){
    var params = {screen_name: accounts[i]};
    client.get('users/show', params, function(error, tweets, response) {
    if (!error) {
        //console.log(tweets);
    }
    });
}

//current time
let currentTime = new Date();
let currentTimePlusOne = new Date(new Date().setHours(new Date().getHours() + 0.5));
let currentTimeMinusOne = new Date(new Date().setHours(new Date().getHours() - 0.5));


let tweetList = [];
client.get('search/tweets', {
    q: 'JumboSupermarkt',
    count: 100,
    result_type: 'recent',
    tweet_mode: 'extended'
    }, function(error, tweets, response){
        //console.log(tweets);
        for(j=0;j<tweets.statuses.length;j++){
            let tweettime = new Date(tweets.statuses[j].created_at);
            if(tweettime < currentTimePlusOne && tweettime > currentTimeMinusOne){
                //add tweets to the list to be pushed
                tweetList.push([tweets.statuses[j].created_at, tweets.statuses[j].id, tweets.statuses[j].user.screen_name, tweets.statuses[j].full_text, tweets.statuses[j].retweet_count, tweets.statuses[j].favorite_count]);
            }
        }
        console.log(tweetList);
    }
);