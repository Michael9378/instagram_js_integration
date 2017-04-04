// ==UserScript==
// @name         IG Automator
// @namespace    http://michaeljscott.net/
// @version      0.1
// @description  Like posts, Follow users, and Unfollow users,
// @author       Michael Scott
// @match        https://*.instagram.com/*
// ==/UserScript==

// We can assume if this plugin is running that the user wants to run this script.

// Have initial inputs for setup.
// You will need a tag list, a black list, and current username from the user
// Advanced settings allow for adjustment of like limit, likes per hour, and likes per follow/unfollow

// Global variables
var username;
var tags;
var blacklist;
var likeLimit;
var likesPerHour;
var followLimit

// flags for proper operation
var initDone = ( sessionStorage.getItem("initDone") == null );
var runBot = false;
var dailyInit = false;

// if we haven't run init yet, run it.
if( !initDone ) {
	injectJquery();
	setTimeout(instagramInit, 2000);
	// all variables are stored in global but need to be saved in local/session storage
	localStorage.setItem("username", username);
	localStorage.setItem("tags", tags);
	localStorage.setItem("blacklist", blacklist);
	localStorage.setItem("likeLimit", likeLimit);
	localStorage.setItem("likesPerHour", likesPerHour);
	localStorage.setItem("followLimit", followLimit);
}
if( runBot ) {
	// if we haven't reset our daily limits and timers, do so now.
	if( !dailyInit )
		dailyInit();
	// start liking posts
	likePost();
}


// Initial startup takes in user parameters
function instagramInit(){
	// TODO: Check if setup in local storage first and prompt with that for blacklist and tags
	alert("You have the instagram bot enabled. Disable the plugin and reload page to stop it.\n\nPlease answer the following prompts to setup scripts. \n\nIf you find accounts you do not wish to like or follow, please enter them in the blacklist. \n\nFor tags, grab 2 or more tags to pull from. Make sure that 1 these tags post pictures relevant to your account that you would like and 2 that they have a good amount of pictures posted to them (more than 500,000 total posts. 2 tags with 1.5 mil posts worked for me.)");
	alert("Notice: Like and follow limit suggestions are known to be safe. Go beyond these at your own risk. Don't get you account banned, I can't help you and it WILL happen if you violate limits exceptionally.)");
	// get username
	username = $(".coreSpriteDesktopNavProfile").attr("href");
	username = username.substring(1, username.length-1);
	username = prompt("Is your username correct here?", username);
	// get list of tags
	tags = prompt("Please enter a comma seperated list of tags to pull posts from (no spaces).", "motocross,dirtbike,motolife,braap,2stroke");
	tags = tags.split(",");
	// get blacklist
	blacklist = prompt("Enter list of users not to like or follow (no spaces).", "dirtbikemedia,alphamxgraphics,jmx_shop,creditcascos,dirtkingdom,puncak_sablon,dirtfilmx,sisinblack_,adrenalinejunkieprod,crushedmx,dirtbikevideos,shineraysdeal,factorybacking,motoholics,waspcam,vintage_offroad,motouniverse,rottamg,bonnieclassentertainment");
	blacklist = blacklist.split(",");
	// get daily like limit
	likeLimit = prompt("Enter daily like limit.", "500");
	likeLimit = parseInt( likeLimit );
	// get likes per hour
	likesPerHour = prompt("Enter likes per hour.", "100");
	likesPerHour = parseInt( likesPerHour );
	// get follow/unfollows per hour
	followLimit = prompt("Enter follows/unfollows daily limit.", "100");
	followLimit = parseInt( followLimit );
	// set init done to true
	sessionStorage.setItem("initDone", "true");
}

// Before starting this script, run setUp(tag, blacklist)

function setUp( tags, blacklist ){
	sessionStorage.setItem("likeFlag", "true");
	sessionStorage.setItem("startTime", (new Date()).getTime() );
	sessionStorage.setItem("likeCount", 0);
	sessionStorage.setItem("likesPerHour", 100);
	localStorage.setItem("exploreTags", tags);
	localStorage.setItem("blacklist", JSON.stringify( blacklist ) );
	if( !localStorage.getItem("globalAutoLikeCount") )
		localStorage.setItem("globalAutoLikeCount", "0");
}

function addToBlackList(new_user) {
	var blacklist = JSON.parse( localStorage.getItem("blacklist") );
	blacklist.push(new_user);
	localStorage.setItem("blacklist", JSON.stringify( blacklist ) );
}

// get start time and parse to number
var runningTime = Number( sessionStorage.getItem("startTime") );
// subtract it from current time
runningTime = (new Date()).getTime() - runningTime;
// check if we should keep moving
if( sessionStorage.getItem("likeFlag") == "true" ) {
	// check we are on the right url
	var tag = getTag();
	if( window.location.pathname != "/explore/tags/" + tag + "/" ) {
		url = "https://www.instagram.com/explore/tags/" + tag + "/";
		sessionStorage.setItem("reloadTime", (new Date()).getTime());
		window.location = url;
	}
	// If we are stuck for 3 minutes, we probably hit a problem.
	delayReload(3*60*1000);
	console.log("Session run time: " + msToTime( runningTime ) );
	console.log("Session like count: " + sessionStorage.getItem("likeCount"));
	var sessionlikes = Number( sessionStorage.getItem("likeCount") );
	lph = (60*60*1000)*sessionlikes/runningTime;
	console.log("Likes per hour: " + lph.toFixed(1) );
	var lpm = lph/60;
	console.log("Likes per minute: " + lpm.toFixed(2) );
	// make sure to wait at least 30 seconds before reloading page
	// inject jquery and wait 20 seconds.
	var jquery_cdn = document.createElement("script");
    jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
    document.body.prepend(jquery_cdn);
	setTimeout(likePost, 5*1000);
}

// grab most recent post on page given a tag and like it
// our page wait time is = 3600/lph
var page_wait_time_in_sec = 3600/( Number( sessionStorage.getItem("likesPerHour") ) );
// get start time
var start = (new Date()).getTime();
// offset start time with load time
var loadTime = (new Date()).getTime() - Number( sessionStorage.getItem("reloadTime") );
// check for huge load times to ignore
if( loadTime < 5000 ) {
	page_wait_time_in_sec -= (loadTime/1000);
}

function likePost(){
	// remove top posts
	$("._5kftd").remove();
	setTimeout(function(){
		// click first post to open it
		// find 13th post. This post has been up for a couple minutes.
		checkAndLike(6);
	}, 5000);
}

function checkAndLike(index){
	if( $("._8mlbc._vbtk2._t5r8b").length <= index ) {
		// we ran out of pictures on the page to click.
		// hit the load more button and check same index again.
		if( $("._8imhp._glz1g").length ) {
			$("._8imhp._glz1g")[0].click();
			setTimeout( function(){
				checkAndLike(index);
			}, 2000);
			return false;
		}
		else {
			// there is no more load more button.
			// if you got to this point, you should pr0bably just reload page
			var tag = getTag();
			url = "https://www.instagram.com/explore/tags/" + tag + "/";
			sessionStorage.setItem("reloadTime", (new Date()).getTime());
			window.location = url;
		}
	}
	// open current image
	$("._8mlbc._vbtk2._t5r8b")[index].click();
	// wait some more before liking this post.
	setTimeout(function(){
		// check for spammy post
		if( checkforskip() ) {
			index++;
			checkAndLike(index);
			return false;
		}
		else {
			// check if we liked this post already
			if( $(".coreSpriteHeartOpen").length ) {
				console.log("Liking post in 5 seconds.");
				setTimeout(function(){
					// like post
					$(".coreSpriteHeartOpen").click();
					// log the like
					var likeCount = sessionStorage.getItem("likeCount");
					likeCount = Number(likeCount);
					likeCount++;
					// log to global like count
					var globalLikeCount = localStorage.getItem("globalAutoLikeCount");
					globalLikeCount = Number(globalLikeCount);
					globalLikeCount++;
					localStorage.setItem("globalAutoLikeCount", globalLikeCount);
					// stop if we reach our 500 session limit
					if( likeCount > 500 ){
						sessionStorage.setItem("likeFlag", "false");
						alert("Exceeded session like count. Stopping.");
						return false;
					}
					sessionStorage.setItem("likeCount", likeCount);

					// random wait to match pageWaitTime
					var pageWaitTime = page_wait_time_in_sec*1000 - ( (new Date()).getTime() - start );
					var reloadWait = Math.random() * (pageWaitTime*2);
					reloadWait = Math.ceil(reloadWait);

					console.log("Reloading page in " + Math.ceil(reloadWait/1000) + " seconds");
					delayReload(reloadWait);
				}, 5*1000);
			}
			else {
				index++;
				checkAndLike(index);
				return false;
			}
		}
	}, 2000);
}

function delayReload(waitTime) {
	if(waitTime > 9999 && waitTime < 60*1000) {
		var secondsLeft = Math.ceil(waitTime/1000);
		setInterval(function(){
			console.log("Seconds left: " + (secondsLeft-=5));
		}, 5000);
	}
	setTimeout(function(){
		var tag = getTag();
		url = "https://www.instagram.com/explore/tags/" + tag + "/";
		sessionStorage.setItem("reloadTime", (new Date()).getTime());
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
	blacklist = JSON.parse( localStorage.getItem("blacklist") );
	for( var i = 0; i < blacklist.length; i++) {
		if( posterlink.includes( blacklist[i] ) )
			return true;
	}
	// if too many likes already, also skip
	if( $("._tf9x3 span")[0] && parseInt($("._379kp").html()) < 15 )
		return true;

	return false;
}

// returns the current tag to use for next like
function getTag() {
	var tags = JSON.parse( localStorage.getItem("exploreTags") );
	var index = Number(localStorage.getItem("globalAutoLikeCount"))%tags.length;
	return tags[index];
}