Changes
=======
## v1.1.7:
* Oct/20/2023
* Added new logic in the HttpPost operator to send an output tuple with details about the failure of all retry attempts along with HTTP status code and the target URL.

## v1.1.6:
* Oct/18/2023
* Added new logic in the HttpPost operator to retry PUT, POST or GET operation in case of both for Java exceptions and for a user configured list of HTTP status codes such as 503, 408, 504 etc.
* Added a HttpPost operator parameter to control which HTTP status codes will trigger retry: httpStatusCodesThatRequireRetry

## v1.1.5:
* Oct/04/2023
* Added new logic in the HttpPost operator to retry PUT, POST or GET operation in case of an error.
* Added two HttpPost operator parameters to control retry: maxRetryAttempts, waitTimeBetweenRetry
* Upgraded the HTTP Client jar files from HTTPClient-4.5.12 to HTTPClient-4.5.14.

## v1.1.4:
* Mar/20/2023
* Made the second output port of the WebSocketSendReceive operator optional.
* Made the metrics counters for the three WebSocket operators to be reset to zero at a user defined time interval via a new optional parameter named metricsResetInterval.

## v1.1.3:
* Feb/01/2023
* Added a code fix to try/catch the invalid state exception thrown from within the websocketpp send method when sending data to a remote client or server and at that exact time that remote client or server closing its WebSocket connection due to that client or server application being shut down or for any other reason. This change was done for all the three WebSocket operators in this toolkit.
* Optimized all the reference examples that use the WebSocketSendReceive operator to ignore if a tuple arrives with empty data to be sent to a remote WebSocket endpoint.

## v1.1.2:
* Jan/30/2023
* Optimized all the reference examples that use the WebSocketSendReceive operator to queue the incoming tuples in a map instead of a list to improve the data sending performance.

## v1.1.1:
* Jan/29/2023
* Fixed a major network performance impact in the ws_data_sender method of all the three WebSocket operators by changing it from a long running thread loop method into a non-thread one shot callable method that can send the text and/or binary data item via active WebSocket connection(s) and return back to the caller immediately after that..
* Added a new tcpNoDelay parameter and a low level socket init handler to all the three WebSocket operators so that the user can turn on or off TCP_NODELAY to control Nagle's algorithm. This new feature will work only with a websocketpp library version 0.8.3 and higher.
* Added a few more metrics for the three WebSocket operators to view send and receive performance numbers in terms of data transfer time and payload size.
* Enhanced the operator documentation with more details about the above-mentioned changes.

## v1.1.0:
* Nov/19/2021
* Fixed a problem in the HttpPost operator where the HTTP GET query string not getting sent to the remote server.

## v1.0.9:
* Oct/04/2020
* Added a new example CustomVisualization that shows how to do real-time custom dashboarding of the Streams application results with the help of the WebSocketSource operator.

## v1.0.8:
* Sep/22/2020
* Added logic to stop the Boost ASIO run loop on operator shutdown in order for an immediate closure of the TLS and non-TLS server ports in the Source and Sink operators.
* Added an optional tlsCipherWhitelist parameter in the Source and Sink operators for the user to specify approved TLS/SSL ciphers thereby avoiding the use of any security vulnerable ciphers.
* Added logic in the HttpPost operator to emit an output tuple even when the tuple processing logic encounters an exception.

## v1.0.7:
* Sep/01/2020
* Made the WebSocketSource operator friendlier to browser-based client applications so that they can do HTTP GET for fetching files such as html, css, js, png, gif, favicon etc.
* Added two new custom output functions in the WebSocketSource operator: getFullUrlBeingAccessedByTheClient, getFileNameInUrlForHttpGet
* In the HTTP response back to the client mode, removed setting the Content-Type header if it is already set by the underlying application logic.
* Support for persistent (Keep-Alive) HTTP connections is new in this release.
* Added a "Connection: Close" response header for non-persistent HTTP connections.
* Added a new parameter `allowPersistentHttpConnections` for the WebSocketSource operator.
* Added a new parameter `certificatePassword` for the WebSocketSource, WebSocketSendReceive and WebSocketSink operators to specify the PEM private key pass phrase.
* Restructured the HttpPost operator code to create either persistent or non-persistent HTTP connection to the server based on the operator configuration.
* Added a new parameter `createPersistentHttpConnection` for the HttpPost operator.

## v1.0.6:
* Jun/30/2020
* Changed the toolkit name from streamsx.cppws to streamsx.websocket.
* Changed the toolkit namespace from com.ibm.streamsx.cppws to com.ibm.streamsx.websocket.
* Changed the toolkit source code, examples, scripts, documentation etc. to reflect that change.

## v1.0.5:
* Jun/22/2020
* A WebSocket server endpoint can now have zero or more URL context paths.
* When data exchange via HTTP is enabled, clients can send data using HTTP GET, PUT and POST.
* WebSocketSourceTester and HttpPostTester examples have been updated to demonstrate HTTP GET/PUT/POST.
* All the server-based examples have been updated to demonstrate having multiple URL context paths.
* A new build.xml file has been added at the toolkit's top-level directory to automate the downloading of all the external dependencies such as C++ Boost, websocketpp etc. and then the building of the toolkit to make it ready for use. All that a user needs to do is to download and extract an official release version of this toolkit from the [IBMStreams GitHub](https://github.com/IBMStreams/streamsx.websocket/releases) and then run `ant clean-total` followed by `ant all` followed by `ant download-clean`.
* C++ Boost and websocketpp include and lib directories have been moved up by one level. This will simplify the customization done in IBM Streams Studio build configuration's additional SPL compiler options panel. Please read the toolkit documentation for more details.

## v1.0.4:
* Jun/07/2020
* This version is upgraded to use the C++ Boost v1.73.0 and websocketpp v0.8.2.
* Server-based WebSocketSource operator can now receive both text and binary data from the HTTP clients.
* WebSocketSource allows a new optional roundtripping feature using which text or binary responses can be sent back to the WebSocket and HTTP clients after processing/analyzing the text or binary data received from those clients.
* A new client-based WebSocketSendReceive operator introduced in this version can be used for establishing a connection to a remote WebSocket server and then start exchanging text or binary data in both directions i.e. send data to the remote server as well as receive data from the remote server.
* A new server-based WebSocketSink operator introduced in this version can be used to accept connection(s) from one or more remote WebSocket clients and then one-way text or binary messages can be sent (broadcast) from this operator to all the connected clients.
* Server-based WebSocketSource and WebSocketSink operators allow an optional parameter to provide a client whitelist to accept connections only from certain client IP addresses.
* Server-based WebSocketSource and WebSocketSink operators allow an optional input port to dynamically update the client whitelist after those operators have already been started and began processing tuples.
* HttpPost operator is redesigned to post/send text or binary data.
* All the four operators available in this toolkit can now accept their own TLS private certificate file as well as the remote party's TLS public certificate and optionally perform two-way (mutual) client or server TLS certificate verification/authentication.
* New comprehensive examples are introduced in this version where each example showcases the full power and features of all the four operators available in this toolkit.
* Many new operator metrics and output functions for all the four operators are added in this version.

## v1.0.3:
* Apr/01/2020
* Changed the boost asio server to use tlsv1.2.
* Changed the WSClientDataSimulator to use tlsv1.2.
* Changed the WSClientDataSimulator to reset the most recently received message after the application queries that value.

## v1.0.2:
* Mar/26/2020
* Added a contentType parameter to the utility operator HttpPost.
* Added necessary logic to have the HTTP POST message body to conform to the query string format when the content type is application/x-www-form-urlencoded.
* Made necessary changes in the HttpPostTester example application.

## v1.0.1:
* Mar/25/2020
* Added support for receiving messages via HTTP(S) POST in the WebSocketSource operator.
* Added an utility operator HttpPost to test the feature mentioned above.
* Added a new HttpPostTester example application.

## v1.0.0:
* Mar/05/2020
* Very first release of this toolkit that was tested to support receiving of text or binary data from remote client applications via WebSocket. In this release, this toolkit provides a single C++ operator named WebSocketSource.
