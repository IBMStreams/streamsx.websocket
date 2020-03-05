---
title: "Operator Usage Patterns"
permalink: /docs/user/CppWSUsagePatterns/
excerpt: "Describes the CppWS toolkit usage patterns."
last_modified_at: 2020-03-04T08:53:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

## Important details needed for using the WebSocketSource operator
The WebSocketSource operator uses the WebSocket server interface to accept multiple concurrent client connections. Single connection per client is opened and kept alive for the entire lifetime of that client. Please refer to a chapter titled "Toolkit Overview [Technical]" and focus on step 3 of one of its sections titled "Requirements for this toolkit".

In order to use this operator in your Streams application, the following values must be with you at the time of launching the Streams application.

1. TLS (a.k.a SSL) port for the Websocket server in the WebSocketSource that you want to use. By default, this operator will use the TLS port 443. If you want to override that default port number, you should decide which port number to use.

2. TLS (SSL) certificate file name that you want the Websocket server in the WebSocketSource operator to use. You must generate either a self signed or a root CA signed certificate in PEM format (containing both your private key and your certificate) and give the full path of that file while starting your Streams application. Alternately, you can also copy your certificate file in your Streams application's etc sub-directory as ws-server.pem and then let the WebSocketSource operator use that file by default.

These two important values are passed via the corresponding operator parameters. There are also other optional parameters for this operator that you can configure for additional features that your application may require.

## Configuration parameters for the WebSocketSource operator
This operator provides eleven parameters to configure the way in which this operator will function to make the data received from remote clients available to the downstream operators. For the normal usage, you can simply use only the important parameters as discussed above on this page. For debug logs, enforcing an initial delay etc., you will have to use the other operator parameters as listed in the previous page.

## Output stream schema for the WebSocketSource operator
At the full scope of this operator, output stream schema can be as shown below with all possible attributes. It is shown here to explain the basic and additional features of this operator. Not all real life applications will need all these attributes. You can decide to include or omit these attributes based on the specific features your application will need. Trimming the unused attributes will also help in reducing the message processing overhead and in turn help in receiving the remote clients' data faster.

```
// The following is the schema of the first output stream for the
// WebSocketSource operator. The first three attributes are
// very important and the other ones are purely optional if some
// scenarios really require them.
// rstring strData --> String based data (plain text, JSON and XML) received from the remote client.
// blob blobData --> Binary based data (audio, video, image etc.) received from the remote client.
// uint64 clientSessionId --> Unique identifier of a remote client as assigned by this operator. 
// int32 totalDataBytesReceived --> Number of data bytes received so far from a given clientSessionId.
// int32 totalTuplesSent --> Total output tuples emitted so far for a given clientSessionId.
ReceivedData_t = rstring strData, blob blobData, uint64 clientSessionId, 
   int32 totalDataBytesReceived, int32 totalTuplesSent;
```

```
// The following schema is for the second output stream of the
// WebSocketSource operator. It has one attribute indicating
// the a given remote client (clientSessionId) which ended the session.
EndOfClientSessionSignal_t = uint64 clientSessionId;
```

## Invoking the WebSocketSource operator
In your SPL application, this operator can be invoked with either all operator parameters or a subset of the operator parameters. Similarly, in the output clause of the operator body, you can either call all the available custom output functions or a subset of those custom output functions to do your output stream attribute assignments. You can decide on the total number of operator parameters and the total number of custom output functions to use based on the real needs of your application.

```
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
         nonTlsEndpointNeeded: $nonTlsEndpointNeeded;
         nonTlsPort: $nonTlsPort;
         initDelay: $initDelayBeforeReceivingData;
         websocketLiveMetricsUpdateNeeded: $websocketLiveMetricsUpdateNeeded;
         websocketLoggingNeeded: $websocketLoggingNeeded;
         wsClientSessionLoggingNeeded: $wsClientSessionLoggingNeeded;
         websocketStaleConnectionPurgeInterval: $websocketStaleConnectionPurgeInterval;
         ipv6Available: $ipv6Available;
         numberOfMessagesToReceiveBeforeAnAck: $numberOfMessagesToReceiveBeforeAnAck;
			
      // Get these values via custom output functions provided by this operator.
      output
         // strData and/or blobData attributes will be automatically
         // assigned with values by the operator logic.
         // Other attributes can be assigned manually as done below.
         WSRD: clientSessionId = getClientSessionId(),
               totalDataBytesReceived = getTotalDataBytesReceived(), 
               totalTuplesSent = getTupleCnt();
}
```

## Using the custom output functions in the WebSocketSource operator
This operator does the automatic attribute value assignment from the input tuple to the output tuple for those matching output tuple attributes for which there is no explicit value assignment done in the output clause. Users can decide to assign values to the output tuple attributes via custom output functions as per the needs of the application.

At the very basic level, users should call the very first custom output function shown below at all times. Rest of the custom output functions can be either called or omitted as dictated by your application requirements.

**getClientSessionId()** is used to get  the unique session id for a given remote client.

**getTupleCnt()** is used to get the number of tuples received so far from the given client session id.

**getTotalDataBytesReceived ()** is used to get the total number of data bytes received so far from the given client session.

## Custom metrics available in the WebSocketSource operator
This operator provides the following custom metrics that can be queried via the IBM Streams REST/JMX APIs or viewed via the commonly used utilities such as streamtool and Streams Web Console. These Gauge kind metrics will be updated live during the reception of the data only when the wwbsocketLiveMetricsUpdateNeeded operator parameter is set to true.

1. **nClientsConnected**: It shows the number of remote clients currently connected to this operator instance.

2. **nDataBytesReceived**: It shows the total number of data bytes received by this operator instance.

3. **nOutputTuplesSent**: It shows the total number of output tuples emitted by this operator instance.

## Running the example application that use the WebSocketSource operator
There is a working example included within this toolkit. You can use it as a reference to learn more about putting this operator to use in your own applications. You can use similar streamtool submitjob commands as shown below in your own applications.

```
cd   streamsx.cppws/samples/WebSocketSourceTester
make
st  submitjob  -d  <YOUR_STREAMS_DOMAIN>  -i  <YOUR_STREAMS_INSTANCE>  output/com.ibm.streamsx.cppws.sample.WebSocketSourceTester/BuildConfig/com.ibm.streamsx.cppws.sample.WebSocketSourceTester.sab -P tlsPort=8443 -P certificateFileName=/tmp/mycert.pem -P initDelayBeforeReceivingData=7.0 -P ipv6Available=true -P numberOfMessagesToReceiveBeforeAnAck=23456
```

*******************************

## Conclusion
As explained in the chapters thus far, those three operators are powerful ones to integrate the IBM Streams applications with the remote client applications that want to do data exchange via WebSocket. These operators are highly scalable and they can operate in a secure manner. 

**Cheers and good luck in finding impactful insights from your data.**
