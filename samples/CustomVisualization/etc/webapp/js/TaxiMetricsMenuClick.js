// Copyright (C) 2020 International Business Machines Corporation.
// All Rights Reserved 
//
// ============ START OF MENU CLICK PROCESSING LOGIC ============
var activeMenuTab = "";
// Let us start from the second image in the list since the 
// first image is selected as the background in the CSS file when this
// browser application's main page is first started or refreshed.
var titleImageIdx = 1;
var titleImages = ["dubai-taxi1.jpg", "dubai-taxi2.jpg", 
	"dubai-taxi3.jpg", "dubai-taxi4.jpg", "dubai-traffic1.gif"];

// This function gets called when the main page is loaded.
function main_onload() {
	// Let us start a timer driven activity to periodically
	// rotate the title image using a few image files that we have.
	// Do it every 30 seconds.
	var timeoutID = setInterval(loadTitleImages, 30000);
}

// This function is driven on a timer basis to load different title images.
function loadTitleImages() {
	// Load the next title image.
	document.getElementById('appTitle').style.backgroundImage = 
		"url('" + titleImages[titleImageIdx++] + "')";

	// Make it to start again from the first index in the image list.	
	if(titleImageIdx >= titleImages.length) {
		titleImageIdx = 0;
	}
}

// This funcion gets called when the "Select Community" menu tab is clicked.
function select_community_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the select community navigation option as an active (in use) one.
	document.getElementById("selectCommunity").className = "active";
	activeMenuTab = "selectCommunity";
	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="?request=SendCommunitySelectionData"' +
		'height="500" width="800"></object>';
}

// This function gets called when the "Taxi Counts" menu tab is clicked.
function taxi_counts_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the taxi counts navigation option as an active (in use) one.
	document.getElementById("taxiCounts").className = "active";
	activeMenuTab = "taxiCounts";

	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz/taxi-counts.html";

	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="' + url + '"' + 'height="700" width="1200"></object>';
}

// This function gets called when the "Taxi Counts Map" menu tab is clicked.
function taxi_counts_map_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the taxi counts map navigation option as an active (in use) one.
	document.getElementById("taxiCountsMap").className = "active";
	activeMenuTab = "taxiCountsMap";
	
	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz/taxi-counts-map.html";

	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="' + url + '"' + 'height="700" width="1200"></object>';
}

// This function gets called when the "Taxi Bookings" menu tab is clicked.
function taxi_bookings_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the taxi bookings navigation option as an active (in use) one.
	document.getElementById("taxiBookings").className = "active";
	activeMenuTab = "taxiBookings";

	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz/taxi-bookings.html";

	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="' + url + '"' + 'height="700" width="1200"></object>';
}

// This function gets called when the "Taxi Bookings Map" menu tab is clicked.
function taxi_bookings_map_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the taxi counts map navigation option as an active (in use) one.
	document.getElementById("taxiBookingsMap").className = "active";
	activeMenuTab = "taxiBookingsMap";

	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz/taxi-bookings-map.html";

	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="' + url + '"' + 'height="700" width="1200"></object>';
}

// This function gets called when the "Supply & Demand" menu tab is clicked.
function supply_and_demand_menu_onclick() {
	// Make the previously active menu tab if any to normal (not in use) status.
	if(activeMenuTab != "") {
		document.getElementById(activeMenuTab).className = "a";
	}
	
	// Set the supply & demand navigation option as an active (in use) one.
	document.getElementById("supplyAndDemand").className = "active";
	activeMenuTab = "supplyAndDemand";

	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz/supply-and-demand.html";

	document.getElementById("main").innerHTML = '<object type="text/html"' +
		'data="' + url + '"' + 'height="700" width="1200"></object>';	
}
// ============ END OF MENU CLICK PROCESSING LOGIC ============
