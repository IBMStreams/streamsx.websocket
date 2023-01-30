---
title: "Operator Design"
permalink: /docs/user/OperatorDesign/
excerpt: "Describes the design of the streamsx.websocket toolkit operators."
last_modified_at: 2023-01-30T18:01:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

This IBM Streams C++ WebSocket toolkit contains the following operators to enable data exchange with external applications via WebSocket and/or HTTP. Data can be in text format (plain text, JSON or XML) or in binary format.

1. WebSocketSource (server-based)
2. WebSocketSendReceive (client-based)
3. WebSocketSink (server-based)
4. HttpPost (client-based) [To send/post text and binary data via HTTP(S)]

In a Streams application, these operators can either be used together or independent of each other. Since they are built using the most highly regarded C++ Boost library, they are expected to incur low CPU and low memory usage thereby improving the overall throughput with a good cost performance advantage. All the operators mentioned above can support TLS encryption to secure the data exchange and in addition they allow an optional configuration to perform client or server (one-way or two-way) TLS certificate verification/authentication.

Since WebSocket at its low level is based on TCP, you have to be aware of the effects of the Nagle's algorithm which is usually controlled by TCP_NODELAY. This operator has an optional parameter named tcpNoDelay to enable or disable Nagle's algorithm for your needs. The tcpNoDelay parameter will do its job correctly only with the websocketpp library version 0.8.3 and higher.

In addition to reading the details in this section, it is highly recommended to refer to the SPLDoc for this toolkit in order to get a deeper understanding of all the four operators.

*******************************

* **WebSocketSource** - this is a WebSocket server-based C++ source operator that can receive text or binary data from the external WebSocket and HTTP client applications. Optionally, it can also morph itself from a source into an analytic operator to receive the client's data, process it and then send a text or binary response back to that client.

Main goal of this operator is to receive data from one or more client applications running outside of IBM Streams. This operator internally runs a C++ Boost ASIO WebSocket server that can accept persistent bidirectional WebSocket and Request/Response HTTP client connections. It then emits the received data from the clients as output tuples to be consumed by the downstream operators for further processing. A remote client application must be pointing to the Websocket URL endpoint of the IBM Streams application in which this operator gets invoked. For a secure data exchange, it is necessary to create a TLS/SSL certificate and point to it in the IBM Streams application at the time of invoking this operator. These steps must be performed before this source operator can be used in the context of an IBM Streams application. For clear instructions about this required configuration, please refer to a previous chapter titled "Toolkit Overview [Technical]" and focus on step 3 of one of its sections titled "Requirements for this toolkit".

The data received from the client applications can be in text or binary format. This operator is capable of receiving data from multiple clients that can all send data at the very same time. When a given client application closes its connection, this operator will send a tuple on its second output port to give an indication about the end of data reception from that client identified by its client session id. Downstream operators can make use of this "End Of Client Session" signal as they see fit.

This operator allows client applications to send data via both WebSocket and HTTP GET/PUT/POST. By default, HTTP data reception is not enabled and it can be enabled by via the `allowHttpPost` operator parameter.

Even though it is labeled as a source operator, WebSocketSource can be configured to perform like an analytic operator to receive data from the clients (WS or HTTP or both), process that data and send result/response back to a given client. This is easily accomplished by adding an optional input port in this operator to feed the response tuples. When receiving and sending data from/to a HTTP client, this operator also gives a way to get all the HTTP request headers as well as send any application-specific custom response headers. A thorough example shipped in this toolkit named WebSocketSourceWithResponseTester shows the code logic combined with a very detailed commentary to understand this feature much better than any words here can explain.

The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams applications to tailor the data processing logic based on which group(s) of remote clients sent the data.

Finally, this operator allows another optional input port to dynamically update the client whitelist for instructing this operator to accept connections only from certain client IP addresses. This helps to restrict data exchange only with known/trusted clients.
 
### WebSocketSource operator parameters
Following are the parameters accepted by the WebSocketSource operator. Some parameters are mandatory with user-provided values and others are optional with default values assigned within the C++ operator logic.

| Parameter Name | Type | Default | Description |
| --- | --- | --- | --- |
| tlsPort | `uint32` | `443` | This parameter specifies the WebSocket TLS port number. |
| tlsCipherWhitelist | `rstring` | `Empty string` | This parameter can be used to specify a string containing one or more comma separated approved TLS/SSL ciphers that should be used during TLS/SSL connection negotiations with clients. It is handy when there is a need to avoid using ciphers that are found to have security vulnerabilities. |
| certificateFileName | `rstring` | `etc/ws-server.pem present inside the Streams application` | This parameter specifies the full path of the WebSocket server's private key and public certificate holding PEM file name. |
| certificatePassword | `rstring` | `Empty string` | This parameter specifies a password needed for decrypting the WebSocket server's private key in the PEM file. |
| trustedClientCertificateFileName | `rstring` | `An empty string` | This parameter specifies the full path of the PEM file name that can contain the public certificates of all the trusted clients. This allows for the client (mutual) authentication. If this parameter is not used or empty, then there will be no client authentication. |
| trustedClientX509SubjectIdentifiers | `list<rstring>` | `An empty list` | This parameter specifies a list of verifiable identifiers present in the subject field of the trusted client's public certificate. It is helpful in performing the client (mutual) authentication using the unsupported certificate types such as the self-signed ones. Some examples of such identifiers: ["ST=New York","L=Armonk","O=IBM","CN=www.ibm.com","emailAddress=websocket.streams@ibm.com"] |
| nonTlsEndpointNeeded | `boolean` | `false` | This parameter specifies whether a WebSocket (plain) non-TLS endpoint is needed. |
| nonTlsPort | `uint32` | `80` | This parameter specifies the WebSocket (plain) non-TLS port number. |
| urlContextPath | `list<rstring>` | `An empty list` | This parameter specifies a list with zero or more URL context path(s) for a given WebSocket server endpoint. Users can come up with any application-specific value(s) made of either a single or a multi-part path. e-g: Orders (OR) MyServices/Banking/Deposit. With that example, WebSocket server URL should either be https://host:port/Orders (OR) https://host:port/MyServices/Banking/Deposit. |
| initDelay | `float64` | `0.0` | This parameter specifies a one time delay in seconds for which this source operator should wait before start generating its first tuple. |
| websocketLiveMetricsUpdateNeeded | `boolean` | `true` | This parameter specifies whether live update for this operator's custom metrics is needed. |
| websocketLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed from the WebSocket library. |
| wsConnectionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the remote clients connect and disconnect. |
| wsClientSessionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the remote client session is in progress with this operator. |
| websocketStaleSessionPurgeInterval | `uint32` | `0` | This parameter specifies periodic time interval in seconds during which any stale client sessions should be purged to free up memory usage. |
| ipv6Available | `boolean` | `true` | This parameter indicates whether the ipv6 protocol stack is available in the Linux machine where the WebSocketSource operator is running. |
| tcpNoDelay | `boolean` | `false` | This parameter can be used to control the TCP Nagle's algorithm. Setting it to true will disable Nagle's algorithm and setting it to false will enable. |
| numberOfMessagesToReceiveBeforeAnAck | `uint32` | `23456` | This parameter indicates how many messages are to be received before sending an ack to the remote client. |
| allowHttpPost | `boolean` | `false` | This parameter specifies whether this operator will allow message reception via HTTP(S) GET/PUT/POST. |
| newDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that is just about to send a new data item to the remote clients. It should be >= 0.0. |
| noDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that spin loops when no data is available to send to the remote clients. It should be >= 0.0. |
| clientWhitelist | `list<rstring>` | `An empty list` | This parameter specifies a list of client IP addresses to accept connections only from those clients. Default is an empty list to have no client connection restrictions. |
| maxClientConnectionsAllowed | `uint32` | `32` | This parameter specifies the maximum number of concurrent clients allowed to connect with this operator. After this limit is reached, new client connections will be denied until any existing clients close their connections. |
| responseTimeout | `uint32` | `20` | This parameter specifies the time in seconds before which the application logic should send its pending response to a remote client. If this time expires, a timeout handler thread in this operator will do the necessary internal clean-up work. |
| allowPersistentHttpConnections | `boolean` | `false` | This parameter indicates whether this operator will allow the client applications to make persistent (Keep-Alive) HTTP connections. It is better to allow this only for non-browser based client applications. |

### WebSocketSource operator's custom output functions
Following are the custom output functions supported by the WebSocketSource operator. These functions can be called as needed within the output clause of this operator's SPL invocation code.

| Output function name | Description |
| --- | --- |
| `uint64 getClientSessionId()` | Returns an uint64 value indicating the client session id that corresponds to the current output tuple. |
| `uint64 getTotalDataItemsReceived()` | Returns an uint64 value indicating the total number of data items received so far from a remote client. |
| `uint64 getTotalDataBytesReceived()` | Returns an uint64 value indicating the total number of data bytes received so far from a remote client. |
| `uint64 getTotalDataItemsSent()` | Returns an uint64 value indicating the total number of data items sent so far to a remote client. |
| `uint64 getTotalDataBytesSent()` | Returns an uint64 value indicating the total number of data bytes sent so far to a remote client. |
| `rstring getClientIpAddress()` | Returns a string indicating the IP address of a remote client. |
| `rstring getClientPort()` | Returns a string indicating the port of a remote client. |
| `rstring getUrlContextPath()` | Returns a string indicating the context path present in the URL being accessed by the client. |
| `boolean isWebSocketClient()` | Returns a boolean indicating whether a remote client holds a WebSocket connection. |
| `boolean isHttpClient()` | Returns a boolean indicating whether a remote client holds a Http connection. |
| `map<rstring, rstring> getHttpRequestHeaders()` | Returns an SPL map holding the HTTP headers that were part of a client's HTTP GET/PUT/POST request. |
| `rstring getHttpRequestMethodName()` | Returns a string indicating the method name (GET, PUT or POST) found in the client's HTTP request. |
| `map<rstring, rstring> getUrlQueryStringKeyValuePairs()` | Returns an SPL map holding the key/value pairs found in the URL query string of a client's HTTP GET request. |
| `rstring getFullUrlBeingAccessedByTheClient()` | Returns a string indicating the full URL being accessed by the remote client. |
| `rstring getFileNameInUrlForHttpGet()` | Returns a string indicating the file name in the URL for HTTP GET based requests. |

*******************************

* **WebSocketSendReceive** - this is a WebSocket client-based C++ analytic operator that can establish a connection to a remote WebSocketServer and then start exchanging data in both directions i.e. it can simultaneously send text or binary data to the remote server and receive text or binary data from the remote server independent of each other.

This feature of simultaneously sending and receiving data to/from the remote WebSocket server is possible due to the bidirectional (full duplex) connection offered by the WebSocket protocol. Such a connection to the remote server is persistent and long running until either party (client or server) closes the connection. Based on the remote WebSocket server url's protocol field, this operator will establish a connection either via plain WebSocket (ws or http) or via TLS WebSocket (wss or https). 

Connection to the remote server is attempted when this operator starts up. If the remote WebSocket server becomes unavailable at any given time, this operator behind the scenes will try to establish the connection at a user configurable periodic interval. Once established, this operator will keep that connection persistent until this operator is shutdown or the remote server is stopped or any other network error occurs. If the remote server closes the connection when this operator is still active, any incoming tuple into this operator at that time will not be sent to the remote server at all. In this case, the application logic invoking this operator can retransmit that tuple at a later time just because this operator will keep trying to reestablish the connection behind the scenes. It is a good practice for the application logic to backoff and wait for a reasonable amount of time when there is a connection error with the remote WebSocket server before inputting a tuple again into this operator. Otherwise, it will trigger too many connection attempts on every incoming tuple to send it to the remote server. So, the application logic should make an attempt to wait for a while before attempting to send the data after knowing that there is an ongoing connection problem with the remote server.

### WebSocketSendReceive operator parameters
Following are the parameters accepted by the WebSocketSendReceive operator. Some parameters are mandatory with user-provided values and others are optional with default values assigned within the C++ operator logic.

| Parameter Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | `rstring` | `An empty string` | This parameter specifies the URL of the remote WebSocket server. |
| certificateFileName | `rstring` | `An empty string` | This parameter specifies the full path of the WebSocket client's private key and public certificate holding PEM file name. |
| certificatePassword | `rstring` | `Empty string` | This parameter specifies a password needed for decrypting the WebSocket client's private key in the PEM file. |
| trustedServerCertificateFileName | `rstring` | `An empty string` | This parameter specifies the full path of the PEM file name that contains the public certificate of the trusted remote server. This allows for the server authentication. If this parameter is not used or empty, then there will be no server authentication. |
| trustedServerX509SubjectIdentifiers | `list<rstring>` | `An empty list` | This parameter specifies a list of verifiable identifiers present in the subject field of the trusted server's public certificate. It is helpful in performing the server authentication using the unsupported certificate types such as the self-signed ones. Some examples of such identifiers: \["ST=New York","L=Armonk","O=IBM","CN=www.ibm.com","emailAddress=websocket.streams@ibm.com"\] |
| websocketLiveMetricsUpdateNeeded | `boolean` | `true` | This parameter specifies whether live update for this operator's custom metrics is needed. |
| websocketLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed from the WebSocket library. |
| wsConnectionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when this operator connects and disconnects to/from the remote server. |
| wsClientSessionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the client session send/receive is in progress with the remote server. |
| newDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that is just about to send a new data item to the remote server. It should be >= 0.0 |
| noDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that spin loops when no data is available to send to the remote server. It should be >= 0.0 |
| reconnectionInterval | `float64` | `60.0` | This parameter specifies the periodic time interval (in partial seconds) at which reconnection to the remote WebSocket server will be attempted. It should be > 0.0 |
| tcpNoDelay | `boolean` | `false` | This parameter can be used to control the TCP Nagle's algorithm. Setting it to true will disable Nagle's algorithm and setting it to false will enable. |

### WebSocketSendReceive operator's custom output functions
Following are the custom output functions supported by the WebSocketSendReceive operator. These functions can be called as needed within the output clause of this operator's SPL invocation code.

| Output function name | Description |
| --- | --- |
| `uint64 getTotalDataItemsReceived()` | Returns an uint64 value indicating the total number of data items received so far from the remote server. |
| `uint64 getTotalDataBytesReceived()` | Returns an uint64 value indicating the total number of data bytes received so far from the remote server. |
| `uint64 getTotalDataItemsSent()` | Returns an uint64 value indicating the total number of data items sent so far to the remote server. |
| `uint64 getTotalDataBytesSent()` | Returns an uint64 value indicating the total number of data bytes sent so far to the remote server. |

*******************************

* **WebSocketSink** - this is a WebSocket server-based C++ sink operator designed to send data to the remote WebSocket clients that are connected at any given time to the WebSocket server running inside of this operator. This operator can be used to send text (plain text, JSON or XML) and/or binary data. This operator will accept a client connection either via plain WebSocket (ws or http) or via TLS WebSocket (wss or https). Since any given WebSocket connection is bidirectional (full duplex) in nature, this sink operator will focus only on sending data to the connected remote clients and will simply ignore any data received from them. In addition, this operator can be configured to allow a certain maximum number of concurrent connections from the remote clients depending on the needs of the application and based on the capacity of the underlying OS and hardware configuration such as networking, CPU cores and memory limits.

The WebSocket server running in this operator supports having multiple URL context paths for a given endpoint listening on a particular port. By using this feature, remote clients can connect to different URL context paths thereby letting the IBM Streams application logic to tailor which data items get sent to which group(s) of the remote clients.

Since it is a server-based operator, many of the points we discussed for the other server-based WebSocketSource operator are also applicable here (client whitelist, client authentication etc.) as shown below in the common parameters between them.
 
### WebSocketSink operator parameters
Following are the parameters accepted by the WebSocketSink operator. Some parameters are mandatory with user-provided values and others are optional with default values assigned within the C++ operator logic.

| Parameter Name | Type | Default | Description |
| --- | --- | --- | --- |
| tlsPort | `uint32` | `443` | This parameter specifies the WebSocket TLS port number. |
| tlsCipherWhitelist | `rstring` | `Empty string` | This parameter can be used to specify a string containing one or more comma separated approved TLS/SSL ciphers that should be used during TLS/SSL connection negotiations with clients. It is handy when there is a need to avoid using ciphers that are found to have security vulnerabilities. |
| certificateFileName | `rstring` | `etc/ws-server.pem present inside the Streams application` | This parameter specifies the full path of the WebSocket server's private key and public certificate holding PEM file name. |
| certificatePassword | `rstring` | `Empty string` | This parameter specifies a password needed for decrypting the WebSocket server's private key in the PEM file. |
| trustedClientCertificateFileName | `rstring` | `An empty string` | This parameter specifies the full path of the PEM file name that can contain the public certificates of all the trusted clients. This allows for the client (mutual) authentication. If this parameter is not used or empty, then there will be no client authentication. |
| trustedClientX509SubjectIdentifiers | `list<rstring>` | `An empty list` | This parameter specifies a list of verifiable identifiers present in the subject field of the trusted client's public certificate. It is helpful in performing the client (mutual) authentication using the unsupported certificate types such as the self-signed ones. Some examples of such identifiers: ["ST=New York","L=Armonk","O=IBM","CN=www.ibm.com","emailAddress=websocket.streams@ibm.com"] |
| nonTlsEndpointNeeded | `boolean` | `false` | This parameter specifies whether a WebSocket (plain) non-TLS endpoint is needed. |
| nonTlsPort | `uint32` | `80` | This parameter specifies the WebSocket (plain) non-TLS port number. |
| urlContextPath | `list<rstring>` | `An empty list` | This parameter specifies a list with zero or more URL context path(s) for a given WebSocket server endpoint. Users can come up with any application-specific value(s) made of either a single or a multi-part path. e-g: Orders (OR) MyServices/Banking/Deposit. With that example, WebSocket server URL should either be https://host:port/Orders (OR) https://host:port/MyServices/Banking/Deposit. |
| websocketLiveMetricsUpdateNeeded | `boolean` | `true` | This parameter specifies whether live update for this operator's custom metrics is needed. |
| websocketLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed from the WebSocket library. |
| wsConnectionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the remote clients connect and disconnect. |
| wsClientSessionLoggingNeeded | `boolean` | `false` | This parameter specifies whether logging is needed when the remote client session is in progress with this operator. |
| websocketStaleSessionPurgeInterval | `uint32` | `0` | This parameter specifies periodic time interval in seconds during which any stale client sessions should be purged to free up memory usage. |
| ipv6Available | `boolean` | `true` | This parameter indicates whether the ipv6 protocol stack is available in the Linux machine where the WebSocketSource operator is running. |
| tcpNoDelay | `boolean` | `false` | This parameter can be used to control the TCP Nagle's algorithm. Setting it to true will disable Nagle's algorithm and setting it to false will enable. |
| newDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that is just about to send a new data item to the remote clients. It should be >= 0.0. |
| noDataCpuYieldTimeInSenderThread | `float64` | `0.001` | This parameter specifies the CPU yield time (in partial seconds) needed inside the thread that spin loops when no data is available to send to the remote clients. It should be >= 0.0. |
| clientWhitelist | `list<rstring>` | `An empty list` | This parameter specifies a list of client IP addresses to accept connections only from those clients. Default is an empty list to have no client connection restrictions. |
| maxClientConnectionsAllowed | `uint32` | `32` | This parameter specifies the maximum number of concurrent clients allowed to connect with this operator. After this limit is reached, new client connections will be denied until any existing clients close their connections. |

*******************************

* **HttpPost** - This is a client-based Java analytic operator that can be used to send text or binary content to the specified HTTP or HTTPS endpoint and then wait to receive text or binary data as response for that HTTP POST request from the remote server. This operator allows clients to send data via HTTP GET, PUT and POST. It was originally built to test the WebSocketSource operator discussed above for sending and receiving binary data to/from it. This operator can be used in other real-world application scenarios as well if it fits the needs. 
 
### HttpPost operator parameters
Following are the parameters accepted by the HttpPost operator. Some parameters are mandatory with user-provided values and others are optional with default values assigned within the Java operator logic.

| Parameter Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | `rstring` | `An empty string` | This parameter specifies the URL to which HTTP POSTs will be sent. |
| contentType | `rstring` | `text/plain` | This parameter specifies the MIME content type for the data being sent. |
| logHttpPostActions | `boolean` | `false` | This parameter specifies whether HTTP POST actions should be logged to the screen for debugging purposes. |
| delayBetweenConsecutiveHttpPosts | `int32` | `0` | This parameter specifies a tiny delay in millseconds to have between consecutive HTTP Posts. |
| httpTimeout | `int32` | `30` | This parameter specifies a value for the three commonly used HTTP timeout settings namely connect, connection request and socket timeout. |
| tlsAcceptAllCertificates | `boolean` | `false` | This parameter specifies whether all TLS certificates can be accepted with a possibility for an insecure connection. If this parameter is set, the other two parameters `tlsTrustStoreFile` and `tlsKeyStoreFile` are not allowed. |
| tlsKeyStoreFile | `rstring` | `An empty string` | This parameter if present should point to a key store file in JKS format which will be used for client authentication. This store should have client's private key and its public certificate to prove its identity. When this parameter is present, then the tlsKeyPassword parameter must be present and the tlsKeyStorePassword can be optional. |
| tlsKeyStorePassword | `rstring` | `An empty string` | This parameter specifies the password for the key store. |
| tlsKeyPassword | `rstring` | `An empty string` | This parameter specifies the the password for the keys stored in the key store. |
| tlsTrustStoreFile | `rstring` | `An empty string` | This parameter if present should point to a trust store file in JKS format which will be used for authenticating the remote web server. This store should have server's "public certificate to verify its identity. When this parameter is present, then the tlsTrustStorePassword can be optional. |
| tlsTrustStorePassword | `rstring` | `An empty string` | This parameter specifies the password for the trust store. |
| createPersistentHttpConnection | `boolean` | `false` | This parameter specifies if we have to a create a persistent (Keep-Alive) HTTP connection or not. |

*******************************
