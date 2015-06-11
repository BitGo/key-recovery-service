Key Recovery Service
====================

The key recovery service will let someone serve xpubs to anyone who requests
one for use as a cold key in multisig wallets.

To try it, either run the tests with ``npm test``, or try running the server with
``node bin/server.js`` and then issuing a curl command like:

``curl -d "email=name@example.com" http://localhost:8080/m``
