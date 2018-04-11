CREATE TABLE fb_pagedata (
    scrape_date datetime,
    page_id varchar(45),
    page_name varchar(255),
    page_fan_count int,
    page_were_here_count int,
    page_talking_about_count int,
    post_like_total int,
    post_comment_total int,
    post_share_total int,
    page_new_fans int,
    page_new_here int,
    page_new_talks int
);

CREATE TABLE fb_posts (
	scrape_date datetime,
    page_id varchar(45),
    page_name varchar(255),
    post_id varchar(45),
    post_type varchar(45),
    post_created_time datetime,
    post_message longtext,
    post_timeline_visibility varchar(45),
    post_comment_count int,
    post_like_count int,
    post_share_count int
);

CREATE TABLE fb_comments (
	scrape_date datetime,
    page_id varchar(45),
    page_name varchar(45),
    post_id varchar(45),
    comment_id varchar(45),
    comment_created_time datetime,
    comment_message longtext,
    comment_like_count int,
    comment_comment_count int
);

CREATE TABLE fb_comment_sentiment (
	scrape_date datetime,
    page_id varchar(45),
    page_name varchar(45),
    post_id varchar(45),
    comment_id varchar(45),
    comment_created_time datetime,
    comment_message longtext,
    comment_like_count int,
    comment_comment_count int,
    comment_sent_label varchar(45),
    comment_positivity float(7,4),
    comment_negativity float(7,4),
    comment_neutrality float(7,4)
);