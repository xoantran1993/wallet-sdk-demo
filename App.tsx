/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import './shim';
import ECPairFactory from 'ecpair';
import ecc from '@bitcoinerlab/secp256k1';
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
// const bip32 = require('bip32');
// const ecc = require('tiny-secp256k1')
import axios from 'axios';
// import * as BIP32 from 'bip32';
const {BIP32Factory} = require('bip32');
const bip32 = BIP32Factory(ecc);

function App(): React.JSX.Element {
  const [addressState, setAddress] = useState('');
  const [mnemonicState, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // create address
    // const ECPair = ECPairFactory(ecc);
    // const keyPair = ECPair.makeRandom();
    // const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey});
    // console.log('XOAN---address: ', address);
    // setAddress(address);
  }, []);

  const generateWallet = async () => {
    // create address
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.makeRandom();
    // const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey});
    const {address} = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.testnet,
    });
    console.log('XOAN---address: ', address);
    setAddress(address);

    // Tạo mnemonic (seed phrase)
    const mnemonic = bip39.generateMnemonic();
    setMnemonic(mnemonic);

    // Tạo seed từ mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);
    console.log('XOAN---seed: ', seed);
    // Tạo node gốc từ seed
    const root = bip32.fromSeed(seed);
    // const wallet = bitcoin.bip32.fromSeed(seed);
    console.log('XOAN---wallet: ', root);

    // Tạo ví từ node gốc
    const child = root.derivePath("m/44'/0'/0'/0/0");
    const wif = child.toWIF();
    console.log('XOAN---privateKey: ', wif);
    setPrivateKey(wif);
  };

  const sendTransaction = async () => {
    try {
      console.log('XOAN---check: ', recipientAddress, amount, privateKey);
      if (!recipientAddress || !amount || !privateKey) {
        Alert.alert('Error', 'Please enter all required fields');
        return;
      }

      const ECPair = ECPairFactory(ecc);
      const keyPair = ECPair.makeRandom();
      const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey});

      // Lấy UTXO từ một dịch vụ bên thứ ba (ví dụ: Blockstream API)
      const utxos = await axios.get(
        `https://blockstream.info/testnet/api/address/${addressState}/utxo`,
      );

      if (utxos.data.length === 0) {
        Alert.alert('Error', 'No UTXOs available');
        return;
      }

      const psbt = new bitcoin.Psbt();

      let inputSum = 0;
      utxos.data.forEach((utxo: any) => {
        inputSum += utxo.value;
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: from.P2WPKH.output,
            value: utxo.value,
          },
        });
      });

      const amountSat = parseInt(amount) * 100000000; // Chuyển đổi từ BTC sang Satoshis
      const fee = 10000; // Phí giao dịch, tính bằng Satoshis (có thể cần điều chỉnh)

      if (inputSum < amountSat + fee) {
        Alert.alert('Error', 'Insufficient funds');
        return;
      }

      psbt.addOutput({
        address: recipientAddress,
        value: amountSat,
      });

      // Trả lại tiền thừa về địa chỉ của người gửi
      if (inputSum - amountSat - fee > 0) {
        psbt.addOutput({
          address: address,
          value: inputSum - amountSat - fee,
        });
      }

      // Ký giao dịch
      utxos.data.forEach((_, idx) => {
        psbt.signInput(idx, keyPair);
      });

      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction();
      const txHex = tx.toHex();

      // Phát giao dịch lên mạng Bitcoin (ví dụ: sử dụng Blockstream API)
      const broadcast = await axios.post(
        'https://blockstream.info/api/tx',
        txHex,
      );

      Alert.alert('Success', `Transaction ID: ${broadcast.data}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    // generateWallet();
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.address}>Addess: {addressState}</Text>
        <Text style={styles.address}>Mnemonic: {mnemonicState}</Text>

        <TouchableOpacity
          onPress={generateWallet}
          style={styles.generateWallet}>
          <Text>Generate New Wallet</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Recipient Address"
          value={recipientAddress}
          onChangeText={setRecipientAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount (BTC)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Button title="Send Transaction" onPress={sendTransaction} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  address: {
    color: 'red',
  },
  generateWallet: {
    backgroundColor: 'green',
    marginTop: 100,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
});

export default App;
