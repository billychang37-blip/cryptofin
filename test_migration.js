const { ethers } = require('ethers');
const crypto = require('crypto');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const BIP32Factory = require('bip32').default;
const bip32 = BIP32Factory(ecc);
const { Keypair } = require('@solana/web3.js');
const { TronWeb } = require('tronweb');
const ECPairFactory = require('ecpair').ECPairFactory;
const ECPair = ECPairFactory(ecc);

const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });

// Imagine an old randomly generated EVM wallet
const evmWallet = ethers.Wallet.createRandom();
const evmPrivateKey = evmWallet.privateKey; // 0x...

console.log("Original EVM:", evmWallet.address);

// 1. Deriving Tron
const trxPrivateKey = evmPrivateKey.replace('0x', '');
const trxAddress = tronWeb.address.fromPrivateKey(trxPrivateKey);
console.log("Tron:", trxAddress);

// 2. Deriving Bitcoin (Native SegWit)
const keyPair = ECPair.fromPrivateKey(Buffer.from(trxPrivateKey, 'hex'));
const btcAddress = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }).address;
const btcPrivateKey = keyPair.toWIF();
console.log("BTC:", btcAddress);

// 3. Deriving Solana (Hash the PK to get an ed25519 seed)
const solSeed = crypto.createHash('sha256').update(Buffer.from(trxPrivateKey, 'hex')).digest();
const solKeypair = Keypair.fromSeed(solSeed);
const solAddress = solKeypair.publicKey.toBase58();
const solPrivateKey = Buffer.from(solKeypair.secretKey).toString('hex');
console.log("SOL:", solAddress);

