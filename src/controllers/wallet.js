import { genKeyPair } from 'utils/crypto';

export default class Wallet {
  constructor(secret) {
    this.balance = 10;
    this.keyPair = genKeyPair(secret);
    this.publicKey = this.keyPair.getPublic('hex');
  }

  getInfo() {
    return {
      balance: this.balance,
      publicKey: this.publicKey,
    };
  }

  updateBalance(sumOfCoinMovements) {
    console.log(this.balance, this.publicKey, sumOfCoinMovements, sumOfCoinMovements[this.publicKey]);

    this.balance = this.balance + sumOfCoinMovements[this.publicKey];
  }
}
