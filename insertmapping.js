const fs = require('fs');
const mysql = require('mysql');
const ip = require('ip');

let testpath = "";
console.log("ip: "+ ip.address());
if(ip.address().match(/192\.168\.178\.59/g)){
    testpath = "/Users/Ebergen/Desktop";
}

//multiple treats
process.env.UV_THREADPOOL_SIZE = 128;

const dbdata =  JSON.parse(fs.readFileSync("prepdatahub/access_files/dbdata_master.json", 'utf8'));
const mappingkeys = JSON.parse(fs.readFileSync('prepdatahub/mappingkeys.json', 'utf8'));

function insertmapping(mappingkeys, dbdata){
    //queries for daily deletion and update
    let deletequery = "DELETE FROM "+ dbdata.mapping_table + " ";
    let mappingquery = "INSERT INTO " + dbdata.mapping_table + " (object_name, object_category, fb_id, yt_id, fb_sent, tw_id) VALUES ?";

    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(deletequery, function(err, result){
        if(err) throw err;
        console.log('table deleted');
    });
    con.query(mappingquery, [mappingkeys], function(err, result){
        if(err) throw err;
        console.log('mapping data inserted');
    });
    con.end();
}
insertmapping(mappingkeys.map, dbdata);