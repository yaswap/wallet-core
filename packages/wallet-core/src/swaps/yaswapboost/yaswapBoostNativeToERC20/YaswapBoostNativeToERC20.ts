// import { getAsset, unitToCurrency } from '@yaswap/cryptoassets';
import BN from 'bignumber.js';
import { getSwapProvider } from '../../../factory';
import { ActionContext } from '../../../store';
import { withInterval } from '../../../store/actions/performNextAction/utils';
import { Asset, Network, SwapHistoryItem, SwapProviderType, WalletId } from '../../../store/types';
// import { getNativeAsset, isERC20 } from '../../../utils/asset';
import { getNativeAsset } from '../../../utils/asset';
import { prettyBalance } from '../../../utils/coinFormatter';
import { AstroportSwapProvider } from '../../astroport/AstroportSwapProvider';
import {
  YaswapSwapHistoryItem,
  YaswapSwapProvider,
  YaswapTxTypes,
} from '../../yaswap/YaswapSwapProvider';
import { OneinchSwapProvider } from '../../oneinch/OneinchSwapProvider';
import { SovrynSwapProvider } from '../../sovryn/SovrynSwapProvider';
import { SwapProvider } from '../../SwapProvider';
import {
  EstimateFeeRequest,
  EstimateFeeResponse,
  YaswapBoostSwapProviderConfig,
  NextSwapActionRequest,
  QuoteRequest,
  SwapQuote,
  SwapRequest,
  SwapStatus,
} from '../../types';
import { BoostHistoryItem, BoostNextSwapActionRequest } from '../types';

export interface BoostNativeToERC20SwapQuote extends SwapQuote {
  fromTokenAddress: string;
}

const slippagePercentage = 3;
class YaswapBoostNativeToERC20 extends SwapProvider {
  private yaswapSwapProvider: YaswapSwapProvider;
  private sovrynSwapProvider: SovrynSwapProvider;
  private oneinchSwapProvider: OneinchSwapProvider;
  private astroportSwapProvider: AstroportSwapProvider;

  config: YaswapBoostSwapProviderConfig;
  bridgeAssetToAutomatedMarketMaker: { [key: string]: SwapProvider };
  supportedBridgeAssets: Asset[];

  constructor(config: YaswapBoostSwapProviderConfig) {
    super(config);

    this.yaswapSwapProvider = getSwapProvider(
      this.config.network,
      SwapProviderType.Yaswap
    ) as YaswapSwapProvider;
    this.sovrynSwapProvider = getSwapProvider(this.config.network, SwapProviderType.Sovryn) as SovrynSwapProvider;
    this.supportedBridgeAssets = this.config.supportedBridgeAssets;

    if (this.config.network === 'mainnet') {
      this.oneinchSwapProvider = getSwapProvider(this.config.network, SwapProviderType.OneInch) as OneinchSwapProvider;
      this.astroportSwapProvider = getSwapProvider(
        this.config.network,
        SwapProviderType.Astroport
      ) as AstroportSwapProvider;
      this.bridgeAssetToAutomatedMarketMaker = {
        MATIC: this.oneinchSwapProvider,
        ETH: this.oneinchSwapProvider,
        BNB: this.oneinchSwapProvider,
        RBTC: this.sovrynSwapProvider,
        AVAX: this.oneinchSwapProvider,
        UST: this.astroportSwapProvider,
        LUNA: this.astroportSwapProvider,
      };
    } else if (this.config.network === 'testnet') {
      this.bridgeAssetToAutomatedMarketMaker = {
        RBTC: this.sovrynSwapProvider,
      };
    }
  }

  async getSupportedPairs() {
    return [];
  }

  // async getQuote({ network, from, to, amount }: QuoteRequest) {
  async getQuote() {
    return null;
    // if (isERC20(from) || !isERC20(to) || amount.lte(0)) {
    //   return null;
    // }

    // const bridgeAsset = getNativeAsset(to);

    // if (!this.supportedBridgeAssets.includes(bridgeAsset)) {
    //   return null;
    // }

    // const quote = await this.yaswapSwapProvider.getQuote({
    //   network,
    //   from,
    //   to: bridgeAsset,
    //   amount,
    // });

    // if (!quote) {
    //   return null;
    // }

    // const bridgeAssetQuantity = unitToCurrency(getAsset(network, bridgeAsset), new BN(quote.toAmount));

    // const finalQuote = (await this.bridgeAssetToAutomatedMarketMaker[bridgeAsset].getQuote({
    //   network,
    //   from: bridgeAsset,
    //   to,
    //   amount: bridgeAssetQuantity,
    // })) as BoostNativeToERC20SwapQuote;

    // if (!finalQuote) {
    //   return null;
    // }

    // return {
    //   from,
    //   to,
    //   fromAmount: quote.fromAmount,
    //   toAmount: finalQuote.toAmount,
    //   min: quote.min,
    //   max: quote.max,
    //   bridgeAsset,
    //   bridgeAssetAmount: quote.toAmount,
    //   path: finalQuote.path,
    //   fromTokenAddress: finalQuote.fromTokenAddress, // for Terra ERC20
    // };
  }

  async newSwap({ network, walletId, quote: _quote }: SwapRequest<BoostHistoryItem>) {
    const result = await this.yaswapSwapProvider.newSwap({
      network,
      walletId,
      quote: this.swapYaswapFormat(_quote),
    });

    return {
      ...result,
      ..._quote,
      slippage: slippagePercentage * 100,
      bridgeAssetAmount: (result as YaswapSwapHistoryItem).toAmount,
    };
  }

  async updateOrder(order: BoostHistoryItem) {
    return await this.yaswapSwapProvider.updateOrder(order);
  }

  async estimateFees({
    network,
    walletId,
    asset,
    txType,
    quote,
    feePrices,
    max,
  }: EstimateFeeRequest<string, BoostHistoryItem>) {
    const input = { network, walletId, asset, txType, quote, feePrices, max };

    if (txType === this.fromTxType) {
      // swap initiation fee
      const yaswapFees = await this.yaswapSwapProvider.estimateFees({
        ...input,
        txType: this.yaswapSwapProvider.fromTxType as YaswapTxTypes,
        quote: this.swapYaswapFormat(quote),
      });

      return yaswapFees;
    } else if (txType === this.toTxType) {
      // swap claim fee
      const yaswapFees = await this.yaswapSwapProvider.estimateFees({
        ...input,
        asset: quote.bridgeAsset,
        txType: this.yaswapSwapProvider.toTxType as YaswapTxTypes,
        quote: this.swapYaswapFormat(quote),
      });

      // amm fee
      const automatedMarketMakerFees = await this.bridgeAssetToAutomatedMarketMaker[quote.bridgeAsset].estimateFees({
        ...input,
        asset: quote.bridgeAsset,
        // all AMMs have the same fromTxType
        txType: this.sovrynSwapProvider.fromTxType as string,
        quote: this.swapAutomatedMarketMakerFormat(quote),
      });

      const combinedFees: EstimateFeeResponse = {};
      for (const key in automatedMarketMakerFees) {
        combinedFees[Number(key)] = new BN(automatedMarketMakerFees[Number(key)]).plus(yaswapFees[Number(key)]);
      }

      return combinedFees;
    } else {
      // unknown tx type
      return null;
    }
  }

  async getMin(quoteRequest: QuoteRequest) {
    return await this.yaswapSwapProvider.getMin({ ...quoteRequest, to: getNativeAsset(quoteRequest.to) });
  }

  async finalizeYaswapSwapAndStartAutomatedMarketMaker({ swapLSP, network, walletId }: BoostNextSwapActionRequest) {
    const result = await this.yaswapSwapProvider.waitForClaimConfirmations({
      swap: swapLSP,
      network: network as Network,
      walletId: walletId as WalletId,
    });
    if (result?.status === 'SUCCESS') {
      return { endTime: Date.now(), status: 'APPROVE_CONFIRMED' };
    }
  }

  async performNextSwapAction(
    store: ActionContext,
    { network, walletId, swap }: NextSwapActionRequest<BoostHistoryItem>
  ) {
    let updates: Partial<SwapHistoryItem> | undefined;

    if (swap.status === 'WAITING_FOR_CLAIM_CONFIRMATIONS') {
      updates = await withInterval(async () =>
        this.finalizeYaswapSwapAndStartAutomatedMarketMaker({
          swapLSP: this.swapYaswapFormat(swap),
          network,
          walletId,
        })
      );
    } else {
      updates = await this.yaswapSwapProvider.performNextSwapAction(store, {
        network,
        walletId,
        swap: this.swapYaswapFormat(swap),
      });
    }

    if (!updates) {
      updates = await this.bridgeAssetToAutomatedMarketMaker[swap.bridgeAsset].performNextSwapAction(store, {
        network,
        walletId,
        swap: this.swapAutomatedMarketMakerFormat(swap),
      });
    }

    return updates;
  }

  protected _getStatuses(): Record<string, SwapStatus> {
    return {
      ...this.yaswapSwapProvider.statuses,
      ...this.sovrynSwapProvider.statuses,
      CONFIRM_COUNTER_PARTY_INITIATION: {
        ...this.yaswapSwapProvider.statuses.CONFIRM_COUNTER_PARTY_INITIATION,
        label: 'Locking {bridgeAsset}',
        notification(swap: any) {
          return {
            message: `Counterparty sent ${prettyBalance(swap.bridgeAssetAmount, swap.bridgeAsset)} ${
              swap.bridgeAsset
            } to escrow`,
          };
        },
      },
      READY_TO_CLAIM: {
        ...this.yaswapSwapProvider.statuses.READY_TO_CLAIM,
        label: 'Claiming {bridgeAsset}',
      },
      WAITING_FOR_CLAIM_CONFIRMATIONS: {
        ...this.yaswapSwapProvider.statuses.WAITING_FOR_CLAIM_CONFIRMATIONS,
        label: 'Claiming {bridgeAsset}',
      },
      APPROVE_CONFIRMED: {
        ...this.sovrynSwapProvider.statuses.APPROVE_CONFIRMED,
        step: 4,
        label: 'Swapping {bridgeAsset} for {to}',
      },
      WAITING_FOR_SWAP_CONFIRMATIONS: {
        ...this.sovrynSwapProvider.statuses.WAITING_FOR_SWAP_CONFIRMATIONS,
        notification() {
          return {
            message: 'Engaging Automated Market Maker',
          };
        },
        step: 4,
      },
      SUCCESS: {
        ...this.yaswapSwapProvider.statuses.SUCCESS,
        step: 5,
      },
      FAILED: {
        ...this.sovrynSwapProvider.statuses.FAILED,
        step: 5,
      },
    };
  }

  protected _txTypes(): Record<string, string | null> {
    return {
      FROM_CHAIN: 'FROM_CHAIN',
      TO_CHAIN: 'TO_CHAIN',
    };
  }

  protected _fromTxType(): string | null {
    return this._txTypes().FROM_CHAIN;
  }

  protected _toTxType(): string | null {
    return this._txTypes().TO_CHAIN;
  }

  protected _timelineDiagramSteps(): string[] {
    // remove approval step because bridge asset is always native and doesn't need approval
    const ammTimeline = this.sovrynSwapProvider.timelineDiagramSteps;
    if (ammTimeline[0] === 'APPROVE') {
      ammTimeline.shift();
    }

    // ['APPROVE', 'INITIATION', 'AGENT_INITIATION', 'CLAIM_OR_REFUND', 'SWAP'];
    return this.yaswapSwapProvider.timelineDiagramSteps.concat(ammTimeline);
  }

  protected _totalSteps(): number {
    // remove approval step because bridge asset is always native and doesn't need approval
    let ammSteps = this.sovrynSwapProvider.totalSteps;
    if (this.sovrynSwapProvider.timelineDiagramSteps[0] === 'APPROVE') {
      ammSteps -= 1;
    }

    return this.yaswapSwapProvider.totalSteps + ammSteps;
  }

  private swapYaswapFormat(swap: any): YaswapSwapHistoryItem {
    return {
      ...swap,
      to: swap.bridgeAsset,
      toAmount: swap.bridgeAssetAmount,
      slippagePercentage,
    };
  }

  private swapAutomatedMarketMakerFormat(swap: any) {
    return {
      ...swap,
      from: swap.bridgeAsset,
      fromAmount: swap.bridgeAssetAmount,
      fromAccountId: swap.toAccountId, // AMM swaps happen on the same account
      slippagePercentage,
      fee: swap.claimFee,
    };
  }
}

export { YaswapBoostNativeToERC20 };
