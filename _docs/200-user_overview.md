---
title: "Toolkit Usage Overview"
permalink: /docs/user/overview/
excerpt: "How to use this toolkit."
last_modified_at: 2023-01-30T17:28:48+01:00
redirect_from:
   - /theme-setup/
sidebar:
   nav: "userdocs"
---
{% include toc %}
{%include editme %}

## Satisfying the toolkit requirements
As explained in the "Toolkit Overview [Technical]" section, this toolkit requires network connectivity to connect to the external applications with whom it will help us to do data exchange. In addition, it also requires you to download and install the boost_1_73_0 as well as the websocketpp version 0.8.2 on the IBM Streams application development machine where the application code is compiled to create the application bundle (SAB). These two C++ libraries form the major external dependency for this toolkit. 

Bulk of the WebSocket logic in this toolkit's operators relies on the following open source C++ WebSocket header only library.
[websocket++](https://github.com/zaphoyd/websocketpp)

This toolkit requires the following two open source packages that are not shipped with this toolkit due to the open source code distribution policies. Users of this toolkit must first understand the usage clauses stipulated by these two packages and then bring these open source packages on their own inside of this toolkit as explained below. This needs to be done only on the Linux machine(s) where the Streams application development i.e. coding, compiling and SAB packaging is done. Only after doing that, users can use this toolkit in their Streams applications.

1. boost_1_73_0
   - Obtain the official boost version boost_1_73_0 from here:
           https://www.boost.org/users/history/version_1_73_0.html
   
   - A few .so files from the boost_1_73_0/lib directory are copied into the `lib` directory of this toolkit.
       - (It is needed for the dynamic loading of these .so files when the Streams application using this toolkit is launched.)
       
   - The entire boost_1_73_0/include directory is copied into the `include` directory of this toolkit. [Around 200 MB in size]
       - (It is needed for a successful compilation of the Streams application that uses this toolkit. Please note that these include files will not bloat the size of that application's SAB file since the `include` directory will not be part of the SAB file.)
       
2. websocketpp v0.8.2
   - The entire websocketpp directory is copied into the `include` directory of this toolkit. [Around 1.5 MB in size]
       - (It is needed for a successful compilation of the Streams application that uses this toolkit. Please note that these include files will not bloat the size of that application's SAB file  since the `include` directory will not be part of the SAB file.)
       - You can obtain the official version 0.8.2 from this URL: https://github.com/zaphoyd/websocketpp/archive/refs/tags/0.8.2.tar.gz

3. Open SSL libraries in Linux
   - On all your IBM Streams application machines, you have to ensure that the openssl-devel-1.0.2k-12 and openssl-libs-1.0.2k-12 (or a higher version) are installed. This can be verified via this command: `rpm -qa | grep -i openssl`

## Downloading the dependencies and building the toolkit
This toolkit is packaged with a comprehensive build.xml automation file that will help the users in downloading and building the toolkit in order to make it ready for use. Users will need network connectivity to the Internet from their Linux Streams application development machine(s) along with the open source ant tool. All that a user needs to do is to download and extract an official release version of this toolkit from the [IBMStreams GitHub](https://github.com/IBMStreams/streamsx.websocket/releases) and then run the following commands in sequence from the top-level directory (e-g: streamsx.websocket) of this toolkit.

1. `ant clean-total`           [Approximately 2 minutes]
2. `ant all`                   [Approximately 8 minutes]
3. `ant download-clean`        [Approximately 2 minutes]

If all those commands ran successfully, this toolkit is ready for use.

If there is no direct Internet access from the IBM Streams machine and if there is a need to go through a proxy server, then the `ant all` command may not work. In that case, you can try this procedure. 

1. `ant clean-total`
 
2. Now, you can download or wget the two external packages (websocketpp-0.8.2.tar.gz and boost-1.73.0.tar.gz) on your own from any Windows or Mac or Linux box that has Internet connection from the URLs shown above and then you can copy those two tar.gz files manually to your Linux machine's toolkit directory as `streamsx.websocket/ext/0.8.2.tar.gz` and `streamsx.websocket/ext/boost-install-files/boost-1.73.0.tar.gz`.  [Please note that the websocketpp package should be named as `0.8.2.tar.gz`] After that, from inside the streamsx.websocket directory you can run the following "ant all" command with additional parameters.
 
`ant all -Dwebsocket.archive=file://localhost$(pwd)/ext -Dwebsocket.version=0.8.2 -Dboost.archive.src0=file://localhost$(pwd)/ext/boost-install-files/boost-1.73.0.tar.gz`
 
3. If the build is successful, you can now run this command.
    `ant download-clean`

## A must do in the Streams applications that will use this toolkit
i. You must add this toolkit as a dependency in your application.
   - In Streams Studio, you can add this toolkit location in the Streams Explorer view and then add this toolkit as a dependency inside your application project's Dependencies section.
       
   - In a command line compile mode, simply add the -t option to point to this toolkit's top-level or its parent directory.
       
ii. In Streams studio, you must double click on the BuildConfig of your application's main composite and then select "Other" in the dialog that is opened. In the "Additional SPL compiler options", you must add the following. Please note that there is nothing that needs to be entered in the other two C++ compiler and linker options in that same dialog box.

   - `--c++std=c++11`
       
iii. If you are building your application from the command line, please refer to the Makefile provided in the WebSocketSourceTester example shipped with this toolkit. Before using that Makefile, you must set the STREAMS_WEBSOCKET_TOOLKIT environment variable to point to the full path of your streamsx.websocket/com.ibm.streamsx.websocket directory. To build your own applications, you can do the same as done in that Makefile.

## Example usage of this toolkit inside a Streams application:
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
This toolkit ships with the following examples that can be used as reference applications. These examples showcase the full feature set of the WebSocketSource, WebSocketSendReceive, WebSocketSink and the HttpPost operators that are available within this toolkit. Every example below will have the client and server-side application needed to test it. All the examples went through extensive testing in the IBM Streams lab in New York and they include excellent code documentation in the source files to guide the application/solution development engineers. More details about these examples can be obtained in a following section.

* [WebSocketSourceTester](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/WebSocketSourceTester)
* [WebSocketSourceWithResponseTester](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/WebSocketSourceWithResponseTester)
* [WebSocketSendReceiveTester](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/WebSocketSendReceiveTester)
* [WebSocketSinkTester](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/WebSocketSinkTester)
* [HttpPostTester](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/HttpPostTester)
* [CustomVisualization](https://github.com/IBMStreams/streamsx.websocket/tree/develop/samples/CustomVisualization)

In the `etc` sub-directory of every example shown above, there is a shell script that can be used to run a given example with synthetic data and then verify the application behavior and the result. That shell script was originally written for running a given example in the IBM Streams lab in New York. It is easy to make minor changes in that shell script and use it in any other IBM Streams test environment for running a given example.

There is also an example WebSocket C++ client application that can be run from a RHEL7 or CentOS7 machine to simulate data traffic to be sent to the WebSocketSourceTester application. That example client application is available in the streamsx.websocket/samples/WebSocketSourceTester/WSClientDataSimulator directory.

## Importing this toolkit and its built-in examples into IBM Streams Studio
1. Build the `streamsx.websocket` toolkit using the three ant commands mentioned in the previous section.

2. In Streams Studio, select `File->Import->IBM Streams Studio->SPL Project` and click `Next`.

3. In the resulting dialog box, click `Browse` and then select the `streamsx.websocket` directory from where you ran those ant commands.

4. Now, it should list the `com.ibm.streamsx.websocket` project which you must select and click `Finish`. It will take about 8 minutes to take a copy of that entire project into your Streams Studio workspace.

5. From your Streams Studio's Project Explorer view, right click on the `com.ibm.streamsx.websocket` project and select `Properties`. In the resulting dialog box, select `Java Build Path` from its left pane. In its right pane, select the `Libraries` tab and click `Add JARs` button. In the resulting `JAR Selection` dialog box, navigate to your `com.ibm.streamsx.websocket/opt/HTTPClient-x.y.z/lib` and select all the jar files present there and click `OK`. Now, click `Apply` and click `OK`.

6. At this time, the `com.ibm.streamsx.websocket` project in your Streams Studio workspace is ready to be added as a dependency in any of your own applications that want to use the WebSocket operators.


We will also show here the steps needed to import one of the built-in examples. You can use similar steps for other examples as well.

1. In Streams Studio, select `File->Import->IBM Streams Studio->SPL Project` and click `Next`.

2. In the resulting dialog box, click `Browse` and then select the `streamsx.websocket->samples` directory. (This is the location where you ran those ant commands earlier).

3. Now, it should list all the available examples from which you can select an example project that you want and click `Finish`.

4. You have to change the SPL build of the imported project from an External Builder to an Internal Builder. You can do that by right clicking on that imported project and then selecting `Configure SPL Build`. In the resulting dialog box, you can change the `Builder type` from an `External builder` to `Streams Studio internal builder`. Click `OK`.

5. Now, expand your imported top-level project, expand the namespace below it and then right-click the main composite name below it and select `New->Build Configuration`. (You have to do it for every main composite present in a given example.)

6. In the resulting dialog box, select `Other` and enter `--c++std=c++11` in the `Additional SPL compiler options` field. Click `OK`.

7. Your imported example project should build correctly now.
