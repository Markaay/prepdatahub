const fs = require('fs');
const rp = require('request-promise');
const request = require('request');
const mysqlpromise = require('promise-mysql');
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
const fbowned = require(testpath + "/prepdatahub/app_modules/fb_modules.js");

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;

const apidata =  JSON.parse(fs.readFileSync("prepdatahub/access_files/sentiment_access_data.json", 'utf8'));
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/access_files/dbdata_master.json", 'utf8'));
let commentsToReview = [];

let today = new Date();
let yesterday = new Date().setDate(new Date().getDate() - 1); //change to 1 once published!
let lastweekday = new Date().setDate(new Date().getDate() - 7);
let todaydate = fbowned.dateFormatter(today);
let yesterdaydate = fbowned.dateFormatter(yesterday);
let lastweekdate = fbowned.dateFormatter(lastweekday);

//Query information
let startTime = yesterdaydate+" 00:00:00";
let endTime = yesterdaydate+" 23:59:59";
//get all yesteday's comments for enabled pages
let query = "SELECT DISTINCT datahub.fb_comments.*,datahub.fb_pagedata.page_url_id, datahub.mapping_table.fb_sent,datahub.mapping_table.object_category, datahub.mapping_table.object_name FROM datahub.fb_comments INNER JOIN datahub.fb_pagedata ON datahub.fb_pagedata.page_id=datahub.fb_comments.page_id INNER JOIN datahub.mapping_table ON datahub.fb_pagedata.page_url_id=datahub.mapping_table.fb_id AND datahub.mapping_table.fb_sent='yes' AND datahub.fb_comments.scrape_date BETWEEN '" + startTime +"' AND '" + endTime + "';";
console.log(query);
let commentBulk = [];
mysqlpromise.createConnection({
    host: dbdata.con_ip,
    user: dbdata.con_user,
    password: dbdata.con_pass,
    database : dbdata.db_name
    }).then(function(conn){
        let result = conn.query(query);
        console.log(result);
        conn.end();
        return result;
    }).then(function(rows){
        //console.log(rows[0].comment_message);
        let messageCount = rows.length;
        //console.log(messageCount);
        let messageStart = 0;
        //loop through every comment from the query
        for(k=0;k<rows.length;k++){
            //only analyze comments longer than 20 characters
            if(rows[k].comment_message.length > 10){
                console.log(k + " van " + messageCount);
                //console.log(rows[k].comment_message);
                let message = rows[k].comment_message;
                let sentimentComment = [rows[k].scrape_date, rows[k].page_id, rows[k].page_name, rows[k].post_id, rows[k].comment_id, rows[k].comment_created_time, rows[k].comment_message, rows[k].comment_like_count, rows[k].comment_comment_count];
                //set options
                request.post({
                    method: 'POST',
                    timeout: 20000,
                    headers: {
                        "X-Mashape-Key": apidata.key,
                        "Content-Type": apidata.contentType,
                        "Accept": apidata.accept
                    },
                    form: {
                        language: apidata.language,
                        text: message
                    },
                    url: 'https://japerk-text-processing.p.mashape.com/sentiment/',
                    json: true
                }, function(error, response, body){
                    messageStart++
                    if(body!==undefined){
                        console.log("sentiment ready of: " + messageStart +" of " + messageCount);
                        console.log(body);
                        sentimentComment.push(body.label);
                        sentimentComment.push(body.probability.pos);
                        sentimentComment.push(body.probability.neg);
                        sentimentComment.push(body.probability.neutral);
                        commentBulk.push(sentimentComment);
                        console.log(sentimentComment);
                    }
                    if(messageStart === messageCount){
                        fbowned.sentimentmysql(commentBulk, dbdata);
                    }
                });
            }
            else{
                //comment skipped due to length
                messageStart++;
                if(messageStart === messageCount){
                    fbowned.sentimentmysql(commentBulk, dbdata);
                }
            }
        }
    }).catch(function(err){
        console.log(err);
    })