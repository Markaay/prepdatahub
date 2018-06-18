CREATE TABLE tw_tweets (
    created_time datetime,
    full_date varchar(100),
    search_account varchar(45),
    tweet_id varchar(45),
    screen_name_tweeter varchar(255),
    tweet_text longtext,
    tweet_retweet_count int,
    tweet_favorite_count int
);

CREATE TABLE tw_accounts (
    scrape_date datetime,
    account_screen_name varchar(100),
    account_name varchar(100),
    account_id varchar(45),
    account_location varchar(100),
    account_display_url varchar(255),
    following_count int,
    friends_count int,
    listed_count int,
    favorites_count int,
    account_verified varchar(45),
    statuses_count int
);