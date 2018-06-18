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