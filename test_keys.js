const { ethers } = require('ethers');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const BIP32Factory = require('bip32').default;
const ecc = require('tiny-secp256k1');
const { derivePath } = require('ed25519-hd-key');
const { Keypair } = require('@solana/web3.js');
const TronWeb = require('tronweb');

const bip32 = BIP32Factory(ecc);

async function test() {
    const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const index = 0;

    // EVM
    const evmNode = ethers.HDNodeWallet.fromPhrase(mnemonic, "", `m/44'/60'/0'/0/${index}`);
    console.log("EVM:", evmNode.address);

    // BTC
    const btcRoot = bip32.fromSeed(seed);
    const btcNode = btcRoot.derivePath(`m/84'/0'/0'/0/${index}`);
    const btcAddress = bitcoin.payments.p2wpkh({ pubkey: btcNode.publicKey }).address;
    console.log("BTC:", btcAddress);

    // TRX
    const trxNode = ethers.HDNodeWallet.fromPhrase(mnemonic, "", `m/44'/195'/0'/0/${index}`);
    const trxAddress = TronWeb.address.fromPrivateKey(trxNode.privateKey.replace('0x', ''));
    console.log("TRX:", trxAddress);

    // SOL
    const solDerivationPath = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(solDerivationPath, seed.toString('hex')).key;
    const solKeypair = Keypair.fromSeed(derivedSeed);
    const solAddress = solKeypair.publicKey.toBase58();
    console.log("SOL:", solAddress);
}
test().catch(console.error);
