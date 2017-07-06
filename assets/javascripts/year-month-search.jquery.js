(function($) {
    $.fn.generateDateArchive = function (options) {
      var node = $(this),
      jsonData = [],
      years = {},
      monthnames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      monthnos = ['01','02','03','04','05','06','07','08','09','10','11','12'];
      var settings = $.extend({
          jsonFile            : '/search.json',
          template            : '<a href="{url}" title="{desc}">{title}</a>',
          searchResults       : '.results',
          searchResultsTitle  : '<h4>Search results</h4>',
          limit               : '10',
          noResults           : '<p>Oh shucks<br/><small>Nothing found :(</small></p>'
      }, options);
      $.ajax({
          type: "GET",
          url: settings.jsonFile,
          dataType: 'json',
          success: function(data, textStatus, jqXHR) {
              jsonData = data;
              generateData();
          },
          error: function(x,y,z) {
              console.log("***ERROR in generateDateArchive()***");
              console.log(x);
              console.log(y);
              console.log(z);
              // x.responseText should have what's wrong
          }
      });
      function generateData(options) {
        var i, j, content = "", yearnums, year, monthname, monthno;
        // create a list of all valid months and years
        for (i = 0; i < jsonData.length; i++) {
          var obj = jsonData[i], dateparts;
          if (obj.date) {
            dateparts = obj.date.split('-');
            years[dateparts[0]] = years[dateparts[0]] || {};
            years[dateparts[0]][dateparts[1]] = true;
          }
        }
        // we now have a hash with all valid years and months
        yearnums = Object.keys(years).sort();
        for (i=0; i<yearnums.length; i++) {
          year = yearnums[i];
          content = content + '<li><a class="archive-link" href="'+year+'"><strong>'+year+'</strong></a>';
          // go through each month
          for (j=0; j< monthnames.length; j++) {
            monthname = monthnames[j];
            monthno = monthnos[j];
            if (years[year][monthno]) {
              content = content + '<a class="archive-link" href="'+year+'-'+monthno+'">'+monthname+'</a>';
            } else {
              content = content + '<span class="archive-link">'+monthname+'</span>';
            }
          }
          // end of the year, close it out
          content = content + '</li>';
        }
        // close out all of the years
        content = content + '</ul>';
        // fill in the content
        node.html(content);
      }
    };
    $.fn.yearMonthSearch = function(options) {
        var settings = $.extend({
            jsonFile            : '/search.json',
            template            : '<a href="{url}" title="{desc}">{title}</a>',
            searchResults       : '.results',
            searchResultsTitle  : '<h4>Search results</h4>',
            limit               : '10',
            noResults           : '<p>Oh shucks<br/><small>Nothing found :(</small></p>'
        }, options);

        var jsonData = [],
            origThis = this,
            searchResults = $(settings.searchResults);

        var matches = [];

        if(settings.jsonFile.length && searchResults.length){
            $.ajax({
                type: "GET",
                url: settings.jsonFile,
                dataType: 'json',
                success: function(data, textStatus, jqXHR) {
                    jsonData = data;
                    registerEvent();
                },
                error: function(x,y,z) {
                    console.log("***ERROR in simpleJekyllSearch.js***");
                    console.log(x);
                    console.log(y);
                    console.log(z);
                    // x.responseText should have what's wrong
                }
            });
        }

        function registerEvent(){
            origThis.on('click',function(e){
              // what year and or month was requested
              writeMatches( performSearch($(this).attr('href')) );
            });
        }

        function performSearch(str){
            matches = [];

            for (var i = 0; i < jsonData.length; i++) {
                var obj = jsonData[i];
                if (obj.date && obj.date.startsWith(str)) {
                  matches.push(obj);
                }
            }
            return matches;
        }

        function writeMatches(m){
            clearSearchResults();

            searchResults.append( $(settings.searchResultsTitle) );

            if(m && m.length){
                for (var i = 0; i < m.length && i < settings.limit; i++) {
                    var obj = m[i];
                    output = settings.template;
                    output = output.replace(/\{(.*?)\}/g, function(match, property) {
                        return obj[property];
                    });
                    searchResults.append($(output));
                }
            }else{
                searchResults.append( settings.noResults );
            }
        }
        function clearSearchResults(){
            searchResults.children().remove();
        }
    }
}(jQuery));
