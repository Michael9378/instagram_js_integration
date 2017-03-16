// ==UserScript==
// @name         Inject jQuery
// @namespace    http://michaeljscott.net/
// @version      0.1
// @description  Inject jQuery if it isn't on the page yet.
// @author       Mike Scott
// @include      *
// @grant        unsafeWindow
// ==/UserScript==

unsafeWindow.injectJQuery = function injectJQuery(callbackFunction) {
    // create jquery if it doesnt exist on the page yet
    if( typeof jQuery == "undefined" ) {
        var jquery_cdn = document.createElement("script");
        jquery_cdn.setAttribute("src","https://code.jquery.com/jquery-3.1.1.min.js");
        document.body.prepend(jquery_cdn);
    }
    if( cb && typeof cb == "function" )
    	jQueryListen();
    // listen for jQuery to be loaded
    function jQueryListen(){
        if( typeof jQuery == "undefined" )
            setTimeout(jQueryListen, 250);
        else
            callbackFunction();
    }
};
console.log("inject jquery on. window.injectJQuery(callbackfunction) will inject jquery and call the calback after.");