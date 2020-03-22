import { Router } from 'express';
import { generateNextBlock, getBlockchain } from 'controllers/blockchain';
import { connectNode } from 'controllers/p2p';
import { postTransaction } from 'controllers/transactions';
import { getWallet } from 'controllers/wallet';

const router = Router();

router
  .get('/', (req, res) => res.send('Hello Blockchain !'))
  .get('/blocks', getBlockchain)
  .get('/wallet', getWallet)
  .post('/node', connectNode)
  .post('/mine', generateNextBlock)
  .post('/transaction', postTransaction)

export default router;
