import { ChainId } from '@yaswap/cryptoassets';
import { setupWallet } from '../../index';
import defaultWalletOptions from '../../walletOptions/defaultOptions';
import { Network } from '../types';

describe('updateBalances tests', () => {
  jest.setTimeout(90000);

  const createNotification = jest.fn();
  const wallet = setupWallet({ ...defaultWalletOptions, createNotification });

  beforeEach(async () => {
    await wallet.dispatch.createWallet({
      key: '0x1234567890123456789012345678901234567890',
      mnemonic: 'inflict direct label mask release cargo also before ask future holiday device',
      imported: true,
    });
    await wallet.dispatch.unlockWallet({
      key: '0x1234567890123456789012345678901234567890',
    });
  });

  it('should be able to validate updateBalances against testnet', async () => {
    // change network to testnet
    await wallet.dispatch.changeActiveNetwork({
      network: Network.Testnet,
    });
    expect(wallet.state.activeNetwork).toBe('testnet');

    const walletId = wallet.state.activeWalletId;
    const testnetAccounts = wallet?.state?.accounts?.[walletId]?.testnet;
    expect(testnetAccounts?.length).not.toBe(0);

    if (testnetAccounts) {
      // update balance this will generate addresses for each asset
      await wallet.dispatch.updateBalances({
        network: Network.Testnet,
        walletId: walletId,

        accountIds: testnetAccounts.map((t) => t.id),
      });
    }

    const account = wallet.state.accounts?.[walletId]?.testnet?.find((acc) => acc.chain === ChainId.Bitcoin);
    expect(account?.chain).toBe(ChainId.Bitcoin);
    expect(account?.balances.BTC).toBe('0');
  });
});
