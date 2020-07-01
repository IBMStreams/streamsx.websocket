#!/usr/bin/bash
#
#--------------------------------------------------------------------
# First created on: May/15/2020
# Last modified on: Jun/29/2020
#
# This is a script that I used to test the WebSocketSink operator in
# our IBM Streams lab in New York. You can make minor changes here and
# use it in your test environment. It allows to run the WebSocketSinkTester
# application along with 24 other test client applications running on 
# three different IBM Streams instances. That will test the WebSocketSink 
# operator in a scalable way.
#
# IMPORTANT
# ---------
# Before using this script, you must first build all the examples provided in
# the samples sub-directory of this toolkit. You should first run 'make' from 
# every example directory to complete the build process and then you can use 
# this particular script by customizing it to suit your IBM Streams test environment.
#--------------------------------------------------------------------
#
echo Starting 6 clients on Streams instance i1.
# Start 6 clients on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/MyServices/Banking/Deposit

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/MyServices/Banking/Deposit

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/MyServices/Banking/Deposit

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/MyServices/Banking/Deposit

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/MyServices/Banking/Deposit

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/MyServices/Banking/Deposit

echo Starting 6 clients on Streams instance i2.
# Start 6 clients on instance i2
streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443/

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080/

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080/

echo Starting 12 clients on Streams instance i3.
# Start 12 clients on instance i3
streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=wss://b0513:8443/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=ws://b0513:8080/Test/This/Context

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443/Work/Is/Worship

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443/Work/Is/Worship

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=https://b0513:8443/Work/Is/Worship

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080/Work/Is/Worship

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080/Work/Is/Worship

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketClientApp.sab -P url=http://b0513:8080/Work/Is/Worship

# Wait for 20 seconds
echo Sleeping for 20 seconds before starting the WebSocketSinkTester application...
sleep 20

echo Starting WebSocketSinkTester.
# Start the WebSocketSink server on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSinkTester/output/com.ibm.streamsx.websocket.sample.WebSocketSinkTester.sab -P nonTlsEndpointNeeded=true -P clientWhitelist='["10.6.33.13", "10.6.33.17", "10.6.100.124", "10.6.100.168", "10.6.100.169", "10.6.100.170", "10.6.100.171"]' -P urlContextPath='["MyServices/Banking/Deposit", "", "Test/This/Context", "Work/Is/Worship"]'
