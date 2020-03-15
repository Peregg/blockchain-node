"use strict";

import cryptoJS from 'crypto-js';

export const calculateBlockHash = (index, previousHash, timestamp, data) => {
  return cryptoJS.SHA256(`${index}${previousHash}${timestamp}${data}`).toString()
};

export default class Block {
  constructor(index, hash, timestamp, previousHash, data, nonce, difficulty) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }
}

// export const hashBlock = ({ index, previousHash, timestamp, data, nonce, difficulty}) => {
//   return calculateBlockHash(index, previousHash, timestamp, data, nonce, difficulty);
//   }

const genesisBlockDate = new Date().getTime();

export const genesisBlock = new Block(0, '4772f1c5556e36ab6cb23075be1842a3c6178b751df8f58d8074094491e6bad0', genesisBlockDate , null, 'GENESIS-BLOCK', 0, 0);

