// ==UserScript==
// @name         Unfollow Users
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
	// sessionStorage.setItem( "unfollow", JSON.stringify( unfollows ) );
	// sessionStorage.setItem( "unfollowFlag", "true" );
	// sessionStorage.setItem( "firstUnfollow", "true" );

	// call unfollowUser after jquery and if the unfollow flag is true
	if( sessionStorage.getItem("unfollowFlag") == "true" ){
		// check for jQuery and add it
		if( typeof jQuery == "undefined" ) {
			var jquery_cdn = document.createElement("script");
			jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
			document.body.prepend(jquery_cdn);
			jQueryListen();
		}
	}

	// listen for jQuery to be loaded
	function jQueryListen(){
		if( typeof jQuery == "undefined" )
			setTimeout(jQueryListen, 250);
		else
			unfollowUser();
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
			// pop the current user. We are on their page.
			var curUser = unfollows.pop();
			// update the session storage
			sessionStorage.setItem( "unfollow", JSON.stringify( unfollows ) );
			// click unfollow button
			$("button._frcv2").click();
			// check if we are done unfollowing
			if( unfollows.length ) {
				console.log("Users left: " + unfollows.length);
				// wait for unfollow to propagate and change location to next user
				setTimeout(function(){
					location.href = "https://www.instagram.com/" + unfollows[ unfollows.length - 1 ] + "/";
				}, 10000);
			}
			else {
				sessionStorage.setItem("unfollowFlag", "true");
				console.log("Done unfollowing your users.");
				return;
			}
		}
	}
})();