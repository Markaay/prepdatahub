const fs = require('fs');
const rp = require('request-promise');
const mysqlpromise = require('promise-mysql');
const fbowned = require("./nodefb.js");

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;

const pathsource = "prepdatahub/fb/";
const apidata =  JSON.parse(fs.readFileSync(pathsource + 'apidata.json', 'utf8'));
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/" + 'dbdata_master.json', 'utf8'));
let commentsToReview = [];

let today = new Date();
let yesterday = new Date().setDate(new Date().getDate() - 2);
let lastweekday = new Date().setDate(new Date().getDate() - 7);
let todaydate = fbowned.dateFormatter(today);
let yesterdaydate = fbowned.dateFormatter(yesterday);
let lastweekdate = fbowned.dateFormatter(lastweekday);

//Query information
let startTime = yesterdaydate+" 00:00:00";
let endTime = yesterdaydate+" 23:59:59";
//get all yesteday's comments for enabled pages
let query = "SELECT datahub.fb_comments.*,datahub.fb_pagedata.page_url_id, datahub.mapping_table.fb_sent,datahub.mapping_table.object_category, datahub.mapping_table.object_name FROM datahub.fb_comments INNER JOIN datahub.fb_pagedata ON datahub.fb_pagedata.page_id=datahub.fb_comments.page_id INNER JOIN datahub.mapping_table ON datahub.fb_pagedata.page_url_id=datahub.mapping_table.fb_id AND datahub.mapping_table.fb_sent='yes' AND datahub.fb_comments.scrape_date BETWEEN '" + startTime +"' AND '" + endTime + "';";
console.log(query);
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
        console.log(rows);


    }).catch(function(err){


    })



exports.commentsentiment = function(sent_api_data, textstring){
    //set options
    let options = {
        method: 'POST',
        uri: 'https://japerk-text-processing.p.mashape.com/sentiment/',
        headers: {
            "X-Mashape-Key": sent_api_data.key,
            "Content-Type": sent_api_data.contentType,
            "Accept": sent_api_data.accept
        },
        form: {
            language: sent_api_data.language,
            text: textstring
        },
        json: true // Automatically stringifies the body to JSON
    };

    rp(options)
        .then(function(bodyresponse){
            // POST succeeded...
            console.log(bodyresponse.probability);
        })
        .catch(function(err){
            // POST failed...
            console.log(err);
        });
}

let cd = exports.commentsentiment(apidata, "super goede supermarkt wow :)")