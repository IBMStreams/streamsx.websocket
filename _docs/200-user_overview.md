---
title: "Toolkit Usage Overview"
permalink: /docs/user/overview/
excerpt: "How to use this toolkit."
last_modified_at: 2020-06-06T08:28:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

## Satisfying the toolkit requirements
As explained in the "Toolkit Overview [Technical]" section, this toolkit requires network connectivity to connect to the external applications with whom it will help us to do data exchange. In addition, it also requires you to download and install the boost_1_73_0 as well as the websocketpp version 0.8.2 on the IBM Streams application development machine where the application code is compiled to create the application bundle. These two C++ libraries form the major external dependency for this toolkit. 

Bulk of the WebSocket logic in this toolkit's operator relies on the following open source C++ WebSocket header only library.
[websocket++](https://github.com/zaphoyd/websocketpp)

This toolkit requires the following two open source packages that are not shipped with this toolkit due to the open source code distribution policies. Users of this toolkit must first understand the usage clauses stipulated by these two packages and then bring these open source packages on their own inside of this toolkit as explained below. This needs to be done only on the Linux machine(s) where the Streams application development i.e. coding, compiling and packaging is done. Only after doing that, users can use this toolkit in their Streams applications.

1. boost_1_73_0
   - Obtain the official boost version boost_1_73_0 from here:
           https://www.boost.org/users/history/version_1_73_0.html
   
   - A few .so files from the boost_1_73_0/lib directory are copied into the `impl/lib` directory of this toolkit.
       - (It is needed for the dynamic loading of these .so files when the Streams application using this toolkit is launched.)
       
   - The entire boost_1_73_0/include directory is copied into the `impl/include` directory of this toolkit. [Around 200 MB in size]
       - (It is needed for a successful compilation of the Streams application that uses this toolkit. Please note that these include files will not bloat the size of that application's SAB file since the `impl/include` directory will not be part of the SAB file.)
       
2. websocketpp v0.8.2
   - The entire websocketpp directory is copied into the `impl/include` directory of this toolkit. [Around 1.5 MB in size]
       - (It is needed for a successful compilation of the Streams application that uses this toolkit. Please note that these include files will not bloat the size of that application's SAB file  since the `impl/include` directory will not be part of the SAB file.)

## Downloading and building boost_1_73_0 or a higher version
i. Download and build boost 1_73_0 or a higher version in the user's Linux home directory by using the --prefix option as shown below:

   - Download boost_1_73_0 into your Linux home directory: 
      - `mkdir <YOUR_HOME_DIRECTORY>/boost-install-files`
      - `cd <YOUR_HOME_DIRECTORY>/boost-install-files`
      - `wget https://dl.bintray.com/boostorg/release/1.73.0/source/boost_1_73_0.tar.gz` [Approximately 1 minute]

   - Extract boost_1_73_0 in `<YOUR_HOME_DIRECTORY>/boost-install-files`:
      - `cd <YOUR_HOME_DIRECTORY>/boost-install-files`
      - `tar -xvzf <YOUR_HOME_DIRECTORY>/boost-install-files/boost_1_73_0.tar.gz` [Approximately 5 minutes]

   - Bootstrap boost_1_73_0 and install it in your home directory using the --prefix option:
      - `cd <YOUR_HOME_DIRECTORY>/boost-install-files/boost_1_73_0`
      - `./bootstrap.sh --prefix=<YOUR_HOME_DIRECTORY>/boost_1_73_0` [Approximately 1 minute]
      - `./b2 install --prefix=<YOUR_HOME_DIRECTORY>/boost_1_73_0 --with=all` [Approximately 5 minutes]
      - `cd <YOUR_HOME_DIRECTORY>`
      - `rm -rf <YOUR_HOME_DIRECTORY>/boost-install-files` [Approximately 2 minutes]

   - Instructions shown above are from this URL:
      - [C++ boost install instructions](https://gist.github.com/1duo/2d1d851f76f8297be264b52c1f31a2ab)

ii. After that, copy a few .so files from the `<YOUR_HOME_DIRECTORY>/boost_1_73_0/lib` directory into the `impl/lib` directory of this toolkit.
   - (libboost_chrono.so.1.73.0, libboost_random.so.1.73.0, libboost_system.so.1.73.0, libboost_thread.so.1.73.0)
    
   - For all those .so files you copied, you must also create a symbolic link within the `impl/lib` directory of this toolkit.
      - e-g: ln   -s    libboost_chrono.so.1.73.0    libboost_chrono.so

iii. Move the entire `<YOUR_HOME_DIRECTORY>/boost_1_73_0/include/boost` directory into the `impl/include` directory of this toolkit.
   
iv. At this time, you may delete the `<YOUR_HOME_DIRECTORY>/boost_1_73_0` directory.

## Downloading websocketpp 0.8.2
i. Download websocketpp v0.8.2 from [here](https://github.com/zaphoyd/websocketpp/releases) and extract it in your home directory first. Then move the `~/websocket-0.8.2/websocketpp` directory into the `impl/include` directory of this toolkit.
   - (websocket++ is a header only C++ library which has no .so files of its own. In that way, it is very convenient.)

ii. At this time, you may delete the `~/websocket-0.8.2` directory.

iii. If you observe either a missing or an empty streamsx.cppws/com.ibm.streamsx.cppws/impl/java/bin directory, then you should run `ant all` from the streamsx.cppws/com.ibm.streamsx.cppws directory. That will compile the HttpPost Java operator available in this toolkit.

## A must do in the Streams applications that will use this toolkit
i. You must add this toolkit as a dependency in your application.
   - In Streams Studio, you can add this toolkit location in the Streams Explorer view and then add this toolkit as a dependency inside your application project's Dependencies section.
       
   - In a command line compile mode, simply add the -t option to point to this toolkit's top-level or its parent directory.
       
ii. In Streams studio, you must double click on the BuildConfig of your application's main composite and then select "Other" in the dialog that is opened. In the "C++ compiler options", you must add the following.
   - `-I <Full path to your com.ibm.streamsx.cppws toolkit>/impl/include`
      - (e-g): `-I /home/xyz/streamsx.cppws/com.ibm.streamsx.cppws/impl/include`
       
   - In Streams studio, you must double click on the BuildConfig of your application's main composite and then select "Other" in the dialog that is opened. In the "Additional SPL compiler options", you must add the following.
      - `--c++std=c++11`
       
   - If you are building your application from the command line, please refer to the Makefile provided in the WebSocketSourceTester example shipped with this toolkit. Before using that Makefile, you must set the STREAMS_CPPWS_TOOLKIT environment variable to point to the full path of your streamsx.cppws/com.ibm.streamsx.cppws directory. To build your own applications, you can do the same as done in that Makefile.

## Example usage of this toolkit inside a Streams application:
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
This toolkit ships with the following examples that can be used as reference applications. These examples showcase the full feature set of the WebSocketSource, WebSocketSendReceive, WebSocketSink and the HttpPost operators that are available within this toolkit. Every example below will have the client and server-side application needed to test it. All the examples went through extensive testing in the IBM Streams lab in New York and they include excellent code documentation in the source files to guide the application/solution development engineers. More details about these examples can be obtained in a following section.

* [WebSocketSourceTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSourceTester)
* [WebSocketSourceWithResponseTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSourceWithResponseTester)
* [WebSocketSendReceiveTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSendReceiveTester)
* [WebSocketSinkTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/WebSocketSinkTester)
* [HttpPostTester](https://github.com/IBMStreams/streamsx.cppws/tree/master/samples/HttpPostTester)

In the `etc` sub-directory of every example shown above, there is a shell script that can be used to run a given example with synthetic data and then verify the application behavior and the result. That shell script was originally written for running a given example in the IBM Streams lab in New York. It is easy to make minor changes in that shell script and use it in any other IBM Streams environment for running a given example.

There is also an example WebSocket-based client application that can be run from a RHEL7 or CentOS7 machine to simulate data traffic to be sent to the WebSocketSourceTester application. That example client application is available in the streamsx.cppws/samples/WebSocketSourceTester/WSClientDataSimulator directory.
