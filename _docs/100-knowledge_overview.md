---
title: "Toolkit Overview [Technical]"
permalink: /docs/knowledge/overview/
excerpt: "Basic knowledge of the toolkit's technical domain."
last_modified_at: 2020-03-04T08:15:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "knowledgedocs"
---
{% include toc %}
{% include editme %}

## Purpose of this toolkit

The streamsx.cppws toolkit provides the following C++ based operators that can help you to receive text or binary data from the remote client applications via WebSocket (OR) send text or binary data from your IBM Streams applications to external server based applications via WebSocket.

1. WebSocketSource
2. WebSocketSendReceive    [Will be available in 2Q2020]
3. WebSocketSink           [Will be available in 2Q2020]

**WebSocketSource** is a source operator that can be used to receive text or binary data from multiple client applications. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect and start sending data. This is Receive-only from multiple clients.

**WebSocketSendReceive** (when released in 2Q2020) is an analytic operator that can be used to initiate a connection to an external WebSocket server based application in order to send and receive text or binary data via that connection. This is. Send-and-Receive to/from a single server based remote WebSocket application.

**WebSocketSink** (when released in 2Q2020) is a sink operator that can be used to send text or binary data to multiple clients. It can be configured to start a plain or secure WebSocket endpoint for the remote clients to connect and start. receiving data. This is Send-only to multiple clients.

In a Streams application, these operators can either be used together or independent of each other. 

## Technical positioning of this toolkit
At a very high level, this toolkit shares the same design goal as two other operators available in a different IBM Streams toolkit named com.ibm.streamsx.inetserver which provides two similar operators written in Java using a built-in Jetty web server. The com.ibm.streamsx.cppws provided operators are written using C++ by employing the Boost ASIO facility which is expected to use less CPU and memory and provide a better overall throughput.

## Requirements for this toolkit
There are certain important requirements that need to be satisfied in order to use the IBM Streams cppws toolkit in. Streams applications. Such requirements are explained below.

1. This toolkit uses Websocket to communicate with the remote client and/or server applications. 

2. On the IBM Streams application development machine (where the application code is compiled to create the application bundle), it is necessary to download and install the boost_1_69_0 as well as the websocketpp version 0.8.1. Please note that this is not needed on the Streams application execution machines. For the essential steps to meet this requirement, please refer to the above-mentioned documentation URL or a file named cppws-tech-brief.txt available at this tooolkit's top-level directory.

3. It is necessary to create a self signed or Root CA signed TLS/SSL certificate in PEM format and point to that certificate file at the time of starting the IBM Streams application that invokes the WebSocketSource operator present in this toolkit. If you don't want to keep pointing to your TLS/SSL certificate file every time you start the IBM Streams application, you can also copy the full certificate file to your Streams application's etc directory as ws-server.pem and compile your application which will then be used by default.

If you are comfortable with using a self signed TLS/SSL certificate file in your environment, you can follow the instructions given in the following file that is shipped with this toolkit to create your own self signed SSL certificate.

```
<YOUR_CPPWS_TOOLKIT_HOME>/samples/WebSocketSourceTester/etc/creating-a-self-signed-certificate.txt
```
