import Bluebird from 'bluebird';
import { ActionContext, rootActionContext } from '..';
import { assetsAdapter } from '../../utils/chainify';
import { AccountId, Network, WalletId } from '../types';

export const updateAccountBalance = async (
  context: ActionContext,
  { network, walletId, accountId }: { network: Network; walletId: WalletId; accountId: AccountId }
) => {
  const { state, commit, getters } = rootActionContext(context);
  const accounts =
    state.accounts[walletId]?.[network].filter((a) => a.assets && a.assets.length > 0 && a.enabled) || [];
  const index = accounts?.findIndex((a) => a.id === accountId);
  if (index >= 0) {
    const account = accounts[index];
    const { assets, chain } = account;
    if (chain === 'yacoin') {
      const asset = 'YAC'
      const chainId = getters.cryptoassets[asset].chain;
      const _client = getters.client({ network, walletId, chainId, accountId });

      if (_client && _client.wallet) {
        // Update YAC balance
        const addresses = await _client.wallet.getUsedAddresses();

        const _assets = assetsAdapter(asset);
        const balance = addresses.length === 0 ? '0' : (await _client.chain.getBalance(addresses, _assets)).toString();
        commit.UPDATE_BALANCE({ network, accountId, walletId, asset, balance });

        // Update token balance (only for tokens which the wallet already knows about)
        const tokenBalances = addresses.length === 0 ? null : await _client.chain.getTokenBalance(addresses)
        tokenBalances?.filter(({ name }) => assets.includes(name)).forEach(async ({ name, balance }) => {
          commit.UPDATE_BALANCE({ network, accountId, walletId, asset: name, balance: balance.toString() });
        });
      }
    } else {
      await Bluebird.map(assets, async (asset) => {
        console.log('TACA ===> updateAccountBalance.ts, chain = ', chain, ', assets = ', assets)
        const chainId = getters.cryptoassets[asset].chain;
        const _client = getters.client({ network, walletId, chainId, accountId });
        if (_client && _client.wallet) {
          const addresses = await _client.wallet.getUsedAddresses();
  
          const _assets = assetsAdapter(asset);
          const balance = addresses.length === 0 ? '0' : (await _client.chain.getBalance(addresses, _assets)).toString();
  
          commit.UPDATE_BALANCE({ network, accountId, walletId, asset, balance });
        }
      });
    }
  }
};
