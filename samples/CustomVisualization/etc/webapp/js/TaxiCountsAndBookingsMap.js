// Copyright (C) 2020 International Business Machines Corporation.
// All Rights Reserved 
//
// ============ START OF TAXI COUNTS AND BOOKINGS MAP PAGE LOGIC ============
// This function gets called when the taxi counts map page is loaded.
function taxi_counts_map_onload() {
	// Depending on which menu tab is clicked, let us initialize accordingly.
	var url = window.location.href + "?request=SendTaxiCountMetrics&popup=true";
	initialize(url);
}

// This function gets called when the taxi bookings map page is loaded.
function taxi_bookings_map_onload() {
	// Depending on which menu tab is clicked, let us initialize accordingly.
	var url = window.location.href + "?request=SendTaxiBookingMetrics&popup=true";	
	initialize(url);
}

var map;
var markers;
var vectors;
var center;
var taxiMetricsMapXhrUrl;

// map to keep track of markers in the map
var markerMap = {};

// map to keep track of popup in the map
var popupMap = {};

// map to keep track of polygons added in the map
var polygonMap = {};

function getParams() {
	var url = taxiMetricsMapXhrUrl;
	// var url = window.location.search;
	var params = {};
	var pairs = url.substring(url.indexOf('?') + 1).split('&');
	for ( var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	}
	return params;
}

function isShowPopups() {
	var params = getParams();
	var show = params["popup"];
	
	if(show == "true")
		return true;

	return false;
}

function getPeriod() {
	var params = getParams();
	var period = params["period"];
	
	if(period != null)
		return period;

	return 5000;
}

function getDataUrl() {
	var params = getParams();
	var dataUrl = params["data"];
	
	return dataUrl;
}	

function initialize(url) {
	// Save this URL for getting the query params later.
	taxiMetricsMapXhrUrl = url;
	var map_options = {
		div : this.mapDiv,
		allOverlays : false,
		maxExtent : this.mapExtent,
		controls : [ new OpenLayers.Control.DragPan(),
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.ScaleLine(),
				new OpenLayers.Control.MousePosition(),
				new OpenLayers.Control.LayerSwitcher() ]
	};
	map = new OpenLayers.Map('map-canvas', map_options);
	map.addLayer(new OpenLayers.Layer.OSM());

	// create marker layer
	markers = new OpenLayers.Layer.Markers("Markers");
	map.addLayer(markers);				
	
	// create polygon layer
	vectors = new OpenLayers.Layer.Vector("Polygon", {
	    styleMap: new OpenLayers.StyleMap({
	        "default": new OpenLayers.Style({
	            fillColor: "#33CC00",
	            strokeColor: "#000000",
	            strokeWidth: 1
	        })
	    })
	});
	map.addLayer(vectors);
	
	// retrieve data from the IBM Streams application.
	loadData(url);
}									
					
function loadData(url) {	
	// Retreive data from the WebClientRequestHandler operator in the 
	// TaxiMetrics IBM Streams application.					
	//
	// construct HTTP request and send 
	var markerReq = new XMLHttpRequest();
	markerReq.open("GET", url, true);
	
	markerReq.onreadystatechange = function() {
		// when we get the response back, update marker and polygon locations
		if (markerReq.readyState == 4 && markerReq.status == 200) {
			 updateMap(markerReq.responseText);
		 }   				 
	}	
			
	markerReq.send(null);			

	// refresh data every x second based on period parameter
	var timeoutID = setTimeout(loadData, getPeriod(), url);
}

function addPopup(object, lngLat){
	// close the previous popup before creating a new one
	var prevPopup = popupMap[object.id]
	if (prevPopup != null) {
		map.removePopup(prevPopup);
	}

	// add popup
	if (isShowPopups() && object.note.length > 0) {
		var contentString = '<div id="content" style="width:100px">'
				+ '<div id="siteNotice">'
				+ '</div>'
				+ '<div id="bodyContent" style="width:100px;font-size:small">'
				+ '<b><u>'
				+ object.category
				+ '</u></b><br />'
				+ object.note
				+ '</div>' + '</div>';

		/*
		var popup = new OpenLayers.Popup.FramedCloud(object.id,
				lngLat, null, contentString, null, false);
		*/

		// I added a close box option by setting it to true.
		var popup = new OpenLayers.Popup.FramedCloud(object.id,
			lngLat, null, contentString, null, true);		
		
		popup.panMapIfOutOfView = false;

		map.addPopup(popup);
		popupMap[object.id] = popup;
	}
}

function getIcon(markerType) {

	if (markerType=='GREEN')
		return 'marker-green.png';
	if (markerType=='GOLD')
		return 'marker-gold.png';
	if (markerType=='RED')
		return 'marker-red.png';				
}

function updateMap(response) {
	try {
		// IBM Streams server-side application retuns tuples information as JSON.
		// Let us parse the JSON into a list of objects to process.
		var allObjects = JSON.parse(response);
				
		// for each object, update marker or poly accordingly.						
		for (var i=0; i<allObjects.length; i++) {
			var markerID = allObjects[i].id;
			var wkt = allObjects[i].wkt;
			var markerType = allObjects[i].markerType;
			var updateAction = allObjects[i].updateAction;
			
			// construct WKT formatter to parse out geometry from tuples
			var formatter = new OpenLayers.Format.WKT();
	
			// parse wkt string from tuples
			var feature = formatter.read(wkt);
			
			// transform from WGS 1984  to Spherical Mercator Projection
			var transformedFeature = feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
			
			var vertices = transformedFeature.getVertices();
			
			// this is a point, number of vertices must be 1
			if (vertices.length == 1) {
			
				// if this is a point, remove any existing marker with same ID and add new marker
				
				// create longlat object for marker
				var myLongLat = new OpenLayers.LonLat(transformedFeature.x, transformedFeature.y);				
	
				var marker;
				
				// check if marker exists, if so remove
				if (markerID in markerMap) {
					marker = markerMap[markerID];
					markers.removeMarker(marker);
				}

				// if updateAction > 1, that means we need to add marker back
				// otherwise simply remove marker
				if (updateAction > 0)
				{
					var icon = new OpenLayers.Icon(getIcon(markerType));

					var marker = new OpenLayers.Marker(myLongLat, icon.clone());
					markers.addMarker(marker);

					// save marker to maperMap so we can get it back in the next update
					markerMap[markerID] = marker;		
				
					// if this is the first point, center the map to the point.
					if (center == null)
					{
						center = myLongLat;
						map.setCenter(center, 15);
					}
				
					// add popup for marker
					addPopup(allObjects[i], myLongLat);
				}
			}
			// else assume it's a polygon
			else {
				
				// remove existing polygon from map if one with same markerId exist
				if (markerID in polygonMap) {
					var featureToRemove = polygonMap[markerID];
					vectors.removeFeatures([featureToRemove]);
				}
			
				// add new polygon back to the map
				if (updateAction > 0)
				{
					var poly = new OpenLayers.Geometry.LinearRing(vertices);
					var style = {strokeColor: "#ff3300",strokeOpacity: 1,strokeWidth: 2,fillColor: "#FF9966",fillOpacity: 0.1};
					var polygonFeature = new OpenLayers.Feature.Vector(poly, null, style);						
					vectors.addFeatures([polygonFeature]);
					polygonMap[markerID]=polygonFeature;
				}
			}
			
		}
	}
	catch (e) {
		alert("updateMap: A non-JSON message was received from the server-->" +
			response);
		return;
	}
}
// ============ END OF TAXI COUNTS AND BOOKINGS MAP PAGE LOGIC ============
