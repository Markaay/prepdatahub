//dependencies
const fs = require('fs');
const rp = require('request-promise');
const fbowned = require("nodefb.js");

//prevent error from occurring in requesting data from api!!
process.env.UV_THREADPOOL_SIZE = 128;
const pathsource = "prepdatahub/";

//load access data
const accessdata = JSON.parse(fs.readFileSync(pathsource + 'access_data.json', 'utf8'));
const dbdata =  JSON.parse(fs.readFileSync(pathsource + 'dbdata.json', 'utf8'));
const pages = ["jumbosupermarkten", "PLUSsupermarkt", "EMTESUPERMARKTEN","Dirksupermarkten", "CoopSupermarkten", "lidlnederland","JanLindersSupermarkten", "DEENSupermarkten", "albertheijn"];

let today = new Date();
let yesterday = today.setDate(today.getDate() - 1);
let lastweekday = today.setDate(today.getDate() - 7);

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
                //fbowned funcion success
                let apmjson = fbowned.apmmetrics(response, yesterdaydate, dbdata);
                let fbpagedata = fbowned.fbmetrics(response, todaydate, lastweekdate, "10", apmjson, dbdata);
                fbpagebulk.push(fbpagedata[0]);
                for(post=0;post<fbpagedata[1].length;post++){
                    fbpostbulk.push(fbpagedata[1][post]);
                }
                for(comment=0;comment<fbpagedata[2].length;comment++){
                    fbcommentbulk.push(fbpagedata[2][comment]);
                }
                completedpromises++;
                console.log("completed promises: "+ completedpromises);
                //all promises are complete and data could be send in bulk
                if(completedpromises===pages.length){
                    //console.log(fbpagebulk);
                    //console.log(fbpostbulk);
                    //console.log(fbcommentbulk);
                    fbowned.bulkmysql(fbpagebulk, fbpostbulk, fbcommentbulk, dbdata);
                }
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