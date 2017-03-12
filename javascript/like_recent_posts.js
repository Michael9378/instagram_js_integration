// ==UserScript==
// @name         IG Like Posts
// @namespace    http://michaeljscott.net/
// @version      0.1
// @description  Follow most recent posts given a tag
// @author       Michael Scott
// @match        https://*.instagram.com/*
// ==/UserScript==


// Before starting this script, run setUp(tag, blacklist)

// setUp("motocross", ["factorybacking", "motoholics", "waspcam", "vintage_offroad", "motouniverse", "rottamg", "bonnieclassentertainment"]);
function setUp( tag, blacklist ){
	sessionStorage.setItem("exploreTag", tag);
	sessionStorage.setItem("likeFlag", "true");
	sessionStorage.setItem("startTime", (new Date()).getTime() );
	sessionStorage.setItem("likeCount", 0);
	sessionStorage.setItem("blacklist", JSON.stringify( blacklist ) );
}



// get start time and parse to number
var runningTime = Number( sessionStorage.getItem("startTime") );
// subtract it from current time
runningTime = (new Date()).getTime() - runningTime;
// 5 hours is 5*60*60*1000 milliseconds
var fiveHours = 5*60*60*1000;
// set like flag to false if we have been going for 5 or more hours on 1 session.
if( runningTime > fiveHours ) {
	sessionStorage.setItem("likeFlag", "false");
	alert("Exceeded session time. Stopping.");
}
// check if we should keep moving
if( sessionStorage.getItem("likeFlag") == "true" ) {
	console.log("Session run time: " + msToTime( runningTime ) );
	console.log("Session like count: " + sessionStorage.getItem("likeCount"));
	// make sure to wait at least 30 seconds before reloading page
	// inject jquery and wait 20 seconds.
	var jquery_cdn = document.createElement("script");
    jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
    document.body.prepend(jquery_cdn);
	setTimeout(likePost, 5*1000);
}

// grab most recent post on page given a tag and like it
function likePost(){
	// we have 25 seconds to kill still. Set timeouts for clicks
	// remove top posts
	console.log("removing top posts");
	$("._5kftd").remove();
	setTimeout(function(){
		// click first post to open it
		// find 13th post. This post has been up for a couple minutes.
		checkAndLike(9);
	}, 5000);
}

function checkAndLike(index){
	if( $("._8mlbc._vbtk2._t5r8b").length <= index ) {
		// we ran out of pictures on the page to click.
		// hit the load more button and check same index again.
		$("._8imhp._glz1g")[0].click();
		setTimeout( function(){
			checkAndLike(index);
		}, 2000);
	}
	// open current image
	$("._8mlbc._vbtk2._t5r8b")[index].click();
	// wait some more before liking this post.
	setTimeout(function(){
		// check for spammy post
		if( checkforskip() ) {
			index++;
			checkAndLike(index);
		}
		// check if we liked this post already
		if( $(".coreSpriteHeartOpen").length ) {
			console.log("Liking post in 15 seconds.");
			setTimeout(function(){
				// like post
				$(".coreSpriteHeartOpen").click();
				// log the like
				var likeCount = sessionStorage.getItem("likeCount");
				likeCount = Number(likeCount);
				likeCount++;
				if( likeCount > 300 ){
					sessionStorage.setItem("likeFlag", "false");
					alert("Exceeded session like count. Stopping.");
					return false;
				}
				sessionStorage.setItem("likeCount", likeCount);

				// we have been on the page for atleast 30 seconds.
				var reloadWait = Math.random() * 60 * 1000;
				reloadWait = Math.ceil(reloadWait);

				console.log("reloading page in " + reloadWait/1000 + "seconds");
				delayReload(reloadWait);
			}, 15*1000);
		}
		else {
			index++;
			checkAndLike(index);
		}
	}, 2000);
}

function delayReload(waitTime) {
	setTimeout(function(){
		var tag = sessionStorage.getItem("exploreTag");
		url = "https://www.instagram.com/explore/tags/" + tag + "/";
		window.location = url;
	}, waitTime);
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100),
        seconds = parseInt((duration/1000)%60),
        minutes = parseInt((duration/(1000*60))%60),
        hours = parseInt((duration/(1000*60*60))%24);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "hour " + minutes + "min " + seconds + "sec";
}

function checkforskip() {
	var posterlink = $("._ook48").attr("href");
	var blacklist = [];
	blacklist = JSON.parse( sessionStorage.getItem("blacklist") );
	for( var i = 0; i < blacklist.length; i++) {
		if( posterlink.includes( blacklist[i] ) )
			return true;
	}


}