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
                 "All Rights Reserved to liveleak , liveleak , liveleak.com are copyright of liveleak.com\n"+
                 "Plugin developed by ludkiller/lud \n");

    plugin.addURI(PREFIX + ":play:(.*)",function(page,url){

        var response = showtime.httpReq(BASE_URL + '/view?i=' + url);
        var player_re = /jwplayer(([\S\s]*?)})/;
        var videourl_re = /file:([\S\s]*?)"([\S\s]*?)"/;
        var player = player_re.exec(response);
        var videourl = videourl_re.exec(player);
        var title_re = /<div id="body_text"><p>([\S\s]*?)<\/p><\/div>/;
        var title = title_re.exec(response);
        page.loading = false;

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

        var video_re = /<li id=([\S\s]*?)>([\S\s]*?)<div class="thumbnail_column" ([\S\s]*?)>([\S\s]*?)<\/div>([\S\s]*?)<div class="item_info_column">([\S\s]*?)<\/div>([\S\s]*?)<\/li>/g;

        var count = 0;

        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            if(fromPage == 1)   {
                var response = showtime.httpReq(BASE_URL + url + '?feature=1&page=1').toString();
                showtime.print(BASE_URL + url +'?featured=1&page=1');
            }
            else {
                var response = showtime.httpReq(BASE_URL + url + 'browse?featured=1&page=' + fromPage).toString();
                showtime.print(BASE_URL + url + 'browse?featured=1&page=' + fromPage);
            }   
            if (fromPage == 1) {
                    
            }
            page.loading = false;

            var video = video_re.exec(response);
            if(video == null)   {
                video = video_re.exec(response);
            }
            count++;
            while(video)   {
                var thumb_re = /<img class="thumbnail_image" src="([\S\s]*?)" alt="([\S\s]*?)" width="([\S\s]*?)" height="([\S\s]*?)" title="([\S\s]*?)"\/>/;
                //
                
                var details_re = /<div class="item_info_column">([\S\s]*?)<a href="([\S\s]*?)">([\S\s]*?)<\/a><\/h2>([\S\s]*?)<h4>([\S\s]*?)<\/h4>/
                var thumb = thumb_re.exec(video[0]);
                var details = details_re.exec(video[0]);
		var data_re = /([\S\s]*?)Views: ([\S\s]*?) ([\S\s]*?)Votes: ([\S\s]*?) ([\S\s]*?)/;
		var ddata = data_re.exec(details[5]);

                if(thumb)   {
                    var rating_re = /<img src="([\S\s]*?)" class="content_rating" title="([\S\s]*?)">/;
                    var rating = rating_re.exec(video[0]);    

                    if(details) {
                        page.appendItem(PREFIX + ":play:" + escape(details[2].split('=')[1]), "video", {
                        title: thumb[2],
			type: 'video',
                        icon: thumb[1],
                        description: thumb[2],
                        genre: rating[2].split(':')[1],
			rating : +(parseInt(ddata[4])),
                        views: +parseInt(ddata[2])
                    });
                    }
                }
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


