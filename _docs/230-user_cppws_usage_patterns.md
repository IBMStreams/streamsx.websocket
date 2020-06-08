---
title: "Operator Usage Patterns"
permalink: /docs/user/CppWSUsagePatterns/
excerpt: "Describes the CppWS toolkit usage patterns."
last_modified_at: 2020-06-06T15:53:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

## Details for using the server-based operators
The WebSocketSource and WebSocketSink operators use the WebSocket server to accept multiple concurrent client connections. Single connection per client is opened and kept alive for the entire lifetime of that client. Please refer to a chapter titled "Toolkit Overview [Technical]" and focus on step 3 of one of its sections titled "Requirements for this toolkit". It is important to note that this operator will optionally allow data reception via HTTP(S) POST if needed.

In order to use this operator in your Streams application, the following values must be with you at the time of launching the Streams application.

1. TLS (a.k.a SSL) port for the WebSocket server in these operators that you want to use. By default, these operators will use the TLS port 443. If you want to override that default port number, you should decide which port number to use.

2. TLS (SSL) certificate file name that you want the WebSocket server in these operators to use. You must generate either a self-signed or a root CA signed certificate in PEM format (containing both your private key and your public certificate) and give the full path of that file while starting your Streams application. Alternately, you can also copy your certificate file in your Streams application's `etc` sub-directory as ws-server.pem and then let these operators use that file by default.

These two important values are passed via the corresponding operator parameters. There are also other optional parameters for these operators that you can configure for additional features that your application may require.

## Details for using the client-based operators
The WebSocketSendReceive and HttpPost operators always connect to a remote server. So, URL of the remote server is a must for these two operators at the time of invoking them. They don't need the certificate file as we discussed above for the server-based operators. However, these two client operators can optionally accept their private certificate as well as the remote server's public certificate purely for the purpose of the trusted client or server TLS certificate verification/authentication. There are several configurable parameters available for these two operators that can be used to satisfy the needs discussed in this paragraph.

## Parameters for this toolkit's operators
These operators collectively have dozens of configuration parameters that can be used to define and influence how these operators will perform their intended tasks. They were already covered in the previous section. Please refer to them as needed.

## Stream schema for this toolkit's operators
All the four operators in this toolkit expect specific input and output stream schema that need to have certain compulsory attributes. They are explained clearly in the SPLDoc for this toolkit. Please take time to thoroughly read the opening description section for all the operators in the SPLDoc. Gaining a good understanding of that is necessary to put these operators to their best use. Not all real-life applications will need all the input and output stream attributes. You can decide to include or omit these attributes based on the specific features your application will need. Trimming the unused attributes will also help in reducing the data processing overhead and in turn help in exchanging the data faster. So, use them as you need.

## Invoking the operators from this toolkit
In your SPL application, the operators from this toolkit can be invoked with either all operator parameters or a subset of the operator parameters. Similarly, in the output clause of the operator body, you can either call all the available custom output functions or a subset of those custom output functions to do your output stream attribute assignments. You can decide on the total number of operator parameters and the total number of custom output functions to use based on the real needs of your application. Please refer to the comprehensive set of working examples included in the `samples` directory of this toolkit which give an excellent coverage of different ways in which they can be invoked.

## Metrics for this toolkit's operators
All the operators in this toolkit provide carefully chosen custom metrics that can be queried via the IBM Streams REST/JMX APIs or viewed via the commonly used utilities such as streamtool and Streams Web Console. These Gauge kind metrics will be updated live during the send/receive of the data only when the websocketLiveMetricsUpdateNeeded operator parameter is set to true. Please refer to the SPLDoc for this toolkit to learn more about the custom metrics exposed by all the operators available in this toolkit.

## Running the example applications
There are different sets of working examples included within this toolkit's `samples` directory to showcase the power and full features of all the operators. You can use them as a reference to learn more about putting these operators to use in your own applications. All the examples have their own make file to build it. In a Linux terminal window by being in the top-level of a given example directory, simply run `make` to build a given example. In the `etc` sub-directory of every example, there is a shell script that can be used to run a given example with synthetic data and then verify the application behavior and the result. That shell script was originally written for running a given example in the IBM Streams lab in New York. It is easy to make minor changes in that shell script and use it in any other IBM Streams environment for running a given example.

*******************************

## Conclusion
As explained in the chapters thus far, those four operators are powerful ones to integrate the IBM Streams applications with the remote client and server applications that want to do data exchange via WebSocket and/or HTTP. These operators are highly scalable and they can operate in a secure manner. 

**Cheers and good luck in finding impactful insights from your data.**
