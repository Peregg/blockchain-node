import express from 'express';
import http from 'http';

import Blockchain from 'infrastructure/blockchain';
import P2PServer from 'infrastructure/p2p';
import Wallet from 'infrastructure/wallet';

import router from 'router';

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const SECRET = process.env.SECRET || Date.now();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wallet = new Wallet(SECRET);
const blockchain = new Blockchain(wallet);
const p2pServer = new P2PServer(blockchain);

app.locals.infrastructure = { blockchain, p2pServer, wallet };
app.use(router);

http
  .createServer(app)
  .listen(HTTP_PORT, () => console.log(`Server listening on ${HTTP_PORT}`)); //eslint-disable-line no-console
p2pServer.listen();
