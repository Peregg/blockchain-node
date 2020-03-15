import { Router } from 'express';
import { generateNextBlock, getBlockchain, connectNode, postTransaction, getWallet } from 'middlewares/responseMiddleware';

const router = Router();

router
  .get('/', (req, res) => res.send('Hello Blockchain !'))
  .get('/blocks', getBlockchain)
  .get('/wallet', getWallet)
  .post('/node', connectNode)
  .post('/mine', generateNextBlock)
  .post('/transaction', postTransaction)

export default router;
