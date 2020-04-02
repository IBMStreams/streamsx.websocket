/*
==============================================
# Licensed Materials - Property of IBM
# Copyright IBM Corp. 2018, 2019
==============================================
*/

/*
==============================================
First created on: Feb/24/2020
Last modified on: Apr/01/2020

This C++ example below can be used to generate data traffic to test the
streamsx.cppws toolkit example named WebSocketSourceTester.
(i.e. test it using non-tls endpoint i.e. plain WebSocket with no security)
This C++ application is useful to test the IBM Streams application mentioned above in the
absence of a full fledged remote client test infrastructure. This C++ application
can become handy to test the streamsx.cppws toolkit's WebSocketSource operator.
So, this application will mimic the way a real client application will
interact with the IBM Streams application that is ready to ingest data from remote WebSocket client.
This data simulator does it by being able to send text (plain text, JSON or XML) or binary blob messages.

When this application is run, it will read fragments of data from a
given file (text or binary) and send it over a websocket connection established
with the IBM Streams application that runs the WebSocketSource (server side) operator.


This example code can be built and run from a Linux terminal window by 
using the steps shown below.

IMPORTANT
---------
[
This client is mainly used to test the WebSocketSource from the streamsx.cppws toolkit or
the WebSocketInject from the streamsx.inetserver toolkit.

I actually took a copy of the WSClientDataSimulator.cpp file into WSClientDataSimulator-NoTLS.cpp and
then modified the code little bit to make it work in a non-TLS mode i.e. plain WebSocket with no security.

In the C++ code below in this file, you can search for /////-->TLS to find out in which places
I commented out the TLS specific code.
]

1) Ensure that you have installed boost_1_69_0 as explained in the streamsx.cppws toolkit documentation.

2) Ensure that you have installed websocket++ v0.8.1 or higher as explained in the streamsx.cppws documentation.

3) Edit the Makefile-NoTLS in the same directory as this file and change the LD_LIBRARY_PATH to your C++ boost_1_69_0 lib directory in order to link to the Boost ASIO.

4) Edit the Makefile-NoTLS in the same directory as this file and change the WEBSOCKETPP_INSTALL_DIR to your websocketpp v0.8.1 installation directory.

5) Compile this test application by running the "make -f Makefile-NoTLS" command.

6) Once it is compiled, you can run it to send speech messages read from specific test data files to the WebSocketSourceTester
application running in IBM Streams. You can use the WAV files available from the audio-files directory in the samples
directory of the streamsx.sttgateway toolkit to send binary data. You can use reasonably sized text files (3K or higher)
stored in any directory to send text data. You can open multiple Linux terminal windows (e-g: 10 of them) and then
run this application in quick succession from those terminal windows to send concurrent requests and test how the
Streams application handles concurrent requests to receive data via WebSocket. If it all works reliably,
then the IBM Streams application can be connected to the real client application traffic to perform the intended operation.
Other possibility is to write a bash shell script and invoke this application 10 times from there to run in the background mode.

This application takes the following command line arguments:
WebSocket URL
Binary or text file name
bin or txt  [To indicate if it is a binary or text file]
Binary or text content block size in bytes to send at a time
Delay in milliseconds needed in between sending the data content blocks
Number of messages to send between verifying an ack from the server
Loop count for repeated sending of the same file content

Note
----
Single client application such as this one can only send a limited number of
messages per second to the server even though the remote server can have much
higher capacity to receive more messages per second. To really prove the
power of the remote server's message ingest capacity, it may be necessary to
make this client application to send messages in parallel from multiple
threads or run multiple copies of this client application in parallel.

Tips on load testing with parallel senders
---- -------------------------------------
This application will wait indefinitely until the user specified binary or
text file appears in the specified directory. This is a good way to run
parallel data simulators. You can start this application from multiple
terminal windows and then copy the big binary or text file that you want to
test with in the directory location specified when launching this application.
That will make multiple data senders to fire data at around the same time by
sending multiple data packets to the WebSocketSourceTester application.
That will test the ingestion rate of the WebSocketSource operator.

Please note in the code logic below that this test application will also keep receiving an acknowledgment signal from
the remote WebSocket server application if that IBM Streams application is configured to send back
an acknowledgment after receiving certain number of messages from every client. Such an acknowledgment signal
can be used to detect any server side crash or network error and start retransmitting the unacknowledged
block of messages. That means this test application must be changed to keep a history or cache of
certain number of previously transmitted messages until an acknowledgment arrives. If there is an absence of
acknowledgment, then this test client application can retrieve the previously sent messages and
send them again. Whenever it receives an acknowledgment, it can keep clearing its history/cache that
holds the previously sent and not yet acknowledged messages.

Example invocation of this application is shown below:
./wsclient-NoTLS.o http://b0513:8080 /tmp/test1.wav bin 3500 5 8000 1000000

==============================================
*/

// websocketpp related include files are a must for this client application.
/////-->TLS
/*
#include <websocketpp/config/asio_client.hpp>
*/

// You must comment out the following line if TLS is needed.
#include <websocketpp/config/asio_no_tls_client.hpp>
#include <websocketpp/client.hpp>

#include <iostream>

#include <websocketpp/common/thread.hpp>
#include <websocketpp/common/memory.hpp>

// Typedef to shorten the long template names.
/////-->TLS
/*
typedef websocketpp::client<websocketpp::config::asio_tls_client> client;
typedef std::shared_ptr<boost::asio::ssl::context> context_ptr;
// We will need these websocketpp namespaces in this application.
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::bind;
*/

// You must comment out the following line if TLS is needed.
typedef websocketpp::client<websocketpp::config::asio_client> client;

#include <cstdlib>
#include <iostream>
#include <fstream>
#include <map>
#include <string>
#include <sstream>
#include <unistd.h>

/////-->TLS
/*
// We need this to enable TLS on the websocket client side i.e. this application.
context_ptr on_tls_init() {
       // establishes a TLS connection
       context_ptr ctx = std::make_shared<boost::asio::ssl::context>(boost::asio::ssl::context::sslv23);

       try {
          ctx->set_options(boost::asio::ssl::context::default_workarounds |
                         boost::asio::ssl::context::no_sslv2 |
                         boost::asio::ssl::context::no_sslv3 |
                         boost::asio::ssl::context::single_dh_use);
       } catch (std::exception &e) {
           std::cout << "Error in context pointer: " << e.what() << std::endl;
       }

       return ctx;
}
*/

// websocketpp client connection related class.
class connection_metadata {
public:
    typedef websocketpp::lib::shared_ptr<connection_metadata> ptr;

    connection_metadata(int id, websocketpp::connection_hdl hdl, std::string uri)
      : m_id(id)
      , m_hdl(hdl)
      , m_status("Connecting")
      , m_uri(uri)
      , m_server("N/A")
    {}

    void on_open(client * c, websocketpp::connection_hdl hdl) {
        m_status = "Open";

        client::connection_ptr con = c->get_con_from_hdl(hdl);
        m_server = con->get_response_header("Server");
    }

    void on_fail(client * c, websocketpp::connection_hdl hdl) {
        m_status = "Failed";

        client::connection_ptr con = c->get_con_from_hdl(hdl);
        m_server = con->get_response_header("Server");
        m_error_reason = con->get_ec().message();
    }
    
    void on_close(client * c, websocketpp::connection_hdl hdl) {
        m_status = "Closed";
        client::connection_ptr con = c->get_con_from_hdl(hdl);
        std::stringstream s;
        s << "close code: " << con->get_remote_close_code() << " (" 
          << websocketpp::close::status::get_string(con->get_remote_close_code()) 
          << "), close reason: " << con->get_remote_close_reason();
        m_error_reason = s.str();
    }

    void on_message(websocketpp::connection_hdl, client::message_ptr msg) {
        if (msg->get_opcode() == websocketpp::frame::opcode::text) {
            m_messages.push_back("<< " + msg->get_payload());
            m_recent_message_received = msg->get_payload();
            // Comment or uncomment the following line for your debug needs.
            // std::cout << "Message Received = " << m_recent_message_received << std::endl;
        } else {
            m_messages.push_back("<< " + websocketpp::utility::to_hex(msg->get_payload()));
        }
    }

    websocketpp::connection_hdl get_hdl() const {
        return m_hdl;
    }
    
    int get_id() const {
        return m_id;
    }
    
    std::string get_status() const {
        return m_status;
    }

    void record_sent_message(std::string message) {
        m_messages.push_back(">> " + message);
    }

    std::string get_recent_message_received() {
       // When the application logic queries here for the most
       // recently received message, we will deliver it only once.
       // Since it is being now returned to the application logic,
       // we will reset our member variable to an empty string.
       std::string msg = m_recent_message_received;
       m_recent_message_received = "";
       return msg;
    }

    friend std::ostream & operator<< (std::ostream & out, connection_metadata const & data);
private:
    int m_id;
    websocketpp::connection_hdl m_hdl;
    std::string m_status;
    std::string m_uri;
    std::string m_server;
    std::string m_error_reason;
    std::vector<std::string> m_messages;
    std::string m_recent_message_received;
};

// Operator overloading.
std::ostream & operator<< (std::ostream & out, connection_metadata const & data) {
    out << "> URI: " << data.m_uri << "\n"
        << "> Status: " << data.m_status << "\n"
        << "> Remote Server: " << (data.m_server.empty() ? "None Specified" : data.m_server) << "\n"
        << "> Error/close reason: " << (data.m_error_reason.empty() ? "N/A" : data.m_error_reason) << "\n";
    out << "> Messages Processed: (" << data.m_messages.size() << ") \n";

    std::vector<std::string>::const_iterator it;
    for (it = data.m_messages.begin(); it != data.m_messages.end(); ++it) {
        out << *it << "\n";
    }

    return out;
}

// websocketpp endpoint class that manages everything that
// happens between this client application and the remote server via WebSocket.
class websocket_endpoint {
public:
    websocket_endpoint () : m_next_id(0) {
        m_endpoint.clear_access_channels(websocketpp::log::alevel::all);
        m_endpoint.clear_error_channels(websocketpp::log::elevel::all);

        m_endpoint.init_asio();
        /////-->TLS
        /*
        // Sep/11/2019 Senthil added the following code block.
        m_endpoint.set_tls_init_handler(bind(&on_tls_init));
        */

        m_endpoint.start_perpetual();

        m_thread = websocketpp::lib::make_shared<websocketpp::lib::thread>(&client::run, &m_endpoint);
    }

    ~websocket_endpoint() {
        m_endpoint.stop_perpetual();
        
        for (con_list::const_iterator it = m_connection_list.begin(); it != m_connection_list.end(); ++it) {
            if (it->second->get_status() != "Open") {
                // Only close open connections
                continue;
            }
            
            std::cout << "> Closing connection " << it->second->get_id() << std::endl;
            
            websocketpp::lib::error_code ec;
            m_endpoint.close(it->second->get_hdl(), websocketpp::close::status::going_away, "", ec);
            if (ec) {
                std::cout << "> Error closing connection " << it->second->get_id() << ": "  
                          << ec.message() << std::endl;
            }
        }
        
        m_thread->join();
    }

    int connect(std::string const & uri) {
        websocketpp::lib::error_code ec;

        client::connection_ptr con = m_endpoint.get_connection(uri, ec);

        if (ec) {
            std::cout << "> Connect initialization error: " << ec.message() << std::endl;
            return -1;
        }

        int new_id = m_next_id++;
        connection_metadata::ptr metadata_ptr = websocketpp::lib::make_shared<connection_metadata>(new_id, con->get_handle(), uri);
        m_connection_list[new_id] = metadata_ptr;

        con->set_open_handler(websocketpp::lib::bind(
            &connection_metadata::on_open,
            metadata_ptr,
            &m_endpoint,
            websocketpp::lib::placeholders::_1
        ));
        con->set_fail_handler(websocketpp::lib::bind(
            &connection_metadata::on_fail,
            metadata_ptr,
            &m_endpoint,
            websocketpp::lib::placeholders::_1
        ));
        con->set_close_handler(websocketpp::lib::bind(
            &connection_metadata::on_close,
            metadata_ptr,
            &m_endpoint,
            websocketpp::lib::placeholders::_1
        ));
        con->set_message_handler(websocketpp::lib::bind(
            &connection_metadata::on_message,
            metadata_ptr,
            websocketpp::lib::placeholders::_1,
            websocketpp::lib::placeholders::_2
        ));

        m_endpoint.connect(con);

        return new_id;
    }

    void close(int id, websocketpp::close::status::value code, std::string reason) {
        websocketpp::lib::error_code ec;
        
        con_list::iterator metadata_it = m_connection_list.find(id);
        if (metadata_it == m_connection_list.end()) {
            std::cout << "> No connection found with id " << id << std::endl;
            return;
        }
        
        m_endpoint.close(metadata_it->second->get_hdl(), code, reason, ec);
        if (ec) {
            std::cout << "> Error initiating close: " << ec.message() << std::endl;
        }
    }

    void send(int id, std::string message) {
        websocketpp::lib::error_code ec;
        
        con_list::iterator metadata_it = m_connection_list.find(id);
        if (metadata_it == m_connection_list.end()) {
            std::cout << "> No connection found with id " << id << std::endl;
            return;
        }
        
        m_endpoint.send(metadata_it->second->get_hdl(), message, websocketpp::frame::opcode::text, ec);
        if (ec) {
            std::cout << "> Error sending message: " << ec.message() << std::endl;
            return;
        }
        
        metadata_it->second->record_sent_message(message);
    }

    void sendBinary(int id, std::string message) {
        websocketpp::lib::error_code ec;
        
        con_list::iterator metadata_it = m_connection_list.find(id);
        if (metadata_it == m_connection_list.end()) {
            std::cout << "> No connection found with id " << id << std::endl;
            return;
        }
        
        m_endpoint.send(metadata_it->second->get_hdl(), message, websocketpp::frame::opcode::binary, ec);
        if (ec) {
            std::cout << "> Error sending message: " << ec.message() << std::endl;
            return;
        }
        
    }

    connection_metadata::ptr get_metadata(int id) const {
        con_list::const_iterator metadata_it = m_connection_list.find(id);
        if (metadata_it == m_connection_list.end()) {
            return connection_metadata::ptr();
        } else {
            return metadata_it->second;
        }
    }

    std::string get_recent_message_received(int id) {
        con_list::const_iterator metadata_it = m_connection_list.find(id);

        if (metadata_it == m_connection_list.end()) {
            return std::string("");
        } else {
            return (metadata_it->second->get_recent_message_received());
        }  
    }    


private:
    typedef std::map<int,connection_metadata::ptr> con_list;

    client m_endpoint;
    websocketpp::lib::shared_ptr<websocketpp::lib::thread> m_thread;

    con_list m_connection_list;
    int m_next_id;
};

// Entry point into this client application.
int main(int argc, char *argv[]) {
    // We are going to make a single WebSocket connection to the IBM Streams application that
	// invokes the streamsx.cppws WebSocketSource operator.
    if (argc < 7) {
       // User didn't give the required arguments.
       std::cout << "Usage: ./wsclient-NoTLS.o  <WebSocket Server URL> <Binary or text file name> <bin or txt> <Data content block size in bytes to send at a time> <Delay in milliseconds between sending data content blocks> <Number of messages to send between verifying an ack from the server> <Loop count for repeated sending of the same file content>" << std::endl;
       std::cout << "Example: ./wsclient-NoTLS.o http://b0513:8080 /tmp/test1.wav bin 3500 5 8000 1000000" << std::endl;
       return(0);
    }

    // Parse the command line arguments.
    std::string wsUrl = std::string(argv[1]);
    std::string dataFileName = std::string(argv[2]);
    std::string binOrTxtIndicator = std::string(argv[3]);
    int32_t dataBlockSize = atoi(argv[4]);
    int32_t delayBetweenSendingDataContentBlocks = atoi(argv[5]);
    int32_t numberOfMessagesToSendBeforeAnAck = atoi(argv[6]);
    int32_t loopCountForRepeatedSendingOfTheFileContent = atoi(argv[7]);
    unsigned int microseconds = 1 * 1000 * 1000;

    // Do a validation of this particular user input.
    if (loopCountForRepeatedSendingOfTheFileContent < 1) {
    	std::cout <<
    		"> Loop count for repeated sending of the file content should be >= 1." <<
			std::endl;
    }

    // Open the WebSocket connection to the given URL.
    websocket_endpoint endpoint1;

    int con_id1 = endpoint1.connect(wsUrl);

    if (con_id1 != -1) {
       std::cout << "> Created connection with id " << con_id1 << std::endl;
    } else {
      // Unable to create a connection.
      return(0);
    }

    // Wait for three seconds and check the status of the connection.
    microseconds = 3 * 1000 * 1000;
    usleep(microseconds);

    // Validate the connection opened with the remote WebSocket server to see if it is really there.
    connection_metadata::ptr metadata = endpoint1.get_metadata(con_id1);

    if (metadata) {
       std::stringstream ss;
       ss << *metadata;
       std::string myStr = ss.str();
       std::size_t found = myStr.find("Status: Open");
       // Comment or uncomment the following line for your debug needs.
       // std::cout << "myStr=" << myStr << std::endl;

       if (found == std::string::npos) {
          std::cout << "Connection id " << con_id1 <<
             " is not valid. It failed to open." << std::endl;
          return(0);       
       }
    } else {
       std::cout << "> Unknown connection id " << con_id1 << std::endl;
       return(0);
    }

    // Comment or uncomment the following line for your debug needs.
    std::cout << "> Connection established with the remote server " <<
    	wsUrl << ", Connection Id=" << con_id1 <<
		". Waiting for the " << dataFileName <<
		" file to become available." << std::endl;

    // Check and wait for the file existence before attempting to read the audio data.
    while(true) {
    	struct stat fileStat;
    	int32_t fileStatReturnCode = stat(dataFileName.c_str(), &fileStat);

		if (fileStatReturnCode != 0) {
		   // File not found.
		   // std::cout << dataFileName << " is not there." << std::endl;
			// Wait for 10 milliseconds and continue this loop.
		    microseconds = 10 * 1000;
		    usleep(microseconds);
		    continue;
		} else {
			break;
		}
    } // End of while(true)

    // Wait for 5 seconds for the data file to be fully copied.
    microseconds = 5 * 1000 * 1000;
    usleep(microseconds);

    // We can now read the data file and send blocks (chunks) of  data
    // File is present. Read the binary or text data now.
    std::ifstream input(dataFileName.c_str(),
    	(binOrTxtIndicator == "bin" ? std::ios::binary : std::ios::in));
    std::vector<char> buffer((std::istreambuf_iterator<char>(input)), 
       (std::istreambuf_iterator<char>()));

    // We will send user specified bytes of chunks alternatively to both the channels.
    // Get a plain C buffer of the binary content now.
    char *p = buffer.data();
    int32_t bufSize = buffer.size();
    int32_t chunkStart = 0;
    int32_t chunkSize = 0;
    bool sendItToFirstChannel = true;
    std::cout << "Data content is being sent now. (" << bufSize << " bytes)" << std::endl;
    int32_t numberOfMessagesSent = 0;
    int32_t fileSize = bufSize;
    int32_t loopCnt = loopCountForRepeatedSendingOfTheFileContent;

    // Stay in a loop and send the data now.
    // If the user asked for the same file content to be sent
    // repeatedly in a loop, let us also do that.
    for(int32_t cnt=1; cnt <= loopCnt; cnt++) {
       chunkSize = (bufSize >= dataBlockSize) ? dataBlockSize : bufSize;
       std::string msg = std::string(&p[chunkStart], chunkSize);
          
       // Send it now.
       if (binOrTxtIndicator == "bin") {
    	   endpoint1.sendBinary(con_id1, msg);
       } else {
    	   endpoint1.send(con_id1, msg);

       }

       // Wait for the request amount of time between data chunks.
       microseconds = delayBetweenSendingDataContentBlocks * 1000;
       usleep(microseconds);
          
       // Re-adjust the buffer start position.
       chunkStart += chunkSize;
       // Deduct the bytes already sent from the bufSize.
       bufSize -= chunkSize;
       numberOfMessagesSent++;

       if (bufSize <= 0) {
    	   bufSize = fileSize;
    	   chunkStart = 0;
       }


       // Uncomment this to debug as needed.
       /*
       std::cout << numberOfMessagesToSendBeforeAnAck <<
          ", " << numberOfMessagesSent << ", " <<
		  (numberOfMessagesSent % numberOfMessagesToSendBeforeAnAck) << ".\r";
	   */

	   // The following dummy cout is important to get the following acknowledge verification logic to work.
       // Without this cout, I found in my testing that the ack check only happened for every 15K messages.
       // I have no idea why adding this dummy cout resolves that problem. So, don't remove this line.
	   std::cout << "\r";

       if (numberOfMessagesToSendBeforeAnAck > 0 &&
    	   (numberOfMessagesSent % numberOfMessagesToSendBeforeAnAck == 0)) {
    	   // It is time to verify an ack from the server.
    	   // Wait for 300 msec..
    	   microseconds = 300 * 1000;
    	   usleep(microseconds);

    	   std::string response = endpoint1.get_recent_message_received(con_id1);
    	   // Comment or uncomment the following line for your debug needs.
    	   // std::cout << "Response from server = " << response << std::endl;
    	   //
    	   // The following response comes from the WebSocketSource operator.
    	   std::size_t found = response.find("Ack. Received messages count: ");
    	   //
    	   // The following response comes from the WebSocketInject operator.
    	   // std::size_t found = response.find("{\"control\":{");

    	   if (found == std::string::npos) {
    	      // We didn't get the expected 'response.
    	      std::cout << "Didn't receive an ack from the server after sending " << numberOfMessagesSent << " messages.\r";
    	      // ****** IMPORTANT ****** ATTENTION ****** IMPORTANT ****** ATTENTION ******
    	      // This is where you will do additional logic and make arrangements to
    	      // retransmit the previously sent messages for which no ack came from the remote server.
    	      // It will be required to maintain a history or cache of the messages that were
    	      // sent previously until an ack arrives.
    	      //  ****** IMPORTANT ****** ATTENTION ****** IMPORTANT ****** ATTENTION ******
    	   } else {
    	      // We got an ack.
    	      std::cout << "Received an ack from the server after sending " << numberOfMessagesSent << " messages.      \r";
    	   }
       }
    } // End of for loop
    
    std::cout << "" << std::endl;
    std::cout << "" << std::endl;
    std::cout << "File content is fully sent for " <<
    	loopCnt << " time(s) with a total of " <<
		numberOfMessagesSent << " messages." << std::endl;
    // We are done sending the data.
    // Wait for 7 seconds before closing the WebSocket connection.
    microseconds = 7 * 1000 * 1000;
    usleep(microseconds);

    // At this point, close the WebSocket connection that we opened.
    int close_code = websocketpp::close::status::normal;
    std::string reason;
    std::stringstream ss;
            
    ss >> con_id1 >> close_code;
    std::getline(ss,reason);        
    endpoint1.close(con_id1, close_code, reason);
    std::cout << "WebSocket connection is now closed." << std::endl;

    // Wait for 3  seconds before exiting the application..
    microseconds = 3 * 1000 * 1000;
    usleep(microseconds);
    // We can exit now.
    return(0);
}
