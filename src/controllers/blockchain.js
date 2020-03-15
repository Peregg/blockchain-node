import { blockValidator } from 'utils/blockchain';
import { hashMatchesDifficulty } from 'utils/crypto';
import { isEqual } from 'lodash';
import Block, {
  genesisBlock,
  calculateBlockHash,
} from 'controllers/block';
import { MINING_RATE, DIFFICULTY } from 'constants/blockConstants';

export default class Blockchain {
  constructor(wallet) {
    this.chain = [genesisBlock];
    this.mineBlock = this.mineBlock.bind(this);
    this.difficulty = DIFFICULTY;
    this.transactionPool = [];
    this.wallet = wallet;
  }

  isValidChain(chain){
    // if(!isEqual(chain[0], genesisBlock)) return false;

    return chain.reduce((isValid, _, i) => {
      if(i === 0) return;

      return chain[i].previousHash === chain[i - 1].hash;
    }, false)
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Recieved chain is not longer than the current chain", { newChain, chain: this.chain });
      return;
    } else if(!this.isValidChain(newChain)){
      console.log("Recieved chain is invalid", { newChain, chain: this.chain });
      return;
    }
    console.log("Replacing the current chain with new chain");
    this.chain = newChain;
  }

  adjustDifficulty(lastBlock, newBlock) {
    const { timestamp: lastBlockGenerationTimestamp } = lastBlock;
    const { timestamp: newBlockGenerationTimestamp } = newBlock;

    if (newBlockGenerationTimestamp - lastBlockGenerationTimestamp < MINING_RATE) {
      this.difficulty += 1;
    } else if (newBlockGenerationTimestamp - lastBlockGenerationTimestamp > MINING_RATE) {
      this.difficulty -= 1;
    }
  }

  stockTransaction(transaction) {
    const alreadyInPool = this.transactionPool.find(tx => tx.hash === transaction.hash);
    if (alreadyInPool) {
      const transactions = this.transactionPool.filter(tx => tx.hash !== transaction.hash);
      this.transactionPool = transactions;
    }
    this.transactionPool.push(transaction);
  }

  clearTransactionPool() {
    this.transactionPool = [];
  }

  mineBlock(lastBlock) {
    const {
      index: lastBlockIndex,
      timestamp: lastBlockTimestamp,
      hash: lastBlockHash,
    } = lastBlock;

    const index = lastBlockIndex + 1;
    const data = this.transactionPool;

    let nonce = 0;

    while (true) {
      const timestamp = Date.now();

      const hash = calculateBlockHash(index, hash, timestamp, lastBlockHash, data, nonce, this.difficulty);

      if (hashMatchesDifficulty(hash, this.difficulty)) {
        const newBlock = new Block(index, hash, timestamp, lastBlockHash, data, nonce, this.difficulty);
        this.chain.push(newBlock);
        this.adjustDifficulty(lastBlock, newBlock);
        this.clearTransactionPool();
        return;
      }
      nonce ++;
    }
  }

  updateWalletAfterTransactionValidation() {
    let totalDebits = 0;

    const sumOfCoinMovements = this.transactionPool
      .map(({ outputs }) => outputs)
      .flat()
      .reduce((acc, output) => {
        if (output.to !== this.wallet.publicKey) {
          if (!Object.prototype.hasOwnProperty.call(acc, output.to)) {
            acc[output.to] = output.amount;
            totalDebits += output.amount;
          } else {
            acc[output.to] += output.amount;
            totalDebits += output.amount;
          }
        }
        return acc;
      }, {});

    this.wallet.updateBalance(sumOfCoinMovements)
  }
};
