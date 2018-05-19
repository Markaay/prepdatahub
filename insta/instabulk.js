const { getStats, getFullStats, getQuickStats } = require('instalytics');
 
//Get full statistics of all posts by the user
getFullStats("jumbo", 6, interval = 5000)
    .then(function(stats){
        console.log(stats);
    })
    .catch(function(err){
        console.log(err);
    });
// => Time interval (in milliseconds) between calls is 
//      recommended for accounts with more than 200 posts
//      and accounts with more than 200 posts and 
//      needed for 500 or more posts.
// => Choose appropriate time intervals ( > 30,000 milliseconds)
 
// Get 50 latest posts by the user (or all posts if the user 
// has < 50 posts)
getQuickStats("jumbo")
    .then(function(stats){
        console.log(stats);
    })
    .catch(function(err){
        console.log(err);
    });
 