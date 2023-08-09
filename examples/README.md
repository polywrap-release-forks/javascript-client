# Polywrap JS Client Examples

## Hello World

Invokes the logger wrap, which interacts with the logger plugin. It shows a console.log message from WASM world
```
$ yarn run:hello-world
```
## File System

Invokes the File System plugin; which creates, reads and deletes a file
```
$ yarn run:fs
```

## Http

Invokes the HTTP plugin, doing GET and POST requests
```
$ yarn run:http
```

## Ipfs

Invoke the IPFS Client wrap; adds file to a local IPFS node, and then retrieves it
```
$ yarn run:ipfs
```

## Ethereum

Invoke the Ethers core & util wraps, and uses the Ethereum Wallet plugin. It gets the balance of the Staking contract and then parses it from Wei to Eth. Also, it executes the sign typed data method

```
$ yarn run:ethereum
```

## ENS

Invoke the ENS wrap, it gets the resolver & content hash of vitalik.eth
```
$ yarn run:ens
``` 


