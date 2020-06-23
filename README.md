# C++ WebSocket toolkit for IBM Streams

## Purpose
The streamsx.cppws toolkit provides the following C++ and Java operators that can help you to receive text or binary data from the remote client and server-based applications via WebSocket and HTTP (OR) send text or binary data from your IBM Streams applications to external client and server-based applications via WebSocket and HTTP.

1. WebSocketSource (server-based)
2. WebSocketSendReceive (client-based)
3. WebSocketSink (server-based)
4. HttpPost (client-based) [To send/post text and binary data via HTTP(S)]

**WebSocketSource** by default is a source operator that can be used to receive text or binary data from multiple client applications. This operator supports message reception via both WebSocket and HTTP on plain as well as secure TLS endpoints. This source operator can optionally be turned into an analytic operator to process/analyze the text or binary data received from the remote clients and then send back a text or binary response back to that same WebSocket or HTTP client. The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams applications to tailor the data processing logic based on which group(s) of remote clients sent the data. Thus, users will get a five-in-one benefit (WebSocket, HTTP, plain, secure and response-ready) from this operator. It can be configured to start a plain or secure WebSocket or HTTP endpoint for the remote clients to connect and start sending and (optionally) receiving data. This is Receive-only with an option to make it a Receive-and-Send operator. This operator promotes the Many-To-One data access pattern.

**WebSocketSendReceive** is an analytic operator that can be used to initiate a connection to an external WebSocket server-based application in order to send and receive text or binary data via that connection. This is Send-and-Receive to/from a single server-based remote WebSocket application. This operator promotes One-To-One data access pattern.

**WebSocketSink** is a sink operator that can be used to send (broadcast) text or binary data to multiple clients. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect in order to start receiving data from this operator. The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams application logic to tailor which data items get sent to which group(s) of the remote clients. This is Send-only to multiple clients. This operator promotes the One-To-Many data access pattern.

**HttpPost** is a utility operator provided by this toolkit to test the optional HTTP(S) text or binary data reception feature available in the WebSocketSource operator. This utility operator can send text or binary data and receive text or binary data in response from the remote server. This operator allows clients to send data via HTTP GET, PUT and POST. If other application scenarios see a fit for this utility operator, they can also use it as needed. If you clone this toolkit from the IBMStreams GitHub, then you must build this toolkit via `ant all` and `ant download-clean` from this toolkit's top-level directory. 

In a Streams application, these operators can either be used together or independent of each other. 

## Documentation
1. The official toolkit documentation with extensive learning and operational details is available at this URL:
https://ibmstreams.github.io/streamsx.cppws/

2. A file named cppws-tech-brief.txt available at this toolkit's top-level directory also provides a good amount of information about what this toolkit does, how it can be built and how it can be used in the IBM Streams applications.

## Technical positioning of this toolkit
WebSocket, a computer communication protocol has been in commercial use since 2012 after it became an official IETF standard. It enables two-way (full duplex) communication between a client and a remote server over TCP with low overhead when compared to the other Web protocols such as HTTP or HTTPS. Another superb benefit of WebSocket is that it can be overlaid on top of HTTP or HTTPS by making the initial connection using HTTP or HTTPS and then upgrading that connection to a full duplex TCP connection to the standard port 80 or port 443 thereby being able to flow through the firewall.

At a very high level, this toolkit shares the same design goal as two other operators available in a different IBM Streams toolkit named com.ibm.streamsx.inetserver which provides two similar operators written in Java using a built-in Jetty web server. The com.ibm.streamsx.cppws provided operators are written using C++ by employing the most highly regarded C++ Boost library which is expected to use less CPU, memory and provide a better overall throughput with a good cost performance advantage.

The three data access patterns highlighted above as promoted by the operators in this toolkit can be explained via the following real-life analogies.

**Many to One**: On a happy occasion like birthday, many family members and friends send greeting messages to that one person who is enjoying the special day.
![MTO](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSourceTester/etc/mto.png)

**One to One**: In a performance evaluation meeting, a manager and an employee exchange information back and forth about the work accomplished. 
![OTO](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSendReceiveTester/etc/oto.png)

**One to Many**: In an annual meeting, a CEO gives data points about the company's business performance to the curiously listening shareholders.
![OTM](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSinkTester/etc/otm.png)

## Requirements
There are certain important requirements that need to be satisfied in order to use the IBM Streams cppws toolkit in Streams applications. Such requirements are explained below.

1. This toolkit uses WebSocket, HTTP to communicate with the remote client and/or server applications. 

2. On the IBM Streams application development machine (where the application code is compiled to create the application bundle), it is necessary to download and install the boost_1_73_0 as well as the websocketpp version 0.8.2. Please note that this is not needed on the Streams application execution machines. For the essential steps to meet this requirement, please refer to the above-mentioned documentation URL or a file named cppws-tech-brief.txt available in this toolkit's top-level directory.

3. It is necessary to create a self-signed or Root CA signed TLS/SSL certificate in PEM format and point to that certificate file at the time of starting the IBM Streams application that invokes the server-based WebSocketSource and WebSocketSink operators present in this toolkit. If you don't want to keep pointing to your TLS/SSL certificate file every time you start the IBM Streams application, you can also copy the full certificate file to your Streams application's `etc` directory as ws-server.pem and compile your application which will then be used by default. The other two client-based operators WebSocketSendReceive and HttpPost can optionally be pointed to their own TLS/SSL certificate at the time of getting invoked mainly for the purpose of performing client (mutual) authentication. All the four operators in this toolkit can also be pointed with the public certificate of their remote party in order to do trusted server or client (two-way) TLS certificate verification/authentication.

If you are comfortable with using a self-signed TLS/SSL certificate file in your environment, you can follow the instructions given in the following file that is shipped with this toolkit to create your own self-signed TLS/SSL certificate.

```
<YOUR_CPPWS_TOOLKIT_HOME>/samples/WebSocketSourceTester/etc/creating-a-self-signed-certificate.txt
```
A copy of the text file mentioned above is available in the `etc` directory of every example shipped with this toolkit. This file explains different procedures to create client/server-side private certificate as well as the public certificate to share with the remote party that is getting connected to or connected from. It also has more details about creating key store and trust store for C++ and Java client and server applications.

## Example usage of this toolkit inside a Streams application
Here is a code snippet that shows how to invoke the **WebSocketSource** operator available in this toolkit with a subset of supported features:

```
use com.ibm.streamsx.cppws.op::*;

// Receive text data or binary data or both from the
// remote WebSocket clients.
(stream<ReceivedData_t> WebSocketRxData as WSRD;
 stream<EndOfClientSessionSignal_t> EndOfClientSessionSignal as EOCSS) 
 as WebSocketDataReceiver = WebSocketSource() {
    logic
       state: {
          // Initialize the default TLS certificate file name if the 
          // user didn't provide his or her own.
          rstring _certificateFileName = ($certificateFileName != "") ?
             $certificateFileName : getThisToolkitDir() + "/etc/ws-server.pem";
       }
				
       param
          tlsPort: $tlsPort;
          certificateFileName: _certificateFileName;
          numberOfMessagesToReceiveBeforeAnAck: $numberOfMessagesToReceiveBeforeAnAck;
			
       // Get these values via custom output functions	provided by this operator.
       output
          // strData and/or blobData attributes will be automatically
          // assigned with values by the operator logic.
          // Other attributes can be assigned manually as done below.
          WSRD: clientSessionId = getClientSessionId(),
             totalTuplesSent = getTotalDataItemsReceived(),
             totalDataBytesReceived = getTotalDataBytesReceived();
}
```

A built-in example inside this toolkit can be compiled and launched with the default options as shown below:

```
cd   streamsx.cppws/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  com.ibm.streamsx.cppws.sample.WebSocketSourceTester.sab 
```

Following IBM Streams job submission command shows how to override the default values with your own as needed for the various options that are available:

```
cd   streamsx.cppws/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  com.ibm.streamsx.cppws.sample.WebSocketSourceTester.sab -P tlsPort=8443 -P certificateFileName=/tmp/mycert.pem -P initDelayBeforeReceivingData=7.0 -P ipv6Available=true -P numberOfMessagesToReceiveBeforeAnAck=23456 -P allowHttpPost=true
```

## Examples that showcase this toolkit's features
This toolkit ships with the following examples that can be used as reference applications. These examples showcase the full feature set of the WebSocketSource, WebSocketSendReceive, WebSocketSink and the HttpPost operators that are available within this toolkit. Every example below will have the client and server-side application needed to test it. All the examples went through extensive testing in the IBM Streams lab in New York and they include excellent code documentation in the source files to guide the application/solution development engineers. More details about these examples can be obtained from the official documentation for this toolkit.

* [WebSocketSourceTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSourceTester)
* [WebSocketSourceWithResponseTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSourceWithResponseTester)
* [WebSocketSendReceiveTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSendReceiveTester)
* [WebSocketSinkTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSinkTester)
* [HttpPostTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/HttpPostTester)

In the `etc` sub-directory of every example shown above, there is a shell script that can be used to run a given example with synthetic data and then verify the application behavior and the result. That shell script was originally written for running a given example in the IBM Streams lab in New York. It is easy to make minor changes in that shell script and use it in any other IBM Streams environment for running a given example.

There is also an example WebSocket C++ client application that can be run from a RHEL7 or CentOS7 machine to simulate high volume data traffic to be sent to the WebSocketSourceTester application. That example client application is available in the streamsx.cppws/samples/WebSocketSourceTester/WSClientDataSimulator directory.

## WHATS NEW

v1.0.5:
* Jun/22/2020
* A WebSocket server endpoint can now have zero or more URL context paths.
* When data exchange via HTTP is enabled, clients can send data using HTTP GET, PUT and POST.
* WebSocketSourceTester and HttpPostTester examples have been updated to demonstrate HTTP GET/PUT/POST.
* All the server-based examples have been updated to demonstrate having multiple URL context paths.
* A new build.xml file has been added at the toolkit's top-level directory to automate the downloading of all the external dependencies such as C++ Boost, websocketpp etc. and then the building of the toolkit to make it ready for use. All that a user needs to do is to download and extract an official release version of this toolkit from the [IBMStreams GitHub](https://github.com/IBMStreams/streamsx.cppws/releases) and then run `ant clean-total` followed by `ant all` followed by `ant download-clean`.
* C++ Boost and websocketpp include and lib directories have been moved up by one level. This will simplify the customization done in IBM Streams Studio build configuration's additional SPL compiler options panel. Please read the toolkit documentation for more details.

v1.0.4:
* Jun/07/2020
* This version is upgraded to use the C++ boost v1.73.0 and websocketpp v0.8.2.
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

v1.0.3:
* Apr/01/2020
* Changed the boost asio server to use tlsv1.2.
* Changed the WSClientDataSimulator to use tlsv1.2.
* Changed the WSClientDataSimulator to reset the most recently received message after the application queries that value.

v1.0.2:
* Mar/26/2020
* Added a contentType parameter to the utility operator HttpPost.
* Added necessary logic to have the HTTP POST message body to conform to the query string format when the content type is application/x-www-form-urlencoded.
* Made necessary changes in the HttpPostTester example application.

v1.0.1:
* Mar/25/2020
* Added support for receiving messages via HTTP(S) POST in the WebSocketSource operator.
* Added an utility operator HttpPost to test the feature mentioned above.
* Added a new HttpPostTester example application.

v1.0.0:
- Mar/05/2020
- Very first release of this toolkit that was tested to support receiving of text or binary data from remote client applications via WebSocket. In this release, this toolkit provides a single C++ operator named WebSocketSource.
