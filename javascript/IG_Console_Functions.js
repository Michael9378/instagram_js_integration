// ==UserScript==
// @name         IG Scrape Users
// @namespace    http://michaeljscott.net/
// @version      0.1
// @description  Scrap users from page and save to session storage
// @author       Michael Scott
// @match        https://*.instagram.com/*
// ==/UserScript==

// scrapes users and stores into session variable of "users" or "follows"
// passed no parameters, the function will scrape the opened list and save all users under 'users'
// passed with cur_user will save an array of user follows user.
// if follows relationship: Set is_followers_list to true if the opened list is a followers list, false if following list.
unsafeWindow.scrapeUsers = function scrapeUsers(cur_user, is_followers_list) {

	// set max to 1000 to avoid crashing browser
	var MAX_GET_FOLLOWERS = 1000;

	// array to hold scrapped users
	var users = [];

	// inject jquery using inject jquery plugin
	if( typeof jQuery == "undefined" )
		window.injectJQuery(afterJQuery);
	else
		afterJQuery();

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

		if( typeof cur_user !== 'undefined') {
			// push all the users to a follows array
			for(var i = 0; i < users_jq.length; i++ ) {
				if(is_followers_list)
					users.push( [users_jq[i].innerHTML, cur_user] );
				else
					users.push( [cur_user, users_jq[i].innerHTML] );
			}
			console.log("Redirecting to save to db.");
			window.location = "http://socialmedia.michaeljscott.net/set/follows/?mass_follow=" + encodeURI( JSON.stringify( users_chunk ) );
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

	// save follow relationships stored in the user array to database.
	function saveFollowsToDB(){
		// will need to use ajax call to send to db without page reload
		// will need to do ajax stores in multiples of 50's to make sure db isnt overloaded.
		if( users.length ) {
			window.location = "http://socialmedia.michaeljscott.net/set/follows/";
			// saves follow relationships to database
			function sendChunk(){
				if(users.length > 50) {
					// hack off 50 users and send away.
					var users_chunk = [];
					for(var i = 0; i < 50; i++) {
						users_chunk.push( users.pop() );
					}
					var data = encodeURI( JSON.stringify( users_chunk ) );
					jQuery.ajax({
						url: "http://socialmedia.michaeljscott.net/set/follows/?mass_follow="+data,
						error: function(xhr,status,error){
							console.log(error);
						},
						success: function(result){
      				console.log(users.length + " users left to save.");
      				sendChunk();
						}
					});
				}
				else {
					// send entire users array
					var data = encodeURI( JSON.stringify( users ) );
					jQuery.ajax({
						url: "http://socialmedia.michaeljscott.net/set/follows/?mass_follow="+data,
						error: function(xhr,status,error){
							console.log(error);
						},
						success: function(result){
      				console.log("All users saved to database!");
						}
					});
				}
			}
		}
	}
};