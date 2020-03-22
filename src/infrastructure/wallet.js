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

  updateBalance(validatedTransactions) {
   const allWalletTxs = validatedTransactions.filter(tx => tx.input.from === this.publicKey);
   const lastTxFromWallet = allWalletTxs && allWalletTxs.length > 0 && allWalletTxs.sort((a, b) => a.input.timestamp - b.input.timestamp);

    this.balance = lastTxFromWallet && lastTxFromWallet.slice(-1)[0]
        .outputs
        .find(({ to }) => to === this.publicKey)
        .amount || this.balance;

    const txIns = validatedTransactions
      .filter(tx => tx.input.from !== this.publicKey)
      .map(({ outputs }) => outputs)
      .flat()
      .filter(({ to }) => to === this.publicKey)
      .reduce((acc, { amount }) => {
        return acc + amount;
      }, 0);


    this.balance = this.balance + txIns;

  }
}
