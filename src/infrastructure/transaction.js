import { hashTxData } from 'utils/crypto';

export default class Transaction {
  constructor() {
    this.hash;
    this.input;
    this.outputs;
  }

  toJSON() {
    const { hash, input, outputs } = this;
    return {
      hash,
      input,
      outputs,
    }
  };

  static create(senderWallet, amount, to, type, blockchain) {
    const transaction = new this();

    const sumOfTotalDebits = blockchain.transactionPool
    .map(({ outputs }) => (outputs))
    .flat()
    .reduce((acc, output) => {
      if (output.to !== senderWallet.publicKey) {
        return acc += output.amount;
      }
      return acc;
    }, 0);

    const toSend = {
      to,
      amount,
    };
    const toKeep = {
      to: senderWallet.publicKey,
      amount: senderWallet.balance - sumOfTotalDebits - amount,
    };

    const outputs = [toSend, toKeep];
    transaction.outputs = outputs;
    transaction.type = type;
    transaction.input = {
      timestamp: Date.now(),
      from: senderWallet.publicKey,
    };

    transaction.hash = hashTxData(transaction);

    return transaction;
  }
};
