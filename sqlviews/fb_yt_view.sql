SELECT DISTINCT datahub.mapping_table.*, 
datahub.fb_pagedata.*, 
datahub.yt_channel.channel_name, 
datahub.yt_channel.view_count, 
datahub.yt_channel.comment_count, 
datahub.yt_channel.video_count, 
datahub.yt_channel.channel_new_views,
datahub.yt_channel.channel_new_subscribers,
datahub.yt_channel.channel_new_videos
FROM datahub.mapping_table 
LEFT JOIN datahub.fb_pagedata ON datahub.fb_pagedata.page_url_id = datahub.mapping_table.fb_id 
LEFT JOIN datahub.yt_channel ON datahub.yt_channel.channel_id = datahub.mapping_table.yt_id AND datahub.yt_channel.scrape_date = datahub.fb_pagedata.scrape_date;