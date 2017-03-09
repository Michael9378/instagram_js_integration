// ==UserScript==
// @name         IG Console Functions
// @namespace    http://michaeljscott.net/
// @version      0.1
// @description  Functions to be called through the console on the page.
// @author       Michael Scott
// @match        https://*.instagram.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

  /***********************
	***ACCOUNTS TO SCRAPE***
	************************/
	/*

	/promotocross/
	/therealjs7/
	/kenroczen94/
	/treycanard/
	/ryanvillopoto/
	/malcolmstewart/
	/motosportinc/
	/vitalmx/
	/vurbmoto/
	/racerxonline/
	/twmxdotcom/
	/jimmyalbertson/
	/westonpeick/
	/ryandungey/
	/crtwotwo/
	/justinbarcia/


	Tags layout
	------------
	/explore/tags/LITERALTAG/

	*/

	// scrapes 1000 users from an open list and saves it to filename
	// scrapes users and stores into session variable of "users" or "follows"
	function scrapeUsers(following) {

		// set max to 1000 to avoid crashing browser
		var MAX_GET_FOLLOWERS = 1000;

		// create jquery if it doesnt exist on the page yet
		if( typeof jQuery == "undefined" ) {
			var jquery_cdn = document.createElement("script");
			jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
			document.body.prepend(jquery_cdn);
		}

		// listen for jQuery to be loaded
		function jQueryListen(){
			if( typeof jQuery == "undefined" )
				setTimeout(jQueryListen, 250);
			else
				afterJQuery();
		}

		// after jquery loaded, begin opening lists
		function afterJQuery(){
			// used to make sure only 1 call of finished function is called.
			finishedScraping = false;

			// bind children being added to the list with scroll to load more
			$('._4gt3b').bind('DOMSubtreeModified', function(){
				// scroll down and load more
				$("._4gt3b").scrollTop( $("._4gt3b ul").height() );
				// set timeout to check if we havent updated in 5 seconds (probably at bottom of list)
				var oldListLength = jQuery("ul._4j13h").children().length;
				console.log("Items left before auto-stop: " + (MAX_GET_FOLLOWERS - jQuery("ul._4j13h").children().length) );
				setTimeout(function(){
					// stop after the ul stops expanding or we hit our max number.
					if( oldListLength == jQuery("ul._4j13h").children().length || jQuery("ul._4j13h").children().length > MAX_GET_FOLLOWERS ) {
						// leave unbind command to be called multiple times for safe measure.
						$('._4gt3b').unbind('DOMSubtreeModified');
						// this timeout function may be called multiple times
						// use flag to make sure it is only executed once.
						if( !finishedScraping ) {
							finishedScraping = true;
							console.log("Done loading list.");
							afterListLoaded();
						}
					}
				}, 5000);
			});
			// start loading more in the list.
			$("._4gt3b").scrollTop( $("._4gt3b ul").height() );
		}

		// function to be called after the list has been opened
		function afterListLoaded(){
			// the list has fully loaded
			// grab all the user names
			var users_jq = $("._j7lfh");
			var users = [];

			if( typeof following !== 'undefined') {
				// push all the users to a follows array
				for(var i = 0; i < users_jq.length; i++ ) {
					users.push( [users_jq[i].innerHTML, following] );
				}
				sessionStorage.setItem("follows", JSON.stringify(users));
				console.log("Follow relationship saved in session storage as 'follows'.");
			}
			else {
				// push all the users to an array
				for(var i = 0; i < users_jq.length; i++ ) {
					users.push( users_jq[i].innerHTML );
				}
				sessionStorage.setItem("users", JSON.stringify( users ));
				console.log("Users saved in session storage as 'users'.");
			}
		}
	}

	// this filter out function will ultimately be replaced by database calls.
	// http://stackoverflow.com/questions/34901593/how-to-filter-an-array-from-all-elements-of-another-array
	function filterArray(baseArr, filterOutArr){
		var returnArr = baseArr.filter(function(e){return this.indexOf(e)<0;},filterOutArr);
		return returnArr;
	}

	// save data to a local file
	// this needs to be updated to store the suers into a table
	// http://stackoverflow.com/questions/11849562/how-to-save-the-output-of-a-console-logobject-to-a-file
	(function(console){
		console.save = function(data, filename){
		  if(!data) {
		    console.error('Console.save: No data');
		    return;
		  }
		  if(!filename)
		  	filename = 'console.json';
		  if(typeof data === "object"){
		    data = JSON.stringify(data, undefined, 4);
		  }
		  var blob = new Blob([data], {type: 'text/json'}),
		    e = document.createEvent('MouseEvents'),
		    a = document.createElement('a');
		  a.download = filename;
		  a.href = window.URL.createObjectURL(blob);
		  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
		  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		  a.dispatchEvent(e);
		};
	})(console);


})();