#!/usr/bin/bash
#
#--------------------------------------------------------------------
# First created on: May/10/2020
# Last modified on: Jun/07/2020
#
# This is a script that I used to test the WebSocketSendReceive operator in
# our IBM Streams lab in New York. You can make minor changes here and
# use it in your test environment. It allows to run the WebSocketSendReceiveTester
# application along with a test server application running on 
# different IBM Streams instances. That will test the WebSocketSendReceive 
# operator's capabilities.
#
# IMPORTANT
# ---------
# Before using this script, you must first build all the examples provided in
# the samples sub-directory of this toolkit. You should first run 'make' from 
# every example directory to complete the build process and then you can use 
# this particular script by customizing it to suit your IBM Streams environment.
#--------------------------------------------------------------------
#
# Start the test server application (WebSocketServerApp) on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSendReceiveTester/output/com.ibm.streamsx.cppws.sample.WebSocketServerApp.sab -P nonTlsEndpointNeeded=true -P clientWhitelist='["10.6.33.13", "10.6.33.17", "10.6.100.124", "10.6.100.168", "10.6.100.169", "10.6.100.170", "10.6.100.171"]' -P urlContextPath=MyServices/Banking/Deposit

# Wait for 10 seconds
echo Sleeping for 10 seconds before starting a copy of the WebSocketSendReceiveTester application...
sleep 10

# Start a copy of the WebSocketSendReceiveTester on instance i2
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSendReceiveTester/output/com.ibm.streamsx.cppws.sample.WebSocketSendReceiveTester.sab -P url=wss://b0513:8443/MyServices/Banking/Deposit
