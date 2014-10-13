/**
    Author : lud
*/

(function(plugin) {

//settings 
  var pluginInfo = getDescriptor();
  var PREFIX = pluginInfo.id;
  var BASE_URL = 'http://www.liveleak.com';
  var logo = plugin.path + "liveleak.gif";

  var service = plugin.createService("liveleak", PREFIX + ":start", "tv", true, plugin.path + "liveleak.gif");
  
  var settings = plugin.createSettings("liveleak",
                      plugin.path + "liveleak.gif",
                     "liveleak");

  settings.createInfo("info",
                 plugin.path + "liveleak.gif",
                 "liveleak \n"+
                 "Copyrighted Limited www.liveleak.com - Some Rights Reserved.\n"+
                 "Plugin developed by ludkiller/lud \n");

    plugin.addURI(PREFIX + ":play:(.*)",function(page,url){
        //showtime.print(BASE_URL + '/view?i=' + url);
        var response = showtime.httpReq(BASE_URL + '/view?i=' + url);
        var player_re = /jwplayer(([\S\s]*?)})/;
        var videourl_re = /file:([\S\s]*?)"([\S\s]*?)"/;
        var player = player_re.exec(response);
        var videourl = videourl_re.exec(player);
        var title_re = /<div id="body_text"><p>([\S\s]*?)<\/p><\/div>/;
        var title = title_re.exec(response);
        page.loading = false;
        showtime.print(url);
        page.source = "videoparams:" + showtime.JSONEncode({
            title: title,
            no_fs_scan: true,
            canonicalUrl: PREFIX + ':video:' + url,
            sources: [{
              url: videourl[2],
              bitrate: 10000000,
              mimetype: "video/x-msvideo" 
            }]
        });
        page.type = "video";
    });

    plugin.addURI(PREFIX + ":index:(.*):(.*)",function(page,url,name){
        setPageHeader(page,name);
        var fromPage = 1, tryToSearch = true;
        var re2 = /<a href="([\S\s]*?)">Next<\/a>/;
        var profile = "";

        //var videodata_re = /<div class="post">([\S\s]*?)<\/div>([\S\s]*?)<\/div>([\S\s]*?)<\/div>/g;
        var video_re = /<li id=([\S\s]*?)>([\S\s]*?)<div class="thumbnail_column" ([\S\s]*?)>([\S\s]*?)<\/div>([\S\s]*?)<div class="item_info_column">([\S\s]*?)<\/div>([\S\s]*?)<\/li>/g;

        var count = 0;

        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            if(fromPage == 1)   {
                var response = showtime.httpReq(BASE_URL + url + '?feature=1&page=1').toString();
                showtime.print(BASE_URL + url +'?feature=1&page=1');
            }
            else {
                var response = showtime.httpReq(BASE_URL + url + '?feature=1&page=' + fromPage).toString();
                showtime.print(BASE_URL + url + '?feature=1&page=' + fromPage);
            }   
            if (fromPage == 1) {
                    
            }
            page.loading = false;
            //var videos = videodata_re.exec(response);
            var video = video_re.exec(response);
            if(video == null)   {
                video = video_re.exec(response);
            }
            //showtime.print(video[0]);
            count++;
            while(video)   {
                var thumb_re = /<img class="thumbnail_image" src="([\S\s]*?)" alt="([\S\s]*?)" width="([\S\s]*?)" height="([\S\s]*?)" title="([\S\s]*?)"\/>/;
                //
                
                var details_re = /<div class="item_info_column">([\S\s]*?)<a href="([\S\s]*?)">([\S\s]*?)<\/a><\/h2>/
                var thumb = thumb_re.exec(video[0]);
                var details = details_re.exec(video[0]);
                //showtime.print(details[2]);                
                //showtime.print(thumb);
                //showtime.print(details);

                if(thumb)   {
                    var rating_re = /<img src="([\S\s]*?)" class="content_rating" title="([\S\s]*?)">/;
                    var rating = rating_re.exec(video[0]);    
                    //showtime.print(rating);               
                    if(details) {
                        page.appendItem(PREFIX + ":play:" + escape(details[2].split('=')[1]), "video", {
                        title: thumb[2],
                        icon: thumb[1],
                        description: thumb[2],
                        genre: rating[2].split(':')[1],
                        views: +'3'
                    });
                    }
                }
                //var details_re = /<p class="title">([\S\s]*?)<a href="([\S\s]*?)">([\S\s]*?)<\/a><\/p>([\S\s]*?)<p class="description">"([\S\s]*?)"([\S\s]*?)<\/p><p class="info">([\S\s]*?)<\/p>/;
                
                //showtime.print(thumb[1]);
                //showtime.print(thumb[2]);
                //showtime.print(det);
                video = video_re.exec(response);
                count++;
                
            }
            page.loading = false;
            fromPage++;

            return true;
        }
        loader();
        page.paginator = loader;
    });

    function setPageHeader(page, title) {
        if (page.metadata) {
            page.metadata.title = title;
            page.metadata.logo = logo;
        }
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    }

    function startPage(page)    {
        setPageHeader(page,"Home");

        page.appendItem(PREFIX + ":index:/:Videos",'directory',{
            title : 'Videos',
            icon : logo
        });
        
    }
    
    


    plugin.addURI(PREFIX + ":start", startPage);

})(this);


