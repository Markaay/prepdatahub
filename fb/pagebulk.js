//dependencies
const fs = require('fs');
const rp = require('request-promise');
const fbowned = require("./nodefb.js");
const mysqlpromise = require('promise-mysql');

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;
const pathsource = "prepdatahub/fb/";

//load access data
const accessdata = JSON.parse(fs.readFileSync(pathsource + 'access_data.json', 'utf8'));
const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/" + 'dbdata_master.json', 'utf8'));
let pages = [];
const mappingkeys = JSON.parse(fs.readFileSync('prepdatahub/' + 'mappingkeys.json', 'utf8'));
for(i=0;i<mappingkeys.map.length;i++){
    if(mappingkeys.map[i][2]!=="na" && mappingkeys.map[i][2]!==undefined){
        pages.push(mappingkeys.map[i][2]);
    }
}
console.log(pages);

let today = new Date();
let yesterday = new Date().setDate(new Date().getDate() - 1);
let lastweekday = new Date().setDate(new Date().getDate() - 7);

function app(accessdata, pages, dbdata){
    let fbpagebulk = [];
    let fbpostbulk = [];
    let fbcommentbulk = [];
    let completedpromises = 0;
    for(i=0;i<pages.length;i++){
        console.log(pages[i]);
        let pagerequest = fbowned.constructfb(accessdata, 20, 2000, 3000, pages[i]);
        //console.log(pagerequest);
        let todaydate = fbowned.dateFormatter(today);
        let yesterdaydate = fbowned.dateFormatter(yesterday);
        let lastweekdate = fbowned.dateFormatter(lastweekday);
        //construct GET request
        let options = {
            method: 'get',
            uri: pagerequest,
            timeout: 60000,
            json: true
        };
        rp(options)
            .then(function(response){
                completedpromises++;
                //fbowned funcion success
                //construct sql query
                let fans = 0;
                let here = 0;
                let talks = 0;
                let startTime = yesterdaydate+" 00:00:00";
                let endTime = yesterdaydate+" 23:59:59";
                let query = "SELECT page_name, page_id, page_fan_count, page_were_here_count, page_talking_about_count FROM " + dbdata.page_table + " WHERE page_name = '" + response.name + "' AND scrape_date BETWEEN '" + startTime + "' AND '" + endTime +"' ";
                console.log(query);
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
                        if("page_fan_count" in rows[0]){
                            fans = response.fan_count - rows[0].page_fan_count;
                        }
                        if("page_were_here_count" in rows[0]){
                            here = response.were_here_count - rows[0].page_were_here_count;
                        }
                        if("page_talking_about_count" in rows[0]){
                            talks = response.talking_about_count- rows[0].page_talking_about_count;
                        }
                    }
                    let apmdata = {
                        "page_name": response.name,
                        "page_new_fans": fans,
                        "page_new_here": here,
                        "page_new_talks": talks
                    }
                    let fbpagedata = fbowned.fbmetrics(response, todaydate, lastweekdate, "10", apmdata, dbdata);
                    fbpagebulk.push(fbpagedata[0]);
                    for(post=0;post<fbpagedata[1].length;post++){
                        fbpostbulk.push(fbpagedata[1][post]);
                    }
                    for(comment=0;comment<fbpagedata[2].length;comment++){
                        fbcommentbulk.push(fbpagedata[2][comment]);
                    }
                    console.log("completed promises: "+ completedpromises + " of: " + pages.length);
                    //all promises are complete and data could be send in bulk
                    if(completedpromises===pages.length){
                        //console.log(fbpagebulk);
                        //console.log(fbpostbulk);
                        //console.log(fbcommentbulk);
                        fbowned.bulkmysql(fbpagebulk, fbpostbulk, fbcommentbulk, dbdata);
                    }
                });
            })
            .catch(function(err){
                //fbowned function failed
                console.log(err);
                completedpromises++;
                console.log("failed promises: "+ completedpromises);
                //all promises are complete and data could be send in bulk
                if(completedpromises===pages.length){
                    console.log(fbpagebulk);
                    console.log(fbpostbulk);
                    console.log(fbcommentbulk);
                    fbowned.bulkmysql(fbpagebulk, fbpostbulk, fbcommentbulk, dbdata);
                }
            });
    }
}

app(accessdata, pages, dbdata);