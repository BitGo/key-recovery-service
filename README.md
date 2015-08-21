Key Recovery Service
====================
The key recovery service dispenses xpubs (Bitcoin public keys) to anyone who requests one for use as a cold key in multisig wallets.

This service implements:

1. The key provisioning protocol (endpoint to get keys), provisioning keys by deriving them off an xPub.  
2. An email to be sent to users when a key is provisioned, setting up their relationship with the KRS provider. 
3. A script for users to construct and sign recovery transactions for their BitGo HD wallet. 
4. The recovery request endpoint, which takes in a transaction for signing, stores the requested recovery, and sends a emails to the KRS owner and user. 
5. A offline signing tool to sign recovery requests (in JSON format).

Tests for the service can be run with ``npm test``. 

Getting Started
====================
1. Git clone this repository.
2. Do an ``npm install`` in the root folder.
3. Run ``node bin/server.js`` to start the service .
4. The service should be accessible in the browser via ``http://localhost:6833/key`` 
5. Start obtaining a key by issuing a curl command like:

``curl -H "Content-Type: application/json" -d '{ "userEmail": "your@email.com" }' http://localhost:6833/key``

Offline Signing Tool
====================
The offline signing tool can be accessed with:
``node bin/signoffline.js``

```
usage: signoffline.js [-h] [-v] [-f FILE] [-k KEY] [--confirm]

Tool to sign recovery JSON offline (for KRS owners recovery)

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -f FILE, --file FILE  Input file of recovery request JSON
  -k KEY, --key KEY     xprv (private key) for signing
  --confirm             skip interactive confirm step -- be careful!
```
