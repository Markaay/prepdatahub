def fb_httpbuilderpublic(pageid, postlimit, commentlimit, likelimit, accesstoken):
    """function that forms the hhtp request url based on input"""
    #constructor for exporting public facebook graph api data
    api_base = "https://graph.facebook.com"
    api_version = "v2.11"
    api_page = str(pageid)
    api_post_limit = str(postlimit)
    api_comment_limit = str(commentlimit)
    api_like_limit = str(likelimit)
    api_fields = "id,name,posts.limit("+api_post_limit+"){comments.limit("+api_comment_limit+"){message,id,comment_count,created_time,like_count},caption,likes.limit("+api_like_limit+"),timeline_visibility,message,shares,type,created_time},fan_count,talking_about_count,were_here_count"
    api_construct = api_base+"/"+api_version+"/"+api_page+"?fields="+api_fields+"&access_token="+accesstoken
    return api_construct

constructedrequest = fb_httpbuilderpublic("jumbosupermarkten", 16, 1500, 6000, "189107884825866|GAK5u63gwXIlsjijOhxh5iTZeqo")

print(constructedrequest)