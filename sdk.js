// Using require() in ES5 
const fb = require('fb');

fb.setAccessToken('189107884825866|GAK5u63gwXIlsjijOhxh5iTZeqo');

const fbpages = 'jumbosupermarkten';
const fbfields = ['id', 'name', 'fan_count', 'were_here_count', 'talking_about_count','posts.limit(1){likes}'];
let postid = "";

fb.api(fbpages, {fields: fbfields}, function(res){
    if(!res || res.error) {
        //error occurred
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    else{
        //success
        console.log(res.name, res.id, res.fan_count, res.were_here_count, res.talking_about_count);
        console.log(res.posts.data);
        let postid = res.posts.data[0].id;
        console.log(postid);
        return res;
    }
});

fb.api("156928557716372_1734040700005142", {fields: ['likes']}, function(res){
    if(!res || res.error) {
        //error occurred
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    else{
        //success
        console.log("wow");
        console.log(res);
        return res;
    }
});