import { success } from 'middlewares/response';

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
