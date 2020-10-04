// Copyright (C) 2020 International Business Machines Corporation.
// All Rights Reserved 
//
// ============ START OF SUPPLY & DEMAND PAGE LOGIC ============
// This function gets called when the supply & demand page is loaded.
function supply_and_demand_onload() {
	// Let us get the Supply & Demand data periodically via a XHR timer.
	var url = window.location.href + "?request=SendSupplyAndDemandData";
	loadData(url);		
}

function loadData(url) {	
	// Retreive data from the WebClientRequestHandler operator in the 
	// TaxiMetrics IBM Streams application.	
	//
	// construct HTTP request and send 
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	
	xhr.onreadystatechange = function() {
		// When we get the response back, update the visuals on this page.
		if (xhr.readyState == 4 && xhr.status == 200) {
			 updateTheVisuals(xhr.responseText);
		 }   				 
	}
			
	xhr.send(null);			

	// Refresh data every x seconds.
	var timeoutID = setTimeout(loadData, 5000, url);
}

// This variable tells us if the visuals are already created once before.
var visualsAlreadyMade = false;
var sortAscending = true;
// Let us create an array holding the column titles in the HTML table.
var titles = ["Time", "ID", "Name", "District", "Hired", "Available", "%"];
var table;
var headers;
var tbody = null;
var rows;
var supplyAndDemandAlertData = [];

// We are going to use d3js to dynamically populate different visuals on this page.
function updateTheVisuals(responseText) {
	var response;
	
	try {
		// Let us parse the JSON response into a Javascript array of JSON objects,
		response = JSON.parse(responseText);
	} catch (ex) {
		alert("updateTheVisuals: A non-JSON message was received from the server-->" +
			responseText);
		return;
	}

	// Let us create/update a new array of subset of JSON objects using the 
	// received data to match with the rows and columns of the HTML table.
	//
	// We can use the Javascript map function to create a 
	// new array by using the elements in an existing array.
	// https://stackoverflow.com/questions/2250953/how-do-i-create-javascript-array-json-format-dynamically
	response.map(function(item) {
		// If we receive a data item with an empty time or an empty community name, let us ignore it.
		if(item.time == "" || item.communityName == "") {
			return;
		}
		
		// We will push this JSON object into the supplyAndDemandAlertData array
		// Create a new element for this object.
		supplyAndDemandAlertData.push(
			// Append a JSON object into the array.
			{ 
				"Time" : item.time,
		        "ID" : item.communityId,
		        "Name" : item.communityName,
		        "District" : item.districtName,
		        "Hired" : item.hired,
		        "Available" : item.available,
		        "%" : item.alertPercentage
	        }
    	);
    });
	
	if (visualsAlreadyMade == false) {
		// Let us create the visuals for the first time.
		// 1) Create an all in one table.
		createTable();
		
		// Update only if there is some data available.
		if(supplyAndDemandAlertData.length > 0) {
			updateTable();
			// Enable the clear button.
			document.getElementById("clearAlerts").disabled = false;
			document.getElementById("clearAlerts").className = "clearAlertsActive";
		} else {
			// Disable the clear button.
			document.getElementById("clearAlerts").disabled = true;
			document.getElementById("clearAlerts").className = "clearAlertsInactive";		
		}
		
		// This is the first time we are creating this table.
		visualsAlreadyMade = true;
	} else {
		// Update only if there is some data available.
		if(supplyAndDemandAlertData.length > 0) {
			// Our visuals have already been created.
			// Let us update them now.
			//
			// Before putting this new data to use, we will clear the 
			// visuals already being displayed with the previously fetched data.
			// 1) Clear and update the table.
			document.getElementsByTagName("tbody")[0].innerHTML = "";
			updateTable();
			// Enable the clear button.
			document.getElementById("clearAlerts").disabled = false;
			document.getElementById("clearAlerts").className = "clearAlertsActive";
		} else {
			// Disable the clear button.
			document.getElementById("clearAlerts").disabled = true;
			document.getElementById("clearAlerts").className = "clearAlertsInactive";		
		}
	}
}

// Following section has the functions required for the sortable table.
// Main d3js ideas on this particular task are explained here:
// http://bl.ocks.org/AMDS/4a61497182b8fcb05906
// ======== START OF CREATING AND UPDATING THE SORTABLE TABLE ======== 
// This function creates the table for the first time.
function createTable() {
	table = d3.select('#supply-and-demand-table').append('table');
	headers = table.append('thead').append('tr')
		.selectAll('th')
		.data(titles).enter()
		.append('th')
		.text(function (d) {
			return d;
		})
		.on('click', function (d) {
			headers.attr('class', 'header');
		                	   
			if (sortAscending) {
				rows.sort(function(a, b) { return b[d] < a[d];});
				sortAscending = false;
				this.className = 'aes';
			} else {
				rows.sort(function(a, b) { return b[d] > a[d]; });
				sortAscending = true;
				this.className = 'des';
			}
		                	   
		});

		// Add a tbody element.
		tbody = table.append('tbody');
}

// This function updates the table with new and existing rows.
function updateTable() {
	rows = tbody.selectAll('tr')
		.data(supplyAndDemandAlertData).enter()
		.append('tr');
		
	rows.selectAll('td')
		.data(function (d) {
			return titles.map(function (k) {
				return { 'value': d[k], 'name': k};
			});
		}).enter()
		.append('td')
		.attr('data-th', function (d) {
			return d.name;
		})
		.text(function (d) {
			return d.value;
		});
}
// ======== END OF CREATING AND UPDATING THE SORTABLE TABLE ======== 

// ======== START OF CLEARING THE SUPPLY & DEMAND ALERT DATA ======== 
// This function gets called when the "Clear" button is clicked.
function clear_alerts_onclick() {
	// Before proceeding further, ask the user to confirm it one more time.
	var r = confirm("Do you want to clear all the alerts?");

	if (r == false) {
		return;
	}
	
	// Send the Supply & Demand Alert Clear command to the server.
	// Send it to the remote server via XHR (XML HTTP Request).
	var xhr = new XMLHttpRequest();
	var url = window.location.href + "?request=ClearSupplyAndDemandData";
	xhr.open('GET', url, true);

	// Call a function when the state changes.
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			// Clear the table contents.
			document.getElementsByTagName("tbody")[0].innerHTML = "";
			// Disable the clear button.
			document.getElementById("clearAlerts").disabled = true;
			document.getElementById("clearAlerts").className = "clearAlertsInactive";	
			// Clear the local data structure as well.
			supplyAndDemandAlertData = [];
    	}
	}
	
	xhr.send(null);
}
// ======== END OF CLEARING THE SUPPLY & DEMAND ALERT DATA ======== 

// ============ END OF SUPPLY & DEMAND PAGE LOGIC ============
