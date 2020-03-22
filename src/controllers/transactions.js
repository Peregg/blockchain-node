import Transaction from 'infrastructure/transaction';

import { success, error } from 'middlewares/response';

export const postTransaction = (req, res) => {
  const {
    infrastructure: {
      blockchain,
      p2pServer,
      wallet,
    },
  } = req.app.locals;
  const { amount, to } = req.body;

  const transaction = Transaction.create(wallet, amount, to, 'test', blockchain);
  const debitTransaction = transaction.outputs.find(t => t.to !== wallet.publicKey);
  const outputExceedsBalance = debitTransaction.amount > wallet.balance;

  const sumOfTotalDebits = blockchain.transactionPool
    .map(({ outputs }) => (outputs))
    .flat()
    .reduce((acc, output) => {
      if (output.to !== wallet.publicKey) {
        return acc += output.amount;
      }
      return acc;
    }, 0);

  const totalDebitsWillExceedBalance = sumOfTotalDebits + amount > wallet.balance;

  if (outputExceedsBalance) {
    error(res)({ message: 'This transaction exceeds your balance !' });
  } else if (totalDebitsWillExceedBalance) {
    error(res)({ message: 'Your balance cannot handle more debit !'})
  } else {
    blockchain.stockTransaction(transaction);
    p2pServer.broadcastTransactions();

    success(res)({ message: 'Transaction waiting to be mined', transaction: transaction.toJSON() })
  }
};
