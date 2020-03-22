import { success } from 'middlewares/response';

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

export const generateNextBlock = (req, res) => {
  const {
    infrastructure: {
      p2pServer,
      blockchain,
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
