import { success } from 'middlewares/response';

export const getWallet = (req, res) => {
  const {
    infrastructure: {
      wallet,
    },
  } = req.app.locals;

  const walletInfo = wallet.getInfo()

  success(res)({ yourWallet: walletInfo });
}
