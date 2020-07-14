# C++ WebSocket toolkit for IBM Streams

## Purpose
The streamsx.websocket toolkit provides the following C++ and Java operators that can help you to receive text or binary data from the remote client and server-based applications via WebSocket and HTTP (OR) send text or binary data from your IBM Streams applications to external client and server-based applications via WebSocket and HTTP.

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
https://ibmstreams.github.io/streamsx.websocket/

2. A file named websocket-tech-brief.txt available at this toolkit's top-level directory also provides a good amount of information about what this toolkit does, how it can be built and how it can be used in the IBM Streams applications.

## Technical positioning of this toolkit
WebSocket, a computer communication protocol has been in commercial use since 2012 after it became an official IETF standard. It enables two-way (full duplex) communication between a client and a remote server over TCP with low overhead when compared to the other Web protocols such as HTTP or HTTPS. Another superb benefit of WebSocket is that it can be overlaid on top of HTTP or HTTPS by making the initial connection using HTTP or HTTPS and then upgrading that connection to a full duplex TCP connection to the standard port 80 or port 443 thereby being able to flow through the firewall.

At a very high level, this toolkit shares the same design goal as two other operators available in a different IBM Streams toolkit named com.ibm.streamsx.inetserver which provides two similar operators written in Java using a built-in Jetty web server. The com.ibm.streamsx.websocket provided operators are written using C++ by employing the most highly regarded C++ Boost library which is expected to use less CPU, memory and provide a better overall throughput with a good cost performance advantage.

The three data access patterns highlighted above as promoted by the operators in this toolkit can be explained via the following real-life analogies.

**Many to One**: On a happy occasion like birthday, many family members and friends send greeting messages to that one person who is enjoying the special day.

![MTO](https://github.com/IBMStreams/streamsx.websocket/blob/develop/samples/WebSocketSourceTester/etc/mto.png)

**One to One**: In a performance evaluation meeting, a manager and an employee exchange information back and forth about the work accomplished. 

![OTO](https://github.com/IBMStreams/streamsx.websocket/blob/develop/samples/WebSocketSendReceiveTester/etc/oto.png)

**One to Many**: In an annual meeting, a CEO gives data points about the company's business performance to the curiously listening shareholders.

![OTM](https://github.com/IBMStreams/streamsx.websocket/blob/develop/samples/WebSocketSinkTester/etc/otm.png)

## Requirements
There are certain important requirements that need to be satisfied in order to use the IBM Streams websocket toolkit in Streams applications. Such requirements are explained below.

1. This toolkit uses WebSocket, HTTP to communicate with the remote client and/or server applications. 

2. On the IBM Streams application development machine(s) (where the application code is compiled to create the application bundle), it is necessary to download and install the boost_1_73_0 as well as the websocketpp version 0.8.2. Please note that this is not needed on the Streams application execution machines. For the essential steps to meet this requirement, please refer to the above-mentioned documentation URL or a file named websocket-tech-brief.txt available in this toolkit's top-level directory.

3. It is necessary to create a self-signed or Root CA signed TLS/SSL certificate in PEM format and point to that certificate file at the time of starting the IBM Streams application that invokes the server-based WebSocketSource and WebSocketSink operators present in this toolkit. If you don't want to keep pointing to your TLS/SSL certificate file every time you start the IBM Streams application, you can also copy the full certificate file to your Streams application's `etc` directory as ws-server.pem and compile your application which will then be used by default. The other two client-based operators WebSocketSendReceive and HttpPost can optionally be pointed to their own TLS/SSL certificate at the time of getting invoked mainly for the purpose of performing client (mutual) authentication. All the four operators in this toolkit can also be pointed with the public certificate of their remote party in order to do trusted server or client (two-way) TLS certificate verification/authentication.

If you are comfortable with using a self-signed TLS/SSL certificate file in your environment, you can follow the instructions given in the following file that is shipped with this toolkit to create your own self-signed TLS/SSL certificate.

```
<YOUR_WEBSOCKET_TOOLKIT_HOME>/samples/WebSocketSourceTester/etc/creating-a-self-signed-certificate.txt
```
A copy of the text file mentioned above is available in the `etc` directory of every example shipped with this toolkit. This file explains different procedures to create client/server-side private certificate as well as the public certificate to share with the remote party that is getting connected to or connected from. It also has more details about creating key store and trust store for C++ and Java client and server applications.

## Example usage of this toolkit inside a Streams application
Here is a code snippet that shows how to invoke the **WebSocketSource** operator available in this toolkit with a subset of supported features:

```
use com.ibm.streamsx.websocket.op::*;

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
cd   streamsx.websocket/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  com.ibm.streamsx.websocket.sample.WebSocketSourceTester.sab 
```

Following IBM Streams job submission command shows how to override the default values with your own as needed for the various options that are available:

```
cd   streamsx.websocket/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  com.ibm.streamsx.websocket.sample.WebSocketSourceTester.sab -P tlsPort=8443 -P certificateFileName=/tmp/mycert.pem -P initDelayBeforeReceivingData=7.0 -P ipv6Available=true -P numberOfMessagesToReceiveBeforeAnAck=23456 -P allowHttpPost=true
```

## Examples that showcase this toolkit's features
This toolkit ships with the following examples that can be used as reference applications. These examples showcase the full feature set of the WebSocketSource, WebSocketSendReceive, WebSocketSink and the HttpPost operators that are available within this toolkit. Every example below will have the client and server-side application needed to test it. All the examples went through extensive testing in the IBM Streams lab in New York and they include excellent code documentation in the source files to guide the application/solution development engineers. More details about these examples can be obtained from the official documentation for this toolkit.

* [WebSocketSourceTester](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSourceTester)
* [WebSocketSourceWithResponseTester](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSourceWithResponseTester)
* [WebSocketSendReceiveTester](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSendReceiveTester)
* [WebSocketSinkTester](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSinkTester)
* [HttpPostTester](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/HttpPostTester)

In the `etc` sub-directory of every example shown above, there is a shell script that can be used to run a given example with synthetic data and then verify the application behavior and the result. That shell script was originally written for running a given example in the IBM Streams lab in New York. It is easy to make minor changes in that shell script and use it in any other IBM Streams environment for running a given example.

There is also an example WebSocket C++ client application that can be run from a RHEL7 or CentOS7 machine to simulate high volume data traffic to be sent to the WebSocketSourceTester application. That example client application is available in the streamsx.websocket/samples/WebSocketSourceTester/WSClientDataSimulator directory.

## WHATS NEW

see: [CHANGELOG.md](com.ibm.streamsx.websocket/CHANGELOG.md)
