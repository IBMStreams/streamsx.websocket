// Copyright (C) 2020 International Business Machines Corporation.
// All Rights Reserved 
//
// ============ START OF SELECT COMMUNITY PAGE LOGIC ============
// This function gets called when the "Community Selection" form page is loaded.
function community_selection_onload() {
	// By default, let us disable the Confirm button.
	document.getElementById("registerSelection").disabled = true;
	document.getElementById("registerSelection").className = "registerSelectionInactive";
}

// This function gets called when the "Monitoring Interval" slider changes its value from user input.
function monitoring_interval_oninput() {
	// Upate the label for the monitoring interval slider with a new value.
	document.getElementById("monitoringIntervalLabel").innerHTML = "Monitor every " + 
		document.getElementById("monitoringInterval").value + " minute(s):";
}

// This function gets called when the "Community Selection" list box is clicked.
function community_selection_onclick() {
	// We can allow selection or deselection in the community listbox only if
	// the current selection is either None or other Community names.
	// If current selection is based on district names, user can only
	// continue with district selection or deselection for now.
	var currentSelection = document.getElementById("currentSelection").value;

	if (currentSelection.startsWith("None") == false && 
		currentSelection.startsWith("Communities: ") == false) {
		alert("Taxi monitoring is currently being done based on district name(s). " +
			"Community name(s) can be selected only after you stop monitoring " +
			"the currently selected district name(s).");
			
		// If user selected any entry in the communities listbox, let us nullify that.
		document.getElementById("community").selectedIndex = -1;
		return;
	}
	
	// Get the currently selected index in the list box.
	var idx = document.getElementById("community").selectedIndex;
	
	if (idx != -1) {
		// A selection is made in the communities list box.
		// So, we can't allow any selection in the districts list box.
		// Let us deselect anything that is selected in the districts.
		document.getElementById("district").selectedIndex = -1;
		
		var startMonitoring = false;
		var stopMonitoring = false;
		
		// Check if start or stop monitoring radio button is selected.
		startMonitoring = document.getElementById("startMonitoring").checked;
		stopMonitoring = document.getElementById("stopMonitoring").checked;
		
		if(startMonitoring == true || stopMonitoring == true) {
			// We can activate the "Confirm" button now.
			document.getElementById("registerSelection").disabled = false;
			document.getElementById("registerSelection").className = "registerSelectionActive";
		} else {
			document.getElementById("registerSelection").disabled = true;
			document.getElementById("registerSelection").className = "registerSelectionInactive";
		}
	} else {
		// There is no item selected in the communities list box at this time.
		// If that is the case with the districts list box as well, we can deactivate the "Confirm" button.
		var idx2 = document.getElementById("district").selectedIndex;
		
		if (idx2 == -1) {
			document.getElementById("registerSelection").disabled = true;
			document.getElementById("registerSelection").className = "registerSelectionInactive";
		}
	}
}

// This function gets called when the "District Selection" list box is clicked.
function district_selection_onclick() {
	// We can allow selection or deselection in the district listbox only if
	// the current selection is either None or other District names.
	// If current selection is based on community names, user can only
	// continue with community selection or deselection for now.
	var currentSelection = document.getElementById("currentSelection").value;

	if (currentSelection.startsWith("None") == false && 
		currentSelection.startsWith("Districts: ") == false) {
		alert("Taxi monitoring is currently being done based on community name(s). " +
			"District name(s) can be selected only after you stop monitoring " +
			"the currently selected community name(s).");
			
		// If user selected any entry in the communities listbox, let us nullify that.
		document.getElementById("district").selectedIndex = -1;
		return;
	}

	// Get the currently selected index in the list box.
	var idx = document.getElementById("district").selectedIndex;
	
	if (idx != -1) {
		// A selection is made in the district list box.
		// So, we can't allow any selection in the communities list box.
		// Let us deselect anything that is selected in the communities.
		document.getElementById("community").selectedIndex = -1;
		
		var startMonitoring = false;
		var stopMonitoring = false;
		
		// Check if start or stop monitoring radio button is selected.
		startMonitoring = document.getElementById("startMonitoring").checked;
		stopMonitoring = document.getElementById("stopMonitoring").checked;
		
		if(startMonitoring == true || stopMonitoring == true) {
			// We can activate the "Confirm" button now.
			document.getElementById("registerSelection").disabled = false;
			document.getElementById("registerSelection").className = "registerSelectionActive";
		} else {
			document.getElementById("registerSelection").disabled = true;
			document.getElementById("registerSelection").className = "registerSelectionInactive";
		}
	} else {
		// There is no item selected in the districts list box at this time.
		// If that is the case with the districts list box as well, we can deactivate the "Confirm" button.
		var idx2 = document.getElementById("community").selectedIndex;
		
		if (idx2 == -1) {
			document.getElementById("registerSelection").disabled = true;
			document.getElementById("registerSelection").className = "registerSelectionInactive";
		}
	}
}

// This function gets called when the "Start or Stop Monitoring" radio button is clicked.
function start_stop_monitoring_onclick() {
	// We can activate the Confirm button if a selection is made either
	// in the communities or districts list box.
	var idx1 = document.getElementById("community").selectedIndex;
	var idx2 = document.getElementById("district").selectedIndex;
	
	if (idx1 != -1 || idx2 != -1) {
		document.getElementById("registerSelection").disabled = false;
		document.getElementById("registerSelection").className = "registerSelectionActive";
	} else {
		document.getElementById("registerSelection").disabled = true;
		document.getElementById("registerSelection").className = "registerSelectionInactive";
	}
}

// This function gets called when the "Confirm Commmunity Selection" button is clicked.
function register_selection_onclick() {
	// Before proceeding further, ask the user to confirm it one more time.
	var r = confirm("Do you want to proceed with your selection?");

	if (r == false) {
		return;
	}

	// Let us create a POST message to be sent to the remote server.
	var params = "command=CommunityAndDistrictSelection";
	
	var listBoxId = "";
	var listBoxLength = 0;
		
	// Collect all the items selected either in the 
	// communities or the districts list box.
	if (document.getElementById("community").selectedIndex != -1) {
		listBoxId = "community";
		// Get the total number of entries in this list box.
		listBoxLength = document.getElementById("community").length;
		
		// Get the user selection about start or stop monitoring.
		if (document.getElementById("startMonitoring").checked == true) {
			// 1 = Start Monitoring based on community.
			params += "&startStopMonitoring=1";
		} else {
			// 3 = Stop Monitoring based on community.
			params += "&startStopMonitoring=3";
		}
	} else {
		listBoxId = "district";
		// Get the total number of entries in this list box.
		listBoxLength = document.getElementById("district").length;	
		
		// Get the user selection about start or stop monitoring.
		if (document.getElementById("startMonitoring").checked == true) {
			// 2 = Start Monitoring based on district.
			params += "&startStopMonitoring=2";
		} else {
			// 4 = Stop Monitoring based on district.
			params += "&startStopMonitoring=4";
		}
	}

	// Get all the selected items from a given list box.	
	var userSelection = "";
	var totalItemsSelected = 0;
	var element = document.getElementById(listBoxId); 
	var options = element && element.options;
	var opt;	
	
	// https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box/5866331
	for (var i=0, len=options.length; i<len; i++) {
		// Every entry in the multiselect list box has two things.
		// First one is the user defined value for that entry (opt.value) and 
		// the second one is the name of that entry displayed in the list box (opt.text).
		opt = options[i];

		if (opt.selected) {
			// If this option is selected, then we will collect it.
			if (userSelection != "") {
				userSelection += ",";
			}
			
			userSelection += opt.value;
			totalItemsSelected++;			
		}
	}	
	
	// If all the items in a listbox are selected, we can send "ALL".
	if(totalItemsSelected == listBoxLength) {
		params += "&userSelection=ALL"; 
	} else {
		params += "&userSelection=" + userSelection;
	}
	
	// Get the monitoring interval value.
	params += "&monitoringInterval=" + 
		document.getElementById("monitoringInterval").value;
	
	// alert("params=" + params);

	// We now have everything we need to send it to the IBM Streams server side application.	
	// https://stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
	// Send it to the remote server via XHR (XML HTTP Request).
	var xhr = new XMLHttpRequest();
	// Post it to the server by pointing to its configured context root.
	// Following Javascript API will give us the protocol://host:port.
	var url = window.location.origin + "/viz";
	xhr.open('POST', url, true);

	// Send the proper header information along with the request
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	// Call a function when the state changes.
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200) {
			document.getElementById("main").innerHTML = xhr.responseText;
    	}
	}
	
	xhr.send(params);
}
// ============ END OF SELECT COMMUNITY PAGE LOGIC ============
