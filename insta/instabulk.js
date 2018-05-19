const instagramAnalytics = require('instagram-analytics');

instagramAnalytics('cocacola').then(stats => {
    console.log(stats);
    });
