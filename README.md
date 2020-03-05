# C++ based WebSocket toolkit for IBM Streams

## Purpose
The streamsx.cppws toolkit provides the following C++ based operators that can help you to ingest text or binary data from the remote client applications via WebSocket (OR) send text or binary data from your IBM Streams applications to external server based applications via WebSocket.

1. WebSocketSource
2. WebSocketSendReceive    [Will be available in 2Q2020]
3. WebSocketSink           [Will be available in 2Q2020]

**WebSocketSource** is a source operator that can be used to receive text or binary data from multiple client applications. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect and start sending data. This is Receive-only from multiple clients.

**WebSocketSendReceive** (when released in 2Q2020) is an analytic operator that can be used to initiate a connection to an external WebSocket server based application in order to send and receive text or binary data via that connection. This is Send-and-Receive to/from a single server based remote WebSocket application.

**WebSocketSink** (when released in 2Q2020) is a sink operator that can be used to send text or binary data to multiple clients. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect and start receiving data. This is Send-only to multiple clients.

In a Streams application, these operators can either be used together or independent of each other. 

## Documentation
1. The official toolkit documentation with extensive details is available at this URL:
https://ibmstreams.github.io/streamsx.cppws/

2. A file named cppws-tech-brief.txt available at this tooolkit's top-level directory also provides a good amount of information about what this toolkit does, how it can be built and how it can be used in the IBM Streams applications.

## Requirements
There are certain important requirements that need to be satisfied in order to use the IBM Streams cppws toolkit in Streams applications. Such requirements are explained below.

1. This toolkit uses Websocket to communicate with the remote client and/or server applications. 

2. On the IBM Streams application development machine (where the application code is compiled to create the application bundle), it is necessary to download and install the boost_1_69_0 as well as the websocketpp version 0.8.1. Please note that this is not needed on the Streams application execution machines. For the essential steps to meet this requirement, please refer to the above-mentioned documentation URL or a file named cppws-tech-brief.txt available at this tooolkit's top-level directory.

3. It is necessary to create a self signed or Root CA signed TLS/SSL certificate in PEM format and point to that certificate file at the time of starting the IBM Streams application that invokes the WebSocketSource operator present in this toolkit. If you don't want to keep pointing to your TLS/SSL certificate file every time you start the IBM Streams application, you can also copy the full certificate file to your Streams application's etc directory as ws-server.pem and compile your application which will then be used by default.

If you are comfortable with using a self signed TLS/SSL certificate file in your environment, you can follow the instructions given in the following file that is shipped with this toolkit to create your own self signed SSL certificate.

```
<YOUR_CPPWS_TOOLKIT_HOME>/samples/WebSocketSourceTester/etc/creating-a-self-signed-certificate.txt
```

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
             totalDataBytesReceived = getTotalDataBytesReceived(), 
             totalTuplesSent = getTupleCnt();
}
```

A built-in example inside this toolkit can be compiled and launched with the default options as shown below:

```
cd   streamsx.cppws/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  output/com.ibm.streamsx.cppws.sample.WebSocketSourceTester.sab 
```

Following IBM Streams job sumission command shows how to override the default values with your own as needed for the various options that are available:

```
cd   streamsx.cppws/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  output/com.ibm.streamsx.cppws.sample.WebSocketSourceTester.sab -P tlsPort=8443 -P certificateFileName=/tmp/mycert.pem -P initDelayBeforeReceivingData=7.0 -P ipv6Available=true -P numberOfMessagesToReceiveBeforeAnAck=23456
```

There is also an example WebSocket based client application that can be run from a RHEL7 or CentOS7 machine to simulate data traffic to be sent to the WebSocketTester application. That example client application is available in the streamsx.cppws/samples/WebSocketSourceTester/WSClientDataSimulator directory.

## WHATS NEW

v1.0.0:
- Mar/05/2020
- Very first release of this toolkit that was tested to support receiving of text or binary data from remote client applications via WebSocket. In this release, this toolkit provides a single C++ based operator named WebSocketSource.