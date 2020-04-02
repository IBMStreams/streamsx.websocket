Changes
=======
## v1.0.3:
* Apr/01/2020
* Changed the boost asio server to use tlsv1.2.
* Changed the WSClientDataSimulator to use tlsv1.2.
* Changed the WSClientDataSimulator to reset the most recently received message after the application queries that value.

## v1.0.2:
* Mar/26/2020
* Added a contentType parameter to the utility operator HttpPost.
* Added necessary logic to have the HTTP POST message body to conform to the query string format when the content type is application/x-www-form-urlencoded.
* Made necessary changes in the HttpPostTester example application.

## v1.0.1:
* Mar/25/2020
* Added support for receiving messages via HTTP(S) POST in the WebSocketSource operator.
* Added an utility operator HttpPost to test the feature mentioned above.
* Added a new HttpPostTester example application.

## v1.0.0:
* Mar/05/2020
* Very first release of this toolkit that was tested to support receiving of text or binary data from remote client applications via WebSocket. In this release, this toolkit provides a single C++ based operator named WebSocketSource.
