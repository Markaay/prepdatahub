const mysql = require('mysql');

//bulk transfer to mysql
exports.bulkmysqltweets = function(accountbulk, dbdata){
    let accountquery = "INSERT INTO " + dbdata.tw_tweet_table + " (created_time,full_date,search_account,tweet_id,screen_name_tweeter,tweet_text,tweet_retweet_count,tweet_favorite_count) VALUES ?";
    console.log(accountquery);
    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(accountquery, [accountbulk], function(err, result){
        if(err) throw err;
        console.log('tweet data inserted');
    });
    con.end();
}

//bulk transfer to mysql
exports.bulkmysqlaccounts = function(accountbulk, dbdata){
    let accountquery = "INSERT INTO " + dbdata.tw_account_table + " (scrape_date,account_screen_name,account_name,account_id,account_location,account_display_url,following_count,friends_count,listed_count,favorites_count,statuses_count) VALUES ?";
    console.log(accountquery);
    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(accountquery, [accountbulk], function(err, result){
        if(err) throw err;
        console.log('account data inserted');
    });
    con.end();
}