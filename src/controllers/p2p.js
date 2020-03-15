import WebSocket from 'ws';

import MessageTypes from 'utils/p2p';

const P2P_PORT = process.env.P2P_PORT || 5001;

export default class P2pserver {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.nodes = [];
    this.sockets = [];
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    // eslint-disable-next-line no-console
    console.log("Socket connected");
    this.messageHandler(socket);
    this.sendChain(socket);
    this.sendTransactions(socket);
  }

  connectToNodes() {
    this.nodes.forEach(peer => {
      const socket = new WebSocket(peer);
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  addNode(address) {
    this.nodes.push(address);
    this.connectToNodes();
  }

  messageHandler(socket){
    socket.on('message', message => {
      const data = JSON.parse(message);

      switch (data.type) {
        case MessageTypes.CHAIN:
          this.blockchain.replaceChain(data.chain);
          break;
        case MessageTypes.TRANSACTION:
          data.transactionPool.forEach(tx => {
            this.blockchain.stockTransaction(tx);
          });
          break;
        case MessageTypes.CLEAR_TRANSACTIONS:
          this.blockchain.clearTransactionPool();
          break;
        case MessageTypes.UPDATE_WALLET:
          this.blockchain.updateWalletAfterTransactionValidation();
          break;
        default:
          break;
      }
    });
  }

  sendChain(socket) {
    const { chain } = this.blockchain;

    const data = JSON.stringify({
      type: MessageTypes.CHAIN,
      chain,
    });

    socket.send(data);
  }

  syncChain() {
    this.sockets.forEach(socket => {
      this.sendChain(socket);
    });
  }

  sendTransactions(socket) {
    const { transactionPool } = this.blockchain;
    const data = JSON.stringify({
      type: MessageTypes.TRANSACTION,
      transactionPool,
    });
    socket.send(data);
  }

  broadcastTransactions() {
    this.sockets.forEach(socket => {
      this.sendTransactions(socket);
    });
  }

  brodcastTxPoolCleaningInstruction() {
    this.sockets.forEach(socket => {
      const data = JSON.stringify({
        type: MessageTypes.CLEAR_TRANSACTIONS,
      });
      socket.send(data);
    });
  }

  updateWalletInstruction() {
    this.sockets.forEach(socket => {
      const data = JSON.stringify({
        type: MessageTypes.UPDATE_WALLET,
      });
      socket.send(data)
    });
  }

  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));
    this.connectToNodes();
    // eslint-disable-next-line no-console
    console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
  }
}
