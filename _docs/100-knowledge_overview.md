---
title: "Toolkit Overview [Technical]"
permalink: /docs/knowledge/overview/
excerpt: "Basic knowledge of the toolkit's technical domain."
last_modified_at: 2020-08-31T17:40:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "knowledgedocs"
---
{% include toc %}
{% include editme %}

## Purpose of this toolkit

The streamsx.websocket toolkit provides the following C++ and Java operators that can help you to receive text or binary data from the remote client and server-based applications via WebSocket and HTTP (OR) send text or binary data from your IBM Streams applications to external client and server-based applications via WebSocket and HTTP.

1. WebSocketSource (server-based)
2. WebSocketSendReceive (client-based)
3. WebSocketSink (server-based)
4. HttpPost (client-based) [To send/post text and binary data via HTTP(S)]

**WebSocketSource** by default is a source operator that can be used to receive text or binary data from multiple client applications. This operator supports message reception via both WebSocket and HTTP on plain as well as secure TLS endpoints. This source operator can optionally be turned into an analytic operator to process/analyze the text or binary data received from the remote clients and then send back a text or binary response back to that same WebSocket or HTTP client. The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams applications to tailor the data processing logic based on which group(s) of remote clients sent the data. It supports both persistent (Keep-Alive) and non-persistent HTTP client connections. Persistent HTTP connection feature is beneficial for the non-browser based client applications that need to send hundreds of data items continuously in a tight loop or to send periodic heavy bursts of data items. This feature will keep the client's HTTP connection alive as long as there is data arriving from the client continuously. When HTTP support is enabled, it can serve the web browser based client applications for fetching html, css, js, image files etc. as well as REST-based client applications. Thus, users will get a five-in-one benefit (WebSocket, HTTP, plain, secure and response-ready) from this operator. It can be configured to start a plain or secure WebSocket or HTTP endpoint for the remote clients to connect and start sending and (optionally) receiving data. This is Receive-only with an option to make it a Receive-and-Send operator. This operator promotes the Many-To-One data access pattern.

**WebSocketSendReceive** is an analytic operator that can be used to initiate a connection to an external WebSocket server-based application in order to send and receive text or binary data via that connection. This is Send-and-Receive to/from a single server-based remote WebSocket application. This operator promotes One-To-One data access pattern.

**WebSocketSink** is a sink operator that can be used to send (broadcast) text or binary data to multiple clients. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect in order to start receiving data from this operator. The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams application logic to tailor which data items get sent to which group(s) of the remote clients. This is Send-only to multiple clients. This operator promotes the One-To-Many data access pattern.

**HttpPost** is a utility operator provided by this toolkit to test the optional HTTP(S) text or binary data reception feature available in the WebSocketSource operator. This utility operator can send text or binary data and receive text or binary data in response from the remote server. This operator allows clients to send data via HTTP GET, PUT and POST. If other application scenarios see a fit for this utility operator, they can also use it as needed. If you clone this toolkit from the IBMStreams GitHub, then you must build this utility operator by running `ant clean` and `ant all` from the com.ibm.streamsx.websocket directory. If there is no direct Internet access from the IBM Streams machine and if there is a need to go through a proxy server, then the `ant all` command may not work. In that case, you can try this command instead. `ant all -Dwebsocket.archive=file://localhost$(pwd)/ext -Dwebsocket.version=0.8.2 -Dboost.archive.src0=file://localhost$(pwd)/ext/boost-install-files/boost_1_73_0.tar.gz`

In a Streams application, these operators can either be used together or independent of each other. 
## Technical positioning of this toolkit
WebSocket, a computer communication protocol has been in commercial use since 2012 after it became an official IETF standard. It enables two-way (full duplex) communication between a client and a remote server over TCP with low overhead when compared to the other Web protocols such as HTTP or HTTPS. Another superb benefit of WebSocket is that it can be overlaid on top of HTTP or HTTPS by making the initial connection using HTTP or HTTPS and then upgrading that connection to a full duplex TCP connection to the standard port 80 or port 443 thereby being able to flow through the firewall.

At a very high level, this toolkit shares the same design goal as two other operators available in a different IBM Streams toolkit named com.ibm.streamsx.inetserver which provides two similar operators written in Java using a built-in Jetty web server. The com.ibm.streamsx.websocket provided operators are written using C++ by employing the most highly regarded C++ Boost library which is expected to use less CPU, memory and provide a better overall throughput with a good cost performance advantage.

The three data access patterns highlighted above as promoted by the operators in this toolkit can be explained via the following real-life analogies.

**Many to One**: On a happy occasion like birthday, many family members and friends send greeting messages to that one person who is enjoying the special day.
![MTO](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSourceTester/etc/mto.png)

**One to One**: In a performance evaluation meeting, a manager and an employee exchange information back and forth about the work accomplished. 
![OTO](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSendReceiveTester/etc/oto.png)

**One to Many**: In an annual meeting, a CEO gives data points about the company's business performance to the curiously listening shareholders.
![OTM](https://github.com/IBMStreams/streamsx.websocket/tree/master/samples/WebSocketSinkTester/etc/otm.png)

## Requirements
There are certain important requirements that need to be satisfied in order to use the IBM Streams WebSocket toolkit in Streams applications. Such requirements are explained below.

1. This toolkit uses WebSocket, HTTP to communicate with the remote client and/or server applications. 

2. On the IBM Streams application development machine (where the application code is compiled to create the application bundle), it is necessary to download and install the boost_1_73_0 as well as the websocketpp version 0.8.2. Please note that this is not needed on the Streams application execution machines. For the essential steps to meet this requirement, please refer to the next section or a file named websocket-tech-brief.txt available in this toolkit's top-level directory.

3. It is necessary to create a self-signed or Root CA signed TLS/SSL certificate in PEM format and point to that certificate file at the time of starting the IBM Streams application that invokes the server-based WebSocketSource and WebSocketSink operators present in this toolkit. If you don't want to keep pointing to your TLS/SSL certificate file every time you start the IBM Streams application, you can also copy the full certificate file to your Streams application's `etc` directory as ws-server.pem and compile your application which will then be used by default. The other two client-based operators WebSocketSendReceive and HttpPost can optionally be pointed to their own TLS/SSL certificate at the time of getting invoked mainly for the purpose of performing client (mutual) authentication. All the four operators in this toolkit can also be pointed with the public certificate of their remote party in order to do trusted server or client (two-way) TLS certificate verification/authentication.

If you are comfortable with using a self-signed TLS/SSL certificate file in your environment, you can follow the instructions given in the following file that is shipped with this toolkit to create your own self-signed TLS/SSL certificate.

```
<YOUR_WEBSOCKET_TOOLKIT_HOME>/samples/WebSocketSourceTester/etc/creating-a-self-signed-certificate.txt
```
A copy of the text file mentioned above is available in the `etc` directory of every example shipped with this toolkit. This file explains different procedures to create client/server-side private certificate as well as the public certificate to share with the remote party that is getting connected to or connected from. It also has more details about creating key store and trust store for C++ and Java client and server applications.
