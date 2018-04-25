const instagramAnalytics = require('instagram-analytics');

instagramAnalytics('cocacola').then(stats => {
    console.log(stats);
    /*
    {
        comments: 351,
        description: 'A wonderful description',
        email: 'foobar@gmail.com',
        engagement: 0.02,
        followers: 821,
        ...
    }
    */  
    })
    .catch(function(err){
        console.log(err);
    });
