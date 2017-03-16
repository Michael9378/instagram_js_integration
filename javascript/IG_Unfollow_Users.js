// ==UserScript==
// @name         IG Unfollow Users
// @namespace    http://michaeljscott.net/
// @description  Set unfollow array and unfollowFlag in session storage
// @author       Mike Scott
// @match        https://*.instagram.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  // this script is not entirely finished.
  // TODO: Pull unfollows from a db and store instead of manual entry
  // TODO: Wrap the unfollow flag and first unfollow flags along with triggering the unfollow loop into 1 function call.

	// before running this...
	// sessionStorage.setItem( "unfollow", JSON.stringify( unfollow_chunk ) );
	// sessionStorage.setItem( "unfollowFlag", "true" );
	// sessionStorage.setItem( "firstUnfollow", "true" );

	// call unfollowUser after jquery and if the unfollow flag is true
	if( sessionStorage.getItem("unfollowFlag") == "true" ){
		// check for jQuery and add it
		if( typeof jQuery == "undefined" ) {
			var jquery_cdn = document.createElement("script");
			jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
			document.body.prepend(jquery_cdn);
			setTimeout(unfollowUser, 3000);
		}
	}

	// recursive unfollow user function
	function unfollowUser(){
		// get unfollow list from unfollow session storage
		var unfollows = JSON.parse( sessionStorage.getItem("unfollow") );

		// this should never be true
		if( !unfollows.length ){
			sessionStorage.setItem("unfollowFlag", "true");
			console.log("Done unfollowing users.");
			return;
		}

		// if not on a user page, go to first user's page in unfollow array
		if( sessionStorage.getItem("firstUnfollow") == "true" ) {
			sessionStorage.setItem("firstUnfollow", "false");
			location.href = "https://www.instagram.com/" + unfollows[ unfollows.length - 1 ] + "/";
		}
		else {
			// check if we are done unfollowing
			if( unfollows.length ) {
				// pop the current user. We are on their page.
				var curUser = unfollows.pop();
				// update the session storage
				sessionStorage.setItem( "unfollow", JSON.stringify( unfollows ) );
				// click unfollow button if we are still following them
				if( $("button._frcv2").html() == "Following" ){
					$("button._frcv2").click();
					console.log("Users left: " + unfollows.length);
					if( !unfollows.length ) {
						sessionStorage.setItem("unfollowFlag", "true");
						alert("Done unfollowing chunk.");
						console.log("Done unfollowing chunk.");
						return false;
					}
					var waitTime = 30;
					waitTime += Math.random() * 60;
					var secondsleft = Math.ceil( waitTime/1000 );
					setInterval(function(){console.log("Time left before refresh: " + (secondsleft-=5) + "sec.");}, 5000);
					// wait for unfollow to propagate and change location to next user
					setTimeout(function(){
						location.href = "https://www.instagram.com/" + unfollows[ unfollows.length - 1 ] + "/";
					}, waitTime);
				}
				else
					location.href = "https://www.instagram.com/" + unfollows[ unfollows.length - 1 ] + "/";
			}
			else {
				sessionStorage.setItem("unfollowFlag", "true");
				console.log("Done unfollowing your users.");
				return;
			}
		}
	}
})();