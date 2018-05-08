//dependencies
const fs = require('fs');
const rp = require('request-promise');
const yt = require("./nodeyt.js");
const mysqlpromise = require('promise-mysql');

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;
const pathsource = "prepdatahub/yt/";

//load access data
const dbdata =  JSON.parse(fs.readFileSync('prepdatahub/' + 'dbdata_master.json', 'utf8'));
const mappingkeys = JSON.parse(fs.readFileSync('prepdatahub/' + 'mappingkeys.json', 'utf8'));
const channel_ids = [];
for(i=0;i<mappingkeys.map.length;i++){
    if(mappingkeys.map[i][3]!=="na"){
        channel_ids.push(mappingkeys.map[i][3]);
    }
}
console.log(channel_ids);

let today = new Date();
let yesterday = new Date().setDate(new Date().getDate() - 1);

function app(channel_ids, dbdata){
    let ytchannelbulk = [];
    let completedpromises = 0;
    for(i=0;i<channel_ids.length;i++){
        let currentchannel = channel_ids[i];
        let api_request = yt.constructyt(channel_ids[i]);
        let todaydate = yt.dateFormatter(today);
        let yesterdaydate = yt.dateFormatter(yesterday);
        //construct GET request
        let options = {
            method: 'get',
            uri: api_request,
            timeout: 60000,
            json: true
        };
        rp(options)
            .then(function(response){
                console.log(completedpromises);
                //get acquisition data
                let new_subs = 0;
                let new_vids = 0;
                let new_views = 0;
                let startTime = yesterdaydate+" 00:00:00";
                let endTime = yesterdaydate+" 23:59:59";
                let query = "SELECT channel_name, channel_id, view_count, subscriber_count, video_count FROM " + dbdata.channel_table + " WHERE channel_id = '" + response.items[0].id + "' AND scrape_date BETWEEN '" + startTime + "' AND '" + endTime +"' ";
                mysqlpromise.createConnection({
                    host: dbdata.con_ip,
                    user: dbdata.con_user,
                    password: dbdata.con_pass,
                    database : dbdata.db_name
                }).then(function(conn){
                    let result = conn.query(query);
                    conn.end();
                    return result;
                }).then(function(rows){
                    //check if there is a key object for each apm variable
                    if(rows[0] !== undefined){
                        if("view_count" in rows[0]){
                            new_views = response.items[0].statistics.viewCount - rows[0].view_count;
                        }
                        if("subscriber_count" in rows[0]){
                            new_subs = response.items[0].statistics.subscriberCount - rows[0].subscriber_count;
                        }
                        if("video_count" in rows[0]){
                            new_vids = response.items[0].statistics.videoCount- rows[0].video_count;
                        }
                    }
                    let channel_array = [todaydate + " 00:00:00", response.items[0].id, currentchannel, response.items[0].statistics.viewCount, response.items[0].statistics.commentCount, response.items[0].statistics.subscriberCount, response.items[0].statistics.videoCount, new_views, new_subs, new_vids];
                    ytchannelbulk.push(channel_array);   
                    completedpromises++; 
                    console.log(completedpromises, "van de ", channel_ids.length);
                    console.log(completedpromises===channel_ids.length);
                    if(completedpromises===channel_ids.length){
                        console.log(ytchannelbulk);
                        yt.bulkmysql(ytchannelbulk, dbdata);
                    }
                })
            })
            .catch(function(err){
                //fbowned function failed
                console.log(err);
                completedpromises++;
                if(completedpromises===channel_ids.length){
                    console.log(ytchannelbulk)
                    yt.bulkmysql(ytchannelbulk, dbdata);
                }
            });
    }
}

app(channel_ids, dbdata);
