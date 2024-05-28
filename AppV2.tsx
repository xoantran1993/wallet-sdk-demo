import React, {useState} from 'react';
import {SafeAreaView, Text, StyleSheet, Button, Alert} from 'react-native';
import {LocalWallet} from '@unisat/wallet-sdk/lib/wallet';
import {AddressType} from '@unisat/wallet-sdk';
import {NetworkType} from '@unisat/wallet-sdk/lib/network';

const AppV2 = () => {
  const [walletState, setWallet] = useState(null);
  const [addressState, setAddress] = useState('');

  const createWallet = async () => {
    try {
      console.log('XOAN------22: ');
      // Tạo một ví mới bằng Unisat Wallet SDK
      const sampleMnemonic =
        'finish oppose decorate face calm tragic certain desk hour urge dinosaur mango';
      const createWallet = LocalWallet.fromMnemonic(
        2,
        1,
        sampleMnemonic,
        '',
        "m/86'/0'/0'/0",
      );
      console.log('XOAN------: ', createWallet);

      //   setWallet(createWallet);

      //   // Lấy địa chỉ ví
      //   const address = wallet.getAddress();
      //   setAddress(address);

      //   Alert.alert('Wallet Created', `Address: ${address}`);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Unisat Wallet Example</Text>
      <Button title="Create Wallet" onPress={createWallet} />
      {addressState ? (
        <>
          <Text style={styles.addressTitle}>Your Bitcoin Address:</Text>
          <Text style={styles.address}>{addressState}</Text>
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  address: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default AppV2;
