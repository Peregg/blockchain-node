
// import { hashBlock } from 'controllers/block';
// import {  hashMatchesDifficulty } from 'utils/crypto';
import { DIFFICULTY_ADJUSTMENT_INTERVAL, BLOCK_GENERATION_THERESHOLD } from 'constants/blockConstants';

const isValidStructure = newBlock => {
  return (
  typeof newBlock.index === 'number'
    && typeof newBlock.hash === 'string'
    && typeof newBlock.previousHash === 'string'
    && typeof newBlock.timestamp === 'number'
    && typeof newBlock.data === 'string'
    && typeof newBlock.nonce === 'number'
    && typeof newBlock.difficulty === 'number'
);}

export const blockValidator = (newBlock, previousBlock) => {
  // if (!isValidStructure(newBlock)) {
  //   return { valid: false, error: 'Invalid block structure' };
  // }
  // if (newBlock.index !== previousBlock.index + 1) {
  //   return { valid: false, error: 'Index of the new block does not match previous incremented' };
  // }

  // if (newBlock.previousHash !== previousBlock.hash) {
  //   return { valid: false, error: 'Hash of the new block does not match previous' };
  // }

  // if (hashBlock(newBlock) !== newBlock.hash) {

  //   // if (!hashMatchesBlockContent(newBlock)) {
  //   //     console.log('invalid hash, got:' + newBlock.hash);
  //   //     return false;
  //   // }

  //   if (!hashMatchesDifficulty(newBlock.hash, newBlock.difficulty)) {
  //       console.log('block difficulty not satisfied. Expected: ' + newBlock.difficulty + 'got: ' + newBlock.hash);
  //   }
  //   return true;
  //   }

  return { valid: true };
};

export const getAdjustedDifficulty = (latestBlock, blockchain) => {
    const prevAdjustmentBlock = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_THERESHOLD * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};

