#!/usr/bin/bash
#
#--------------------------------------------------------------------
# First created on: Apr/23/2020
# Last modified on: Oct/18/2023
#
# This is a script that I used to test the HttpPost operator in
# our IBM Streams lab in New York. You can make minor changes here and
# use it in your test environment. It allows to run the HttpPostTester
# application along with a WebSocket server application running on a 
# different IBM Streams instance. That will test the HttpPost operator's 
# capabilities to send and receive text/binary data to/from the WebSocketSource.
#
# IMPORTANT
# ---------
# Before using this script, you must first build all the examples provided in
# the samples sub-directory of this toolkit. You should first run 'make' from 
# every example directory to complete the build process and then you can use 
# this particular script by customizing it to suit your IBM Streams test environment.
#--------------------------------------------------------------------
#
echo Starting the WebSocketSourceTester.
# Start the WebSocketSourceTester on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceTester/output/com.ibm.streamsx.websocket.sample.WebSocketSourceTester.sab -P certificatePassword=  -P nonTlsEndpointNeeded=true -P allowHttpPost=true -P clientWhitelist='["10.6.33.13", "10.6.33.17", "10.6.100.124", "10.6.100.168", "10.6.100.169", "10.6.100.170", "10.6.100.171"]' -P numberOfMessagesToReceiveBeforeAnAck=100 -P urlContextPath='["MyServices/Banking/Deposit", "Peace/To/The/World", ""]'

# Wait for 10 seconds
echo Sleeping for 10 seconds before starting the HttpPostTester application...
sleep 10

echo Starting the HttpPostTester.
# Start a Java based HTTP POST client application on instance i2
streamtool submitjob -d d1 -i i2 ~/workspace32/HttpPostTester/output/com.ibm.streamsx.websocket.sample.HttpPostTester.sab -P Url=http://b0513:8080/MyServices/Banking/Deposit -P NumSenders=1 -P createPersistentHttpConnection=true -P LogHttpPostActions=true -P MaxMessageRate=50.0 -P MessageBatchingTime=6.0 -P httpTimeout=30 -P delayBetweenConsecutiveHttpPosts=0 -P tlsAcceptAllCertificates=true -P maxRetryAttempts=5 -P waitTimeBetweenRetry=5000 -P httpStatusCodesThatRequireRetry="503, 408, 504"
