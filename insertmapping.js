const fs = require('fs');
const mysql = require('mysql');

process.env.UV_THREADPOOL_SIZE = 128;
const pathsource = "prepdatahub/"; //"prepdatahub/"

const dbdata =  JSON.parse(fs.readFileSync(pathsource + 'dbdata_master.json', 'utf8'));
const mappingkeys = JSON.parse(fs.readFileSync(pathsource + 'mappingkeys.json', 'utf8'));

function insertmapping(mappingkeys, dbdata){
    let mappingquery = "INSERT INTO " + dbdata.mapping_table + " (object_name, object_category, fb_id, yt_id) VALUES ?";

    //setup connection
    let con = mysql.createConnection({
        host: dbdata.con_ip,
        user: dbdata.con_user,
        password: dbdata.con_pass,
        database : dbdata.db_name
    });
    //connect to mysql database with setup
    con.connect();
    con.query(mappingquery, [mappingkeys], function(err, result){
        if(err) throw err;
        console.log('mapping data inserted');
    });
    con.end();
}
insertmapping(mappingkeys.map, dbdata);