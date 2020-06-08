#!/usr/bin/bash
#
#--------------------------------------------------------------------
# First created on: May/23/2020
# Last modified on: Jun/07/2020
#
# This is a script that I used to test the WebSocketSource operator in
# our IBM Streams lab in New York. You can make minor changes here and
# use it in your test environment. It allows to run the WebSocketSourceWithResponseTester
# application along with 24 other test client applications running on 
# three different IBM Streams instances. That will test the WebSocketSource 
# operator in a scalable way.
#
# IMPORTANT
# ---------
# Before using this script, you must first build all the examples provided in
# the samples sub-directory of this toolkit. You should first run 'make' from 
# every example directory to complete the build process and then you can use 
# this particular script by customizing it to suit your IBM Streams environment.
#--------------------------------------------------------------------
#
# Start the WebSocketSourceWithResponseTester on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketSourceWithResponseTester.sab -P maxClientConnectionsAllowed=64 -P nonTlsEndpointNeeded=true -P allowHttpPost=true -P clientWhitelist='["10.6.33.13", "10.6.33.17", "10.6.100.124", "10.6.100.168", "10.6.100.169", "10.6.100.170", "10.6.100.171"]' -P urlContextPath=MyServices/Banking/Deposit

# Wait for 10 seconds
echo Sleeping for 10 seconds before starting multiple copies of the client application...
sleep 10

# Start 6 clients on instance i1
# [Please note that this application offers many submission time parameters. We are using only a few here.]
streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i1 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

# Start 6 clients on instance i2
streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i2 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

# Start 12 clients on instance i3
streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=https://b0513:8443/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true

streamtool submitjob -d d1 -i i3 ~/workspace32/WebSocketSourceWithResponseTester/output/com.ibm.streamsx.cppws.sample.WebSocketHttpClientApp.sab -P url=http://b0513:8080/MyServices/Banking/Deposit -P tlsAcceptAllCertificates=true