//dependencies
const rp = require('request-promise');
const fbowned = require("./nodefb.js");
const mysql = require('mysql');
const utf8 = require('utf8');

exports.constructfb = function(accessdata, postlimit, commentlimit, likelimit, page){
    let api_base = "https://graph.facebook.com";
    let api_version = "v2.12";
    let api_post_limit = postlimit;
    let api_comment_limit = commentlimit;
    let api_like_limit = likelimit;
    let api_fields = "id,name,posts.limit("+api_post_limit+"){comments.limit("+api_comment_limit+"){message,id,comment_count,created_time,like_count},caption,likes.summary(true),timeline_visibility,message,shares,type,created_time},fan_count,talking_about_count,were_here_count";
    let api_construct = api_base+"/"+api_version+"/"+page+"?fields="+api_fields+"&access_token="+accessdata.app_access_token;
    console.log(api_construct);
    return api_construct;
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

//get complete set of facebook data
exports.fbmetrics = function(page_url_id, pagejson, todaydate, lastweekdate, ipmpostamount, apmdata, dbdata){
    //total data trackers
    let post_like_total = 0;
    let post_comment_total = 0;
    let post_share_total = 0;
    let fbposts = pagejson.posts.data;
    let fbpage_array = [];
    let fbpost_array = [];
    let fbcomment_array = [];
    //loop through page post
    for(i=0;i<fbposts.length;i++){
        //console.log(fbposts[i].created_time.substring(0,10));
        //console.log(lastweekdate);
        let post_comments_base = 0;
        let post_likes_base = 0;
        let post_share_base = 0;
        //check if the post has any comments, likes or shares
        if("comments" in fbposts[i]){
            post_comments_base = fbposts[i].comments.data.length;
        }
        if("likes" in fbposts[i]){
            post_likes_base = fbposts[i].likes.summary.total_count;
        }        
        if("shares" in fbposts[i]){
            post_share_base = fbposts[i].shares.count;
        }
        //aggregate ipm data of last x amount of posts
        if(i<parseInt(ipmpostamount)){
            post_like_total = post_like_total + post_likes_base;
            post_comment_total = post_comment_total + post_comments_base;
            post_share_total = post_share_total + post_share_base;
        }
        //Array to push to fbpage bulk array
        fbpage_array = [todaydate + " 00:00:00", pagejson.id, pagejson.name, pagejson.fan_count, pagejson.were_here_count, pagejson.talking_about_count, post_like_total, post_comment_total, post_share_total, apmdata.page_new_fans, apmdata.page_new_here, apmdata.page_new_talks, page_url_id];
        //get post data from last week to save
        if(fbposts[i].created_time.substring(0,10) === lastweekdate){
            console.log("post date match");
            let post_message = "";
            let post_comments_count = 0;
            let post_likes_count = 0;
            let post_share_count = 0;
            if("message" in fbposts[i]){
                post_message = fbposts[i].message;
            }
            if("comments" in fbposts[i]){
                post_comments_count = fbposts[i].comments.data.length;
            }
            if("likes" in fbposts[i]){
                post_likes_count = fbposts[i].likes.summary.total_count;
            }
            if("shares" in fbposts[i]){
                post_share_count = fbposts[i].shares.count;
            }
            //post data to export
            let post_obj = {
                "scrape_date": todaydate + " 00:00:00",
                "page_id": pagejson.id,
                "page_name": pagejson.name,
                "post_id": fbposts[i].id,
                "post_type": fbposts[i].type,
                "post_created_time": fbposts[i].created_time.substring(0,19).replace("T", " "),
                "post_message": utf8.encode(post_message),
                "post_timeline_visibility": fbposts[i].timeline_visibility,
                "post_comment_count": post_comments_count,
                "post_like_count": post_likes_count,
                "post_share_count": post_share_count
            }
            //push post to fbpost array
            fbpost_array.push([todaydate + " 00:00:00", pagejson.id, pagejson.name, fbposts[i].id, fbposts[i].type, fbposts[i].created_time.substring(0,19).replace("T", " "), utf8.encode(post_message), fbposts[i].timeline_visibility, post_comments_count, post_likes_count, post_share_count]);
            //start comment collection
            if(post_comments_count > 0){
                //doublecheck if comment key is in post comment json
                if("comments" in fbposts[i]){
                    //loop through comments to push to fbcomment array
                    for(j=0;j<fbposts[i].comments.data.length;j++){
                        fbcomment_array.push([todaydate + " 00:00:00", pagejson.id, pagejson.name, fbposts[i].id, fbposts[i].comments.data[j].id, fbposts[i].comments.data[j].created_time.substring(0,19).replace("T", " "), utf8.encode(fbposts[i].comments.data[j].message),fbposts[i].comments.data[j].like_count, fbposts[i].comments.data[j].comment_count]);
                    }
                }
            }
        }
    }
    //page data to export
    let page_obj = {
        "scrape_date": todaydate + " 00:00:00",
        "page_id": pagejson.id,
        "page_name": pagejson.name,
        "page_fan_count": pagejson.fan_count,
        "page_were_here_count": pagejson.were_here_count,
        "page_talking_about_count": pagejson.talking_about_count,
        "post_like_total": post_like_total,
        "post_comment_total": post_comment_total,
        "post_share_total": post_share_total,
        "page_new_fans": apmdata.page_new_fans,
        "page_new_here": apmdata.page_new_here,
        "page_new_talks": apmdata.page_new_talks,
        "page_url_id": page_url_id
    }
    console.log(page_obj)
    fbdata = [];
    fbdata.push(fbpage_array, fbpost_array, fbcomment_array);
    return fbdata;
}

//bulk transfer to mysql
exports.bulkmysql = function(pagebulk, postbulk, commentbulk, dbdata){
    let pagequery = "INSERT INTO " + dbdata.page_table + " (scrape_date,page_id,page_name,page_fan_count,page_were_here_count,page_talking_about_count,post_like_total,post_comment_total,post_share_total,page_new_fans,page_new_here,page_new_talks,page_url_id) VALUES ?";
    let postquery = "INSERT INTO " + dbdata.post_table + " (scrape_date,page_id,page_name,post_id,post_type,post_created_time,post_message,post_timeline_visibility,post_comment_count,post_like_count,post_share_count) VALUES ?";;
    let commentquery = "INSERT INTO " + dbdata.comment_table + " (scrape_date,page_id,page_name,post_id,comment_id,comment_created_time,comment_message,comment_like_count,comment_comment_count) VALUES ?" ;
    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(pagequery, [pagebulk], function(err, result){
        if(err) throw err;
        console.log('page data inserted');
    });
    con.query(postquery, [postbulk], function(err, result){
        if(err) throw err;
        console.log('post data inserted');
    });
    con.query(commentquery, [commentbulk], function(err, result){
        if(err) throw err;
        console.log('comment data inserted or enabled pages');
    });
    con.end();
}