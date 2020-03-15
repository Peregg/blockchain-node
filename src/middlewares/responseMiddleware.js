import Transaction from 'controllers/transaction';

const success = (res) => (payload) => {
  res.send({
    success: true,
    response: payload,
  });
};

const error = (res) => (payload) => {
  res.send({
    success: false,
    response: payload,
  });
};

export const getBlockchain = (req, res) => {
  const {
    infrastructure: {
      p2pServer,
      blockchain,
    },
  } = req.app.locals;
  const { chain } = blockchain;
  p2pServer.syncChain();
  success(res)(chain)
};

export const getWallet = (req, res) => {
  const {
    infrastructure: {
      wallet,
    },
  } = req.app.locals;

  const walletInfo = wallet.getInfo()
  success(res)({ yourWallet: walletInfo });
}

export const generateNextBlock = (req, res) => {
  const {
    infrastructure: {
      p2pServer,
      blockchain,
      wallet
    },
  } = req.app.locals;
  const { chain } = blockchain;

  const lastBlock = chain[chain.length - 1];

  const beforeMined = Date.now();
  blockchain.mineBlock(lastBlock);
  const afterMined = Date.now();
  const miningDuration = afterMined - beforeMined;
  p2pServer.syncChain();
  blockchain.updateWalletAfterTransactionValidation();
  p2pServer.updateWalletInstruction();
  p2pServer.brodcastTxPoolCleaningInstruction();
  success(res)({ message: `Block successfully mined in ${miningDuration}ms !`, chain });
};

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

export const connectNode = (req, res) => {
  const {
    infrastructure: {
      p2pServer,
    },
  } = req.app.locals;
  const { address } = req.body;
  p2pServer.addNode(address);
  success(res)({ message: 'New node added to blockchain !'});
};
