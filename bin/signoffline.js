var assert = require('assert');
var fs = require('fs');

var argumentParser = require('argparse').ArgumentParser;
var prompt = require('prompt-sync');

var bitcoin = require('bitcoinjs-lib');
var HDNode = require('../app/lib/hdnode');
var utils = require('../app/utils');
var _ = require('lodash');

var pjson = require('../package.json');

// Handle arguments
var getArgs = function () {
  var parser = new argumentParser({
    version: pjson.version,
    addHelp: true,
    description: 'Tool to sign recovery JSON offline (for KRS owners recovery)'
  });

  parser.addArgument(
    ['-f', '--file'], {
      help: 'Input file of recovery request JSON'
    }
  );
  parser.addArgument(
    ['-k', '--key'], {
      help: 'xprv (private key) for signing'
    }
  );
  parser.addArgument(
    ['--confirm'], {
      action: 'storeConst',
      constant: 'go',
      help: 'skip interactive confirm step -- be careful!'
    }
  );

  return parser.parseArgs();
};

var arguments = getArgs();

if (!arguments.file) {
  process.stdout.write("Please provide path of the recovery request JSON file: ");
  arguments.file = prompt();
}

// Read in file
var inputFile = fs.readFileSync(arguments.file);
var recoveryRequest = JSON.parse(inputFile);

var transaction = bitcoin.Transaction.fromHex(recoveryRequest.transactionHex);
var userMessage = recoveryRequest.custom ? recoveryRequest.custom.message : "None";

console.log("Sign Recovery Transaction");
console.log("=========================");
console.log("User Email: " + recoveryRequest.userEmail);
console.log("User XPub: " + recoveryRequest.xpub);
_.forEach(transaction.outs, function(output) {
  var outAddress = bitcoin.Address.fromOutputScript(output.script, bitcoin.networks.testnet);
  console.log("Output Address: " + outAddress.toBase58Check());
  console.log("Output Amount: " + utils.formatBTCFromSatoshis(output.value) + " BTC");
});
console.log("Custom Message: " + userMessage);
console.log("=========================");

if (!arguments.key) {
  process.stdout.write("Please provide the master xprv (private key) for signing: ");
  arguments.key = prompt();
}

var masterNode;
// Validate key
try {
  masterNode = HDNode.fromBase58(arguments.key);
} catch(e) {
  throw new Error('invalid private key');
}

if (masterNode.toBase58() === masterNode.neutered().toBase58()) {
  throw new Error('must provide the private (not public) key');
}

var walletBackupXpubHDNode = masterNode.deriveFromPath(recoveryRequest.chainPath);
if (walletBackupXpubHDNode.neutered().toBase58() !== recoveryRequest.xpub) {
  throw new Error('failed to derive user xpub from provided master root key.');
}

if (!arguments.confirm) {
  process.stdout.write("Please type go to confirm: ");
  arguments.confirm = prompt();
}

if (arguments.confirm !== "go") {
  throw new Error('failed to confirm recovery');
}

var transactionBuilder = bitcoin.TransactionBuilder.fromTransaction(transaction);

var i = 0;
_.forEach(recoveryRequest.inputs, function(input) {
  var derivedHDNode = walletBackupXpubHDNode.deriveFromPath(input.chainPath);
  var redeemScript = bitcoin.Script.fromHex(input.redeemScript);
  console.log("Signing input " + (i+1) + " of " + recoveryRequest.inputs.length +
              " with " + derivedHDNode.neutered().toBase58() + " (" + input.chainPath + ")");
  transactionBuilder.sign(i++, derivedHDNode.privKey, redeemScript, bitcoin.Transaction.SIGHASH_ALL);
});

var finalTransaction = transactionBuilder.build();
console.log("Signed transaction hex: " + finalTransaction.toHex());
console.log("=========================");

var filename = arguments.file.replace(/\.[^/.]+$/, "") + ".signed.json";
console.log("Writing the signed transaction out to file: " + filename);
var signedRecovery = _.pick(recoveryRequest, ['xpub', 'userEmail', 'chainPath', 'custom']);
signedRecovery.txHex = finalTransaction.toHex();
fs.writeFileSync(filename, JSON.stringify(signedRecovery, null, 2));
console.log("Done!");