---
title: "Operator Design"
permalink: /docs/user/OperatorDesign/
excerpt: "Describes the design of the Cpp WS toolkit operators."
last_modified_at: 2020-03-04T08:47:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

This IBM Streams C++ based WebSocket toolkit contains the following operators to enable data exchange with external applications via WebSocket.

1. WebSocketSource
2. WebSocketSendReceive    [Will be available in 2Q2020]
3. WebSocketSink           [Will be available in 2Q2020]


In a Streams application, these operators can either be used together or independent of each other. Since they are built on top of the C++ Boost ASIO library, they are expected to incur low CPU and low memory usage thereby improving the overall throughput.

*******************************

* **WebSocketSource** - this is a WebSocket server based C++ source operator that can receive text or binary data from the external WebSocket based client applications.

Main goal of this operator is to receive data from one or more client applications running outside of IBM Streams. This operator internally runs a WebSocket server that can accept persistent bidirectional client connections. It then emits the received data from the clients as output tuples to be consumed by the downstream operators for further processing. A remote client application must be pointing to the Websocket URL endpoint of the IBM Streams application in which this operator gets invoked. For secure data exchange, it is necessary to create a TLS/SSL certificate and point to it in the IBM Streams application at the time of invoking this operator. These steps must be performed before this source operator can be used in the context of an IBM Streams application. For clear instructions about this required configuration, please refer to a previous chapter titled "Toolkit Overview [Technical]" and focus on step 3 of one of its sections titled "Requirements for this toolkit".

The data received from the client applications can be in text or binary format. This operator is capable of receiving data from multiple clients that can all send data at the very same time. When a given client application closes its connection, this operator will send a tuple on its second output port to give an indication about the end of data reception from that client identified by its client session id. Downstream operators can make use of this "End Of Client Session" signal as they see fit.

### WebSocketSource operator parameters
Following are the parameters accepted by the WebSocketSource operator. Some parameters are mandatory with user-provided values and others are optional with default values assigned within the C++ operator logic.

| Parameter Name | Type | Default | Description |
| --- | --- | --- | --- |
| tlsPort | `uint32` | `443` | This parameter specifies the WebSocket TLS port number. |
| certificateFileName | `rstring` | `etc/ws-server.pem present inside the Streams application` | This parameter specifies the full path of the WebSocket server PEM certificate file name. |
| nonTlsEndpointNeeded | `boolean` | `false` | This parameter specifies whether a WebSocket (plain) non-TLS endpoint is needed. |
| nonTlsPort | `uint32` | `80` | This parameter specifies the WebSocket (plain) non-TLS port number. |
| initDelay | `float64` | `0.0` | This parameter specifies a one time delay in seconds for which this source operator should wait before start generating its first tuple. |
| websocketLiveMetricsUpdateNeeded | `boolean` | `true` | This parameter specifies whether live update for this operator's custom metrics is needed. |
| websocketLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed from the WebSocket library. |
| wsClientSessionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the remote client session is in progress with this operator. |
| websocketStaleSessionPurgeInterval | `uint32` | `10800` | This parameter specifies periodic time interval in seconds during which any stale client sessions should be purged to free up memory usage. |
| ipv6Available | `boolean` | `true` | This parameter indicates whether the ipv6 protocol stack is available in the Linux machine where the WebSocketSource operator is running. |
| numberOfMessagesToReceiveBeforeAnAck | `uint32` | `23456` | This parameter indicates how many messages are to be received before sending an ack to the remote client. |

### WebSocketSource operator's custom output functions
Following are the custom output functions supported by the WebSocketSource operator. These functions can be called as needed within the output clause of this operator's SPL invocation code.

| Output function name | Description |
| --- | --- |
| `uint64 getClientSessionId()` | Returns an uint64 value indicating the client session id that corresponds to the current output tuple. |
| `int32 getTupleCnt()` | Returns an int32 value indicating the total number of output tuples emitted so far for the given client session id. |
| `int32 getTotalDataBytesReceived()` | Returns an int32 value indicating the total number of data bytes received so far for the given client session id. |


*******************************
