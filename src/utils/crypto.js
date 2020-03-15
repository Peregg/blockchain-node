import cryptoJS from 'crypto-js';
import { eddsa as EDDSA } from 'elliptic';
const eddsa = new EDDSA('ed25519');

export const calculateBlockHash = (index, previousHash, timestamp, data) => (
    cryptoJS.SHA256(`${index}${previousHash}${timestamp}${data}`).toString()
);

export const hashTxData = (transaction) => cryptoJS.SHA256(JSON.stringify(transaction)).toString();

const hexToBinary = (s) => {
    let ret = '';
    const lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111'
    };
    for (let i = 0; i < s.length; i ++) {
        if (lookupTable[s[i]]) {
            ret += lookupTable[s[i]];
        } else {
            return null;
        }
    }
    return ret;
};

export const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};

export const genKeyPair = (secret) => {
    return eddsa.keyFromSecret(secret);
};

