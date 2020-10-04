// Copyright (C) 2020 International Business Machines Corporation.
// All Rights Reserved 
//
// ============ START OF TAXI BOOKINGS PAGE LOGIC ============
// This function gets called when the taxi bookings page is loaded.
function taxi_bookings_onload() {
	// Let us get the Taxi Bookings metrics data periodically via a XHR timer.
	var url = window.location.href + "?request=SendTaxiBookingMetrics&popup=true";
	loadData(url);	
	
	// Let us get the New Taxi Bookings trend data periodically via a XHR timer.
	url = window.location.href + "?request=SendTaxiBookingTrend";
	loadNewTaxiBookingsTrendData(url);
	
	// Let us get the Unserved Taxi Bookings trend data periodically via a XHR timer.
	url = window.location.href + "?request=SendTaxiBookingTrend";
	loadUnservedTaxiBookingsTrendData(url);
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
var titles = ["Time", "ID", "Name", "District", "New", "Served", "Unserved", "Canceled", "Upcoming New"];
var table;
var headers;
var tbody = null;
var rows;
var taxiBookingsData = [];

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
		
		// We will either push this JSON object in to the taxiBookingsData array if it
		// doesn't exist in that array or simply update if it already exists in that array.
		var idx = -1;
		
		for(var i=0; i<taxiBookingsData.length; i++) {
			if(taxiBookingsData[i].ID == item.communityId) {
				// This object already exists.
				idx = i;
				break;
			}
		}
		
		if(idx == -1) {
			// Create a new element for this object.
			taxiBookingsData.push(
				// Append a JSON object into the array.
				{ 
					"Time" : item.time,
			        "ID" : item.communityId,
			        "Name" : item.communityName,
			        "District" : item.districtName,
			        "New" : item.currentNew,
			        "Served" : item.served,
			        "Unserved" : item.unserved,
			        "Canceled" : item.canceled,
			        "Upcoming New" : item.futureNew
		        }
        	);
        } else {
        	// Simply replace the existing object's member values with the 
        	// new values for this community id.
        	taxiBookingsData[idx].Time = item.time;
        	taxiBookingsData[idx].Name = item.communityName;
        	taxiBookingsData[idx].District = item.districtName;
        	taxiBookingsData[idx].New = item.currentNew;
        	taxiBookingsData[idx].Served = item.served;
        	taxiBookingsData[idx].Unserved = item.unserved;
        	taxiBookingsData[idx].Canceled = item.canceled;
        	taxiBookingsData[idx]["Upcoming New"] = item.futureNew;
        }
    });
	
	if (visualsAlreadyMade == false) {
		// Let us create the visuals for the first time.
		// 1) Create an all in one table.
		createTable();
		
		// Update only if there is some data available.
		if(taxiBookingsData.length > 0) {
			updateTable();
		}
		
		// 2) Create two donut charts.
		createDonut1();
		createDonut2();

		// Update only if there is some data available.
		if(taxiBookingsData.length > 0) {
			updateDonut1();
			updateDonut2();
		}
		
		// 3) Populate the new taxi bookings Trend dropdown box.
		populateTrendDropdownBox("community-for-new-trend");
		
		// 4) Populate the unserved taxi bookings Trend dropdown box.
		populateTrendDropdownBox("community-for-unserved-trend");
				
		// This is the first time we are creating this table.
		visualsAlreadyMade = true;
	} else {
		// Update only if there is some data available.
		if(taxiBookingsData.length > 0) {
			// Our visuals have already been created.
			// Let us update them now.
			//
			// Before putting this new data to use, we will clear the 
			// visuals already being displayed with the previously fetched data.
			// 1) Clear and update the table.
			document.getElementsByTagName("tbody")[0].innerHTML = "";
			updateTable();
			
			// 2) Update the two donut charts.
			updateDonut1();
			updateDonut2();

			// 3) Populate the new taxi bookings Trend dropdown box.
			populateTrendDropdownBox("community-for-new-trend");	
			
			// 4) Populate the unserved taxi bookings Trend dropdown box.
			populateTrendDropdownBox("community-for-unserved-trend");	
		}
	}	
}

// Following section has the functions required for the sortable table.
// Main d3js ideas on this particular task are explained here:
// http://bl.ocks.org/AMDS/4a61497182b8fcb05906
// ======== START OF CREATING AND UPDATING THE SORTABLE TABLE ======== 
// This function creates the table for the first time.
function createTable() {
	table = d3.select('#taxi-bookings-table').append('table');
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
		.data(taxiBookingsData).enter()
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

// Following section has the functions required for the donut chart.
// Main ideas about the d3.js donut charts are explained here:
// http://bl.ocks.org/dbuezas/9306799
//
// ======== START OF CREATING AND UPDATING DONUT1 ======== 
// This block of logic is duplicated below for Donut2 as well.
// We will optimize it later with reusable common code between them.
var width1;
var height1;
var radius1;
var svg1;
var pie1;
var arc1;
var outerArc1;
var key1;
var color1;

// This function creates the donut chart.
function createDonut1() {
	svg1 = d3.select("#new-bookings-donut")
		.append("svg")
		.append("g")
	
	svg1.append("g")
		.attr("class", "slices");
	svg1.append("g")
		.attr("class", "labels");
	svg1.append("g")
		.attr("class", "lines");
	
	width1 = 1060;
	height1 = 490;
	radius1 = Math.min(width1, height1) / 2;
	
	pie1 = d3.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});
	
	arc1 = d3.arc()
		.outerRadius(radius1 * 0.8)
		.innerRadius(radius1 * 0.4);
	
	outerArc1 = d3.arc()
		.innerRadius(radius1 * 0.9)
		.outerRadius(radius1 * 0.9);
	
	svg1.attr("transform", "translate(" + width1 / 2 + "," + height1 / 2 + ")");
	
	key1 = function(d){ return d.data.label; };	
	
	color1 = d3.scaleOrdinal()
		.domain("Not", "used", "in", "this", "application.")
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", 
		"#DC143C", "#DEB887", "#006400", "#9400D3", "#696969", "#B22222", "#DAA520", "#F0E68C",
		"#808000", "#008080", "#9ACD32", "#FF7F50", "#A52A2A", "#FF8C00", "#2F4F4F"]);	
}

function updateDonut1() {
	// Extract and store the chosen community names in an array of objects.
	// The donut chart update logic here will work as long as the data array we
	// create here during every call to this function will either carry the
	// same labels or keep having the labels seen before in previous calls + a few  more new labels.
	// It will have donut user interface update issues when a few labels are missing thereby
	// making the donut chart incomplete with missing pie slices.
	var data = [];

	for(var i=0; i<taxiBookingsData.length; i++) {
		data.push({label : taxiBookingsData[i].Name, 
			value: taxiBookingsData[i].New,
			labelDisplayText : taxiBookingsData[i].Name + ": " + taxiBookingsData[i].New});
	}

	/* ------- PIE SLICES -------*/
	var slice = svg1.select(".slices").selectAll("path.slice")
		.data(pie1(data), key1);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color1(d.data.label); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc1(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg1.select(".labels").selectAll("text")
		.data(pie1(data), key1);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			///// Senthil changed it from label to labelDisplayText
			return d.data.labelDisplayText;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc1.centroid(d2);
				pos[0] = radius1 * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	///// Senthil added this statement to change the label display for the slices.		
	text.text(function(d) {
		return d.data.labelDisplayText;
	});	

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg1.select(".lines").selectAll("polyline")
		.data(pie1(data), key1);
	
	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc1.centroid(d2);
				pos[0] = radius1 * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc1.centroid(d2), outerArc1.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
};
// ======== END OF CREATING AND UPDATING DONUT1 ======== 

// ======== START OF CREATING AND UPDATING DONUT2 ======== 
// This block of logic is duplicated above for Donut1 as well.
// We will optimize it later with reusable common code between them.
var width2;
var height2;
var radius2;
var svg2;
var pie2;
var arc2;
var outerArc2;
var key2;
var color2;

// This function creates the donut chart.
function createDonut2() {
	svg2 = d3.select("#unserved-bookings-donut")
		.append("svg")
		.append("g")
	
	svg2.append("g")
		.attr("class", "slices");
	svg2.append("g")
		.attr("class", "labels");
	svg2.append("g")
		.attr("class", "lines");
	
	width2 = 1060;
	height2 = 490;
	radius2 = Math.min(width2, height2) / 2;
	
	pie2 = d3.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});
	
	arc2 = d3.arc()
		.outerRadius(radius2 * 0.8)
		.innerRadius(radius2 * 0.4);
	
	outerArc2 = d3.arc()
		.innerRadius(radius2 * 0.9)
		.outerRadius(radius2 * 0.9);
	
	svg2.attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");
	
	key2 = function(d){ return d.data.label; };	
	
	color2 = d3.scaleOrdinal()
		.domain(["Not", "used", "in", "this", "application."])
		.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", 
		"#DC143C", "#DEB887", "#006400", "#9400D3", "#696969", "#B22222", "#DAA520", "#F0E68C",
		"#808000", "#008080", "#9ACD32", "#FF7F50", "#A52A2A", "#FF8C00", "#2F4F4F"]);
}

function updateDonut2() {
	// Extract and store the chosen community names in an array of objects.
	// The donut chart update logic here will work as long as the data array we
	// create here during every call to this function will either carry the
	// same labels or keep having the labels seen before in previous calls + a few  more new labels.
	// It will have donut user interface update issues when a few labels are missing thereby
	// making the donut chart incomplete with missing pie slices.
	var data = [];

	for(var i=0; i<taxiBookingsData.length; i++) {
		data.push({label : taxiBookingsData[i].Name, 
			value: taxiBookingsData[i].Unserved,
			labelDisplayText : taxiBookingsData[i].Name + ": " + taxiBookingsData[i].Unserved});
	}

	/* ------- PIE SLICES -------*/
	var slice = svg2.select(".slices").selectAll("path.slice")
		.data(pie2(data), key2);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color2(d.data.label); })
		.attr("class", "slice");

	slice		
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc2(interpolate(t));
			};
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg2.select(".labels").selectAll("text")
		.data(pie2(data), key2);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			///// Senthil changed it from label to labelDisplayText
			return d.data.labelDisplayText;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc2.centroid(d2);
				pos[0] = radius2 * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	///// Senthil added it to change the label display for the slices.		
	text.text(function(d) {
		return d.data.labelDisplayText;
	});	

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg2.select(".lines").selectAll("polyline")
		.data(pie2(data), key2);
	
	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc2.centroid(d2);
				pos[0] = radius2 * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc2.centroid(d2), outerArc2.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
};
// ======== END OF CREATING AND UPDATING DONUT2 ======== 

// ======== START OF CREATING AND UPDATING THE TAXI BOOKINGS METRICS TREND ========
var communityIdForNewTrend = "";
var communityIdForUnservedTrend = "";

// This function populates the taxis trend dropdown box with community names.
function populateTrendDropdownBox(id) {
	// Let us get the available community names.
	var communityNames = [];
	var communityIdsHashmap = [];
	
	for(var i=0; i<taxiBookingsData.length; i++) {
		communityNames.push(taxiBookingsData[i].Name);
		// Store the community id in an associative array i.e. a Hashmap.
		communityIdsHashmap[taxiBookingsData[i].Name] = taxiBookingsData[i].ID;
	}

	// Sort the community names array.
	communityNames.sort();
	//  Get the select dropdown box.
	var select = document.getElementById(id);
	// Get the current community name if any that is selected in the dropdown box.
	var currentValueSelected = "";
	
	if(select.selectedIndex != -1) {
		currentValueSelected = select.value;
	}
	
	// Let us now clear all the entries in the dropdown box and add them fresh.
	select.innerHTML = "";
	
	// We can now add a new set of options to the dropdown box.
	// https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array
	for(var i=0; i < communityNames.length; i++) {
		var el = document.createElement("option");
    	el.textContent = communityNames[i];
    	//  Value part of this select option is the community id.
    	el.value = communityIdsHashmap[communityNames[i]];
    	select.appendChild(el);
	}
	
	/*
	// Alternative to the for loop used above, we can also use this block of code if needed.
	var str = "";
	
	for(var i=0; i < communityNames.length; i++) {
		str += '<option value="' + 
		communityIdsHashmap[communityNames[i]]  + '">' +
		communityNames[i]  + '</option>' + '\n';
	}
	
	select.innerHTML = str;
	*/
	
	// If there was an option previously selected, let us set that now.
	if(currentValueSelected != "") {
		select.value = currentValueSelected;
	}
}
 
// This function gets called whenever a community name is 
// selected in the new taxi bookings trend dropdown box.
function community_selection_new_trend_onclick() {
	var select = document.getElementById("community-for-new-trend");
	// Get the current community name that is selected in the dropdown box.
	var currentValueSelected = select.value;
	
	// If there is no change in the selected community, simply return back.
	if(currentValueSelected == communityIdForNewTrend) {
		return;
	}
	
	// Let us set the new community name selected by the user which will be
	// picked up by the XHR timer method below.
	communityIdForNewTrend = currentValueSelected;
}

// This function is a timer driven one.
function loadNewTaxiBookingsTrendData(url) {	
	// Retreive data from the WebClientRequestHandler operator in the 
	// TaxiMetrics IBM Streams application.	
	//
	// Only when there is a community name selected by the user, we can perform this.
	if(communityIdForNewTrend != "") {
		//  Add the Community Name as a query string parameter.
		var newUrl = url + "&communityId=" + communityIdForNewTrend;
		// Construct HTTP request and send 
		var xhr = new XMLHttpRequest();
		xhr.open("GET", newUrl, true);
		
		xhr.onreadystatechange = function() {
			// When we get the response back, update the visuals on this page.
			if (xhr.readyState == 4 && xhr.status == 200) {
				// Second argument to this function indicates which type of trend graph is needed.
				// 1 = New Taxi Bookings Trend Graph
				// 2 = Unserved Taxi Bookings Trend Graph
				updateTheTrendGraph(xhr.responseText, 1);
			 }   				 
		}
				
		xhr.send(null);
	}	

	// Refresh data every x seconds.
	var timeoutID = setTimeout(loadNewTaxiBookingsTrendData, 5000, url);
}

// This function gets called whenever a community name is 
// selected in the unserved taxi bookings trend dropdown box.
function community_selection_unserved_trend_onclick() {
	var select = document.getElementById("community-for-unserved-trend");
	// Get the current community name that is selected in the dropdown box.
	var currentValueSelected = select.value;
	
	// If there is no change in the selected community, simply return back.
	if(currentValueSelected == communityIdForUnservedTrend) {
		return;
	}
	
	// Let us set the new community name selected by the user which will be
	// picked up by the XHR timer method below.
	communityIdForUnservedTrend = currentValueSelected;
}

// This function is a timer driven one.
function loadUnservedTaxiBookingsTrendData(url) {	
	// Retreive data from the WebClientRequestHandler operator in the 
	// TaxiMetrics IBM Streams application.	
	//
	// Only when there is a community name selected by the user, we can perform this.
	if(communityIdForUnservedTrend != "") {
		//  Add the Community Name as a query string parameter.
		var newUrl = url + "&communityId=" + communityIdForUnservedTrend;
		// Construct HTTP request and send 
		var xhr = new XMLHttpRequest();
		xhr.open("GET", newUrl, true);
		
		xhr.onreadystatechange = function() {
			// When we get the response back, update the visuals on this page.
			if (xhr.readyState == 4 && xhr.status == 200) {
				// Second argument to this function indicates which type of trend graph is needed.
				// 1 = New Taxi Bookings Trend Graph
				// 2 = Unserved Taxi Bookings Trend Graph
				updateTheTrendGraph(xhr.responseText, 2);
			 }   				 
		}
				
		xhr.send(null);
	}	

	// Refresh data every x seconds.
	var timeoutID = setTimeout(loadUnservedTaxiBookingsTrendData, 5000, url);
}

// This function will update the given trend graph.
// Second argument to this function indicates which type of trend graph is needed.
// 1 = New Taxi Bookings Trend Graph
// 2 = Unserved Taxi Bookings Trend Graph
// Reference: https://www.d3-graph-gallery.com/graph/line_basic.html
// https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915
function updateTheTrendGraph(responseText, trendType) {
	var id = "";
	var trend_line_class = "";
	var response;
	
	if(trendType == 1) {
		id = "new-bookings-trend";
		trend_line_class = "new-trend-line";
	} else {
		id = "unserved-bookings-trend";
		trend_line_class = "unserved-trend-line";
	}
	
	try {
		// From the response data received from the server-side, let us
		// create an array of objects with two members: time : "07:45:34", value : 78
		response = JSON.parse(responseText);
	} catch (ex) {
		alert("updateTheTrendGraph: A non-JSON message was received from the server-->" +
			responseText);
		return;
	}
	
	var data = [];
	
	for(var i = 0; i < response.time.length; i++) {
		data.push(
			// Append a JSON object into the array.
			{ 
				// For using date or time fields as labels in the graph axis, that data 
				// must be made available in d3.js date/time format and not as a plain string.
				"time" : d3.timeParse("%H:%M:%S")(response.time[i]),
				"value" : (trendType == 1 ? response.currentNew[i] : response.unserved[i])
			}
        );	
	}
		
	document.getElementById(id).innerHTML = "";
	// Set the dimensions and margins of the graph.
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
		width = 890 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;
    
    // Set the ranges for x axis and y axis.
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// Define the line.
	var valueline = d3.line()
		.x(function(d) { return x(d.time); })
		.y(function(d) { return y(d.value); });

	// Append the svg obgect to the parent container.
	// Append a 'group' element to 'svg'.
	// Move the 'group' element to the top left margin
	var svg = d3.select("#" + id).append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.time; }));
	y.domain([0, d3.max(data, function(d) { return d.value; })]);          

	// Add the valueline path.
	svg.append("path")
	.data([data])
	.attr("class", trend_line_class)
	.attr("d", valueline);

	// Add the X Axis
	svg.append("g")
	.attr("class", "trend-axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x)
	.tickFormat(d3.timeFormat("%H:%M")))
	.selectAll("text")	
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	.attr("transform", "rotate(-65)");

	// Add the Y Axis
	svg.append("g")
	.attr("class", "axis")
	.call(d3.axisLeft(y));
}
// ======== END OF CREATING AND UPDATING THE TAXI BOOKINGS METRICS TREND ======== 
// ============ END OF TAXI TAXI BOOKINGS PAGE LOGIC ============
