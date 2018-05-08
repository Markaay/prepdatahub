//dependencies
const rp = require('request-promise');
const mysql = require('mysql');
const utf8 = require('utf8');

exports.constructyt = function(channelid){
    let api_base = "https://www.googleapis.com/youtube/v3/channels?";
    let api_parts = "status,brandingSettings,snippet,statistics,contentDetails";
    let api_key = "AIzaSyAgM9xgWw3MGCFV-1YOo2ruu9yScHImmVo";
    let api_request = api_base + "part=" + api_parts + "&id=" + channelid + "&key=" + api_key;
    console.log(api_request)
    return api_request;
}

//date formatting for tables
exports.dateFormatter = function(date){
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

//bulk transfer to mysql
exports.bulkmysql = function(channelbulk, dbdata){
    let channelquery = "INSERT INTO " + dbdata.channel_table + " (scrape_date,channel_id,channel_name,view_count,comment_count,subscriber_count,video_count,channel_new_views,channel_new_subscribers,channel_new_videos) VALUES ?";

    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(channelquery, [channelbulk], function(err, result){
        if(err) throw err;
        console.log('channel data inserted');
    });
    con.end();
}