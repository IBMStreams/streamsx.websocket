Sunday, Oct/04/2020
==========================================================
Custom visualiation of the IBM Streams application results
==========================================================
Quick brief
-----------
This is somewhat an involved IBM Streams application that has a few 
modular blocks of logic/code. That includes ingesting base64 encoded 
data files, identifying out of sequence events, performing Geofence, 
applying custom written event time based windowing for the analytics and 
incorporating a new way to visualize the results in a full-fledged 
web browser based custom dashboard application. So, learning about the 
full application logic will take a considerable amount of time. However, 
if the goal is simply to learn about how the custom visualization is done 
in the context of this application, then that is relatively simpler. 
One can understand the core visualiation idea and its implementation 
with a minimal effort. That learning can also be applied in other 
IBM Streams applications by focusing only on the final section inside the
main composite of this application.

Core idea
---------
IBM Streams applications are always developed with a common pattern in mind.
That is to ingest different kinds of data from disparate data sources such as
files, databases, queues, network etc. and then perform analytics on the
ingested data (filtering, transformation, enrichment, correlation,
pattern detection, scoring, alerting, notification etc.). As part of the 
data analytics, IBM Streams applications continuously generate results. 
Such results can be stored in files, databases, queues etc. in order to be used 
later. At the same time, results can also be visualized in real time in an external 
web browser or a thick client application with custom written dashboard, charts, 
plots, tables etc. The streamsx.websocket toolkit includes an example named 
CustomVisualization that shows how to visualize the results of your Streams application 
in a Web browser application that can fetch the results periodically to present it 
to the user in many possible ways. 

High-level concept
------------------
In your Streams application, all it requires is an addition of two operators.
One of them is a Custom operator that can receive various anlytics results
produced inside the Streams application and keep stroing them in its in-memory
state variables (list, map etc.). Then, the WebSocketSource operator available
in the streamsx.websocket toolkit can be used to provide a bi-directional 
data exchange between the Streams application and the external visualization
application. That operator can receive HTTP GET and POST requests from the
external visualization application and then feed it to the result collector
Custom operator that we discussed above. Based on the request received from the
external application, the result collector can serve the requested information to
the visualization application via the response path provided by the WebSocketSource 
operator. In fact, in addition to the application results, it can also serve 
html, css, js and image (png, ico, jpeg) files that are typically needed by a 
full-fledged web browser based application. This technical approach lends itself to 
develop a highly responsive and a highly interactive visualization application. 
A high-level conceptual diagram that explains this idea can be found in a file available 
in this example directory (IBM-Streams-Custom-Visualization-Concept.pdf).

This example in a nutshell
--------------------------
The CustomVisualiation example here represents a real-life use case where the 
Taxi location and Taxi booking details are ingested into IBM Streams. This application 
uses the Geospatial toolkit to identify the exact location (city and district) of the 
taxis and from where the bookings are made. It does detailed analytics to compute 
real-time metrics such as taxi counts (hired, available etc.) taxi booking details (new,
served, unserved, canceled etc.) and supply/demand alerts. The metrics are computed in
an event time based window and the results are continuously generated. When this application
is running, users can access a URL via a browser to visualize the results in a few possible
ways. In this Streams application's etc/webapp directory, developers can find the necessary
files that make up the browser-based visualization application. Developers will be required 
to have some level of understanding about html, css and Javascript to make sense out of 
those files. Specific visualization techniques used in the Javascript code employ the 
popular d3js library. In addition to fetching the results from the Streams application for 
real-time dashboarding, the web application also shows how to get the user input from the 
browser and post it to the Streams application for adjusting what kind of results are needed 
for the visualization as well as certain event time based window configuration such as the 
metrics montoring period. To understand this example's inner workings entirely, it will take 
a considerable amount of time. That is because of the very involved application logic
done for the analytics. But, just to focus on learning how to prepare any Streams 
application for custom visualization, you only have to understand the invocation of a few 
operators used inside the main composite of this application (TaxiMetrics.spl). Those 
operators can be found in a code section that has this comment string: 
START OF VISUALIZING THE RESULTS IN A WEB APP

In addition to reviewing the logic in those two operators, you can start from the
etc/webapp/html/main.html file and see how the web application logic is built with the
help of the supporting css and js (JavaScript) files.

If your goal is to only understand the technical ideas and the code logic used for 
visualizing the results generated by this example without really running and seeing how 
this application works end-to-end on IBM Streams and in the web browser, then you can skip 
the sections below. If you want to run this example and see the visualization of the results, 
then you can use the following sections.

External dependencies for this example
--------------------------------------
This example has an external toolkit dependency and an external test data dependency.

a) To build and run this example, an enhanced version of the IBM Streams Geospatial 
toolkit is needed (v3.4.3.1). It is available in the following URL for download from
a browser or via the wget command. You have to extract it in your Linux machine where 
you plan to compile this example. After extraction, it will require 17MB of disk space.

https://github.com/IBMStreams/streamsx.websocket/releases/download/v1.0.9/com.ibm.streams.geospatial-v3.4.3.1.tar.gz

b) To run this example, we need realistic test data files that contain taxi location and
taxi booking details for a period of 2.5 days (July/04/2020 to July/06/2020).
These data files are available inside a compressed file (393MB in size) in the following
URL for download from a browser or via the wget command. You have to extract it in your 
Linux machine from where you plan to run this example. After extraction, it will require 
1.8GB of disk space.

https://github.com/IBMStreams/streamsx.websocket/releases/download/v1.0.9/Custom-Viz-Test-Data.tar.gz

Building this example
---------------------
a) From the command line of a terminal window using the Makefile:
You can either directly build it inside the 
streamsx.websocket/samples/CustomVisualization directory or take a copy of that
entire directory elsewhere and build it from there. You have to ensure that you have
your TLS/SSL certificate copied as ws-server.pem in the etc sub-directory of this example.
After that, You have to edit the Makefile provided in this example to point to the correct 
directories for the required toolkit dependencies, save and then run "make clean" and "make".

(OR)

b) Importing into your IBM Streams Studio:
[Please follow these steps to import and build it correctly.]

i) At first, you have to make sure that you have the required toolkit dependencies 
[websocket, json and geospatial] in your Streams Studio. 

ii) In a terminal window, copy recursively the entire 
streamsx.websocket/samples/CustomVisualization directory into your 
Streams Studio workspace directory i.e. cp -ufrp <source-dir> <destination-dir>

iii) You have to ensure that you have your TLS/SSL certificate copied as 
ws-server.pem in the etc sub-directory of this example.

iv) Before importing it, you should rename the Makefile present in this example's 
top-level directory in your Streams Studio workspace to Makefile.org  
i.e. mv  Makefile  Makefile.org. This step will avoid certain build errors while 
importing it within Streams Studio.

v) From your IBM Streams Studio, you can select File->Import and select 
IBM Streams Studio-->SPL Project and click Next. In the resulting dialog, 
click Browse and select your workspace directory and click OK. In the list of
SPL projects shown, select CustomVisualization and click Finish. If it prompts
you to overwrite existing files, select "Yes To All".

vi) Right after the import, it may try an external builder by default and give a 
few errors which you can ignore and clear the console.

vii) In the Project Explorer view, expand the top-level CustomVisualization project and then
expand the namespace (com.ibm.streamsx.....) under that. Then, right click on the TaxiMetrics 
main composite and select New-->Build Configuration and then enter --c++std=c++11 in the 
Other-->Additional SPL compiler options field and click OK. At this point, it should correctly 
start an internal build as opposed to trying to use the external Makefile. It will take around 
10 minutes for the build to complete. Please ensure that the build is successful.

Running this example
--------------------
You can launch it in Distributed mode either from your Streams Studio or from a 
command line via streamtool. You have to ensure that the following submission time 
parameters are set to the correct values.

TaxiBookingDirectory (e-g: /home/usr1/Custom-Viz-Test-Data/taxiBooking)
TaxiLocationDirectory (e-g: /home/usr1/Custom-Viz-Test-Data/taxiLocation)

Once this appliation is running healthy, you have to test it quickly before the limited 
amount of test data runs out. Open a broswer tab and give this URL. If the page fails to load,
you may want to ensure the machine name and port number are correct. It could also fail to
load until the configured amount of initDelay is completed. You can verify them and 
try to load the page after 15 seconds of initDelay.

http://<YourStreamsMachineNameOrIpAddress>:8081/viz/main.html

You can click the "Select Community" tab and then adjust the monitoring interval to 
5 minutes, select a district (e-g: Bur Dubai), select "Start Monitoring" and click
on the Confirm button. Now, you can go to the other tabs to visualize different kinds
of results generated by the Streams application.
==========================================================
