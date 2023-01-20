import { BitcoinBaseWalletProvider, BitcoinEsploraApiProvider } from '@chainify/bitcoin';
import { Client } from '@chainify/client'; // HttpClient
// import { Transaction } from '@chainify/types';
import { currencyToUnit, getChain, unitToCurrency } from '@liquality/cryptoassets'; // ChainId
// import { getErrorParser, ThorchainAPIErrorParser } from '@liquality/error-parser';
import { isTransactionNotFoundError } from '../../utils/isTransactionNotFoundError';
// import ERC20 from '@uniswap/v2-core/build/ERC20.json';
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
// import { BaseAmount, baseAmount, } from '@xchainjs/xchain-util';
// baseToAsset assetFromString
import BN from 'bignumber.js'; // { BigNumber }
import * as ethers from 'ethers';
import { mapValues } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import buildConfig from '../../build.config';
import { ActionContext } from '../../store'; // store
import { withInterval } from '../../store/actions/performNextAction/utils'; // withLock
import { Asset, Network, SwapHistoryItem, WalletId } from '../../store/types';
// import { isERC20 } from '../../utils/asset';
import { prettyBalance } from '../../utils/coinFormatter'; // fiatToCrypto
import cryptoassets from '../../utils/cryptoassets';
// import { getTxFee } from '../../utils/fees';
import { SwapProvider } from '../SwapProvider';
import { calculateFee, getLockers } from '@sinatdt/scripts'; // TODO package name
import { teleswap } from '@sinatdt/configs';
// import { TeleportDaoPayment} from './bitcoin-evm-nodes-v2/packages/bitcoin/src/index.js'; // TODO package name

import {
	BaseSwapProviderConfig,
	EstimateFeeRequest,
	// EstimateFeeResponse,
	NextSwapActionRequest,
	QuoteRequest,
	SwapRequest,
	SwapStatus,
} from '../types'; // SwapQuote
import { CUSTOM_ERRORS, createInternalError } from '@liquality/error-parser';

const TRANSFER_APP_ID = 0;
const EXCHANGE_APP_ID = 1;
const SUGGESTED_DEADLINE = 100000000; // TODO: EDIT IT
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const PROTOCOL_FEE = 20; // locker fee (%0.15) + protocol fee (%0.05)
const SLIPPAGE = 10; // TODO: EDIT IT
const DUMMY_BYTES = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export interface TeleSwapSwapProviderConfig extends BaseSwapProviderConfig {
	QuickSwapRouterAddress: string;
	QuickSwapFactoryAddress: string;
}

// const SUPPORTED_CHAINS = [ChainId.Bitcoin, ChainId.Ethereum];

/**
 * Converts a `BaseAmount` string into `PoolData` balance (always `1e8` decimal based)
 */
// const toPoolBalance = (baseAmountString: string) => baseAmount(baseAmountString, THORCHAIN_DECIMAL);

// TODO: this needs to go into cryptoassets. In fact, we should have large compatibility with the chain.asset notation
// Probably cryptoassets should adopt that kind of naming for assets
// const toThorchainAsset = (asset: Asset) => {
//   return isERC20(asset) ? `ETH.${asset}-${cryptoassets[asset].contractAddress!.toUpperCase()}` : `${asset}.${asset}`;
// };

/**
 * Helper to convert decimal of asset amounts
 *
 * It can be used to convert Midgard/THORChain amounts,
 * which are always based on 1e8 decimal into any 1e(n) decimal
 *
 * Examples:
 * ETH.ETH: 1e8 -> 1e18
 * ETH.USDT: 1e8 -> 1e6
 *
 * @param amount BaseAmount to convert
 * @param decimal Target decimal
 */
// const convertBaseAmountDecimal = (amount: BaseAmount, decimal: number) => {
//   const decimalDiff = decimal - amount.decimal;

//   const amountBN =
//     decimalDiff < 0
//       ? amount
//           .amount()
//           .dividedBy(new BN(10 ** (decimalDiff * -1)))
//           // Never use `BigNumber`s with decimal within `BaseAmount`
//           // that's why we need to set `decimalPlaces` to `0`
//           // round down is needed to make sure amount of currency is still available
//           // without that, `dividedBy` might round up and provide an currency amount which does not exist
//           .decimalPlaces(0, BN.ROUND_DOWN)
//       : amount.amount().multipliedBy(new BN(10 ** decimalDiff));
//   return baseAmount(amountBN, decimal);
// };

export interface ThorchainTx {
	id: string;
	chain: string;
	from_address: string;
	to_address: string;
	coins: {
		asset: string;
		amount: string;
	}[];
	gas: {
		asset: string;
		amount: string;
	}[];
	memo: string;
}

export enum TeleSwapTxTypes {
	WRAP = 'WRAP',
	SWAP = 'SWAP',
}

export interface TeleSwapSwapHistoryItem extends SwapHistoryItem {
  swapTxHash: string;
}

class TeleSwapSwapProvider extends SwapProvider {
	
	config: TeleSwapSwapProviderConfig;
  // TODO move url to config
	targetNetworkConnectionInfo = {
    web3: {
      url: "wss://polygon-mumbai.g.alchemy.com/v2/5M02lhCj_-C62MzO5TcSj53mOy-X-QPK",
    },
  };

	constructor(config: TeleSwapSwapProviderConfig) {
		super(config);
	}

	async getSupportedPairs() { // seems not necessary since others didn't implement it
		return [];
	}

	async getQuote({network, from, to, amount }: QuoteRequest) {

		const api = new ethers.providers.InfuraProvider(
			this._getChainId(to, network), 
			buildConfig.infuraApiKey // we use api key provided in buildConfig
		);

    	// reduce the fees
		// const percentageFee = await this._getTeleporterFee({ network, from, to, amount });
		const percentageFee = 1; // TODO: REMOVE IT
		// TODO: ROUND UP AMOUNT AFTER FEE
    	let amountAfterFee = BN(amount).times(10000 - Number(percentageFee) - PROTOCOL_FEE).div(10000);
		amountAfterFee = amount; // TODO: REMOVE IT

		// check that the liquidity pool exists
		const exchangeFactory = new ethers.Contract(
			this.config.QuickSwapFactoryAddress, UniswapV2Factory.abi, api
		);
		const pair = await exchangeFactory.getPair(this.getTokenAddress(to), this.getTokenAddress(from));
		if (pair == '0x0000000000000000000000000000000000000000') {
			// pair not exists
			throw createInternalError(CUSTOM_ERRORS.NotFound.Default);
		}
		
		// get the output amount having input amount
		// assume that a liquidty pool between to and from exists
		// TODO: if there is no direct liquidity pool between tokens
		const exchangeRouter = new ethers.Contract(
			this.config.QuickSwapRouterAddress, 
			UniswapV2Router.abi, api
		);
		
		const fromAmountInUnit = currencyToUnit(cryptoassets[from], new BN(amountAfterFee)); // TODO remove BN and see if it's ok
		const outputAmount = await exchangeRouter.getAmountsOut(
			fromAmountInUnit.toNumber(),
			[this.getTokenAddress(from), this.getTokenAddress(to)]
		);
		const toAmountInUnit = new BN((outputAmount[outputAmount.length - 1]).toString());

		return {
			fromAmount: fromAmountInUnit.toFixed(),
			toAmount: toAmountInUnit.toFixed(),
		};
	}

	async sendBitcoinSwap({
		quote,
		network,
		walletId,
	}: {
		quote: TeleSwapSwapHistoryItem;
		network: Network;
		walletId: WalletId;
	}) {
		// send notif to ledger
		await this.sendLedgerNotification(quote.fromAccountId, 'Signing required to complete the swap.');

		// find the best locker (is active and has capacity)
		const to = await this._chooseLockerAddress(Number(quote.fromAmount), network);

		// input amount
		const value = new BN(quote.fromAmount);

		// // determine req type (wrap or swap)
		// const requestType = quote.to === "TeleBTC"? TeleSwapTxTypes.WRAP: TeleSwapTxTypes.SWAP;

		// // get receipient address 
		// const fromAddressRaw = await this.getSwapAddress(network, walletId, quote.to, quote.toAccountId);

		// // get OP_RETURN data
		// const opReturnData = await this._getOpReturnData(quote, requestType, network, fromAddressRaw);
		const opReturnData = '0x00';
		
		// get client to sign tx
		const client = this.getClient(network, walletId, quote.from, quote.fromAccountId);
		const fromFundTx = await client.wallet.sendTransaction({
			to: to,
			value,
			data: opReturnData,
			fee: quote.fee, // TODO: is it bitcoin tx fee?
		});
		return fromFundTx;
	}

	async sendSwap({ network, walletId, swap }: NextSwapActionRequest<TeleSwapSwapHistoryItem>) {
		let bitcoinTx;
		if (swap.from === 'BTC') {
			bitcoinTx = await this.sendBitcoinSwap({
				quote: swap,
				network,
				walletId,
			});
		}

		if (!bitcoinTx) {
			throw createInternalError(CUSTOM_ERRORS.FailedAssert.SendTransaction);
		}
		
		return {
			status: 'WAITING_FOR_SEND_CONFIRMATIONS',
			swapTxHash: bitcoinTx.hash,
		};
	}

	async newSwap({ network, walletId, quote }: SwapRequest<TeleSwapSwapHistoryItem>) {

		const updates = await this.sendSwap({ network, walletId, swap: quote });

		return {
			id: uuidv4(),
			fee: quote.fee,
			...updates,
		};
	}

  // this func only estimates tx submission fee (not protocols fees)
	async estimateFees({ network, walletId, asset, txType, quote, feePrices, max }: EstimateFeeRequest) {
		
		if (txType === this._txTypes().SWAP && asset === 'BTC') {
		const client = this.getClient(network, walletId, asset, quote.fromAccountId) as Client<
			BitcoinEsploraApiProvider,
			BitcoinBaseWalletProvider
		>;
		const value = max ? undefined : new BN(quote.fromAmount);
		const txs = feePrices.map((fee) => ({ to: '', value, data: DUMMY_BYTES, fee }));
		const totalFees = await client.wallet.getTotalFees(txs, max);
		return mapValues(totalFees, (f) => unitToCurrency(cryptoassets[asset], f));
		}
		return null;
  }

	async getMin(quote: QuoteRequest) {
    	return new BN(
			await this._getTeleporterFee(
				{network: quote.network, from: quote.from, to: quote.to, amount: new BN(0) }
			)
		);
	}

	// return address of asset
	getTokenAddress(asset: Asset) {
		if (asset == 'BTC') {
			return teleswap.tokenInfo.polygon.testnet.teleBTC;
		} else {
			return teleswap.tokenInfo.polygon.testnet.link; // TODO: EDIT IT
		}
		// return cryptoassets[asset].contractAddress;
	}

	async waitForSendConfirmations({ swap, network, walletId }: NextSwapActionRequest<TeleSwapSwapHistoryItem>) {
	
		const client = this.getClient(network, walletId, swap.from, swap.fromAccountId);
		try {
			const tx = await client.chain.getTransactionByHash(swap.swapTxHash);
			if (tx && tx.confirmations && tx.confirmations > 0) {
				return {
					endTime: Date.now(),
					status: 'WAITING_FOR_RECEIVE',
				};
			}
		} catch (e) {
			if (isTransactionNotFoundError(e)) console.warn(e);
			else throw e;
		}
	}

	// async waitForReceive({ swap, network, walletId }: NextSwapActionRequest<TeleSwapSwapHistoryItem>) {
		
  //   try {
	// 	  // const thorchainTx = await this._getTransaction(swap.fromFundHash);
  //     // return {
  //     //   receiveTxHash: receiveTx.hash,
  //     //   receiveTx: receiveTx,
  //     //   endTime: Date.now(),
  //     //   status,
  //     // };
  //     // } else {
  //     //   return {
  //     //     receiveTxHash: receiveTx.hash,
  //     //     receiveTx: receiveTx,
  //     //   };
	// 	} catch (e) {
	// 	  console.error(`TeleSwap waiting for receive failed ${swap.swapTxHash}`, e);
	// 	}
	// }

	async performNextSwapAction(
		_store: ActionContext,
		{ network, walletId, swap }: NextSwapActionRequest<TeleSwapSwapHistoryItem>
	) {
		// console.log(swap.status);
		switch (swap.status) {
      		case 'WAITING_FOR_SEND_CONFIRMATIONS':
        		return withInterval(async () => this.waitForSendConfirmations({ swap, network, walletId }));
      		case 'WAITING_FOR_RECEIVE':
        		// return withInterval(async () => this.waitForReceive({ swap, network, walletId }));
        		return withInterval(async () => this.waitForSendConfirmations({ swap, network, walletId }));
		}
	}

	protected _getStatuses(): Record<string, SwapStatus> {
		return {
			WAITING_FOR_SEND_CONFIRMATIONS: {
				step: 0,
				label: 'Swapping {from}',
				filterStatus: 'PENDING',
				notification() {
					return {
						message: 'Swap initiated',
					};
				},
			},
			WAITING_FOR_RECEIVE: {
				step: 1,
				label: 'Receiving {to}',
				filterStatus: 'PENDING',
				notification() {
					return {
						message: 'Waiting for confirmation',
					};
				},
			},
			SUCCESS: {
				step: 2,
				label: 'Completed',
				filterStatus: 'COMPLETED',
				notification(swap: any) {
					return {
						message: `Swap completed, ${prettyBalance(swap.toAmount, swap.to)} ${swap.to} ready to use`,
					};
				},
			},
			FAILED: {
				step: 2,
				label: 'Swap Failed',
				filterStatus: 'REFUNDED',
				notification(swap: any) {
					let refundedTeleBTC = swap.fromAmount; // TODO show the correct amount (reduce the fee)
					return {
						message: `Swap failed, ${prettyBalance(refundedTeleBTC, 'TeleBTC')} ${'TeleBTC'} refunded`,
					};
				},
			},
    	};
	}

	protected _txTypes() {
		return TeleSwapTxTypes;
	}

	protected _fromTxType(): string | null {
		return this._txTypes().SWAP;
	}

	protected _toTxType(): string | null {
		return null;
	}

	protected _timelineDiagramSteps(): string[] {
		return ['REQUEST', 'WAITING', 'RECEIVE'];
	}

	protected _totalSteps(): number {
		return 3;
	}

	private async _chooseLockerAddress(value: Number, network: Network) {
		const isMainnet = network === Network.Mainnet? true: false;

		// for now, we only support Polygon
		// TODO: why it is empty
		let lockers = await getLockers({
			'amount': value, 
			'type': 'transfer', // for now, we only support Bitcoin -> EVM through liquality
			'targetNetworkConnectionInfo': this.targetNetworkConnectionInfo, 
			'testnet': isMainnet
		});
		// TODO: uncomment it
		if (!lockers.preferredLocker) {
			// throw createInternalError(CUSTOM_ERRORS.NotFound.Default); // TODO: edit error
		}

		// return best locker bitcoin address
		// TODO: uncomment it
		// return lockers.preferredLocker.bitcoinAddress;
		return '2N8JDhrLqtwZ4MGC1QAcwyiQg3v6ffhCrJb';
	}

	private _getChainId(asset: Asset, network: Network) {
		const chainId = cryptoassets[asset].chain;
		// if (chainId !== ChainId.Ethereum) {
		//   throw createInternalError(CUSTOM_ERRORS.Unsupported.Chain);
		// }
		const chain = getChain(network, chainId);
		return Number(chain.network.chainId);
	}

  private async _getTeleporterFee(quote: QuoteRequest) {
		const isMainnet = quote.network === Network.Mainnet? true: false;
		const calculatedFee = await calculateFee({
			'amount': quote.amount,
			'type': 'transfer', // for now, we only support Bitcoin -> EVM through liquality 
			'targetNetworkConnectionInfo': this.targetNetworkConnectionInfo,
			'testnet': isMainnet
		});
		return calculatedFee.lockerPercentageFee; // TODO change it to teleporterPercentageFee
	}

	private async _getOpReturnData(
		quote: TeleSwapSwapHistoryItem, 
		requestType: TeleSwapTxTypes, 
		network: Network,
		recipientAddress: String // user's evm address on liquality
	) {
	
		// const api = new ethers.providers.AlchemyWebSocketProvider(
		// 	"wss://polygon-mumbai.g.alchemy.com/v2/5M02lhCj_-C62MzO5TcSj53mOy-X-QPK"
		// );
		const api = new ethers.providers.InfuraProvider(
			this._getChainId(quote.to, network), 
			buildConfig.infuraApiKey // we use api key provided in buildConfig
		);

		let isExchange;
		const chainId = 3; // TODO: write func for it + update the amount
		let appId;
		const speed = 0; // for now, we only support normal through liquality 
		let exchangeTokenAddress;
		let deadline;
		let outputAmount;
		const isFixedToken = false;

		// calculate teleporter percentage fee
		const percentageFee = await this._getTeleporterFee(
      {
        network: network, 
        from: quote.from, 
        to: quote.to, 
        amount: new BN(quote.fromAmount) 
      }
    );

		if(requestType == TeleSwapTxTypes.SWAP) {
			isExchange = true;
			appId = EXCHANGE_APP_ID; // we use the first registered dex in teleswap
			exchangeTokenAddress = this.getTokenAddress(quote.to);
			deadline = (await api.getBlock('lastest')).timestamp + SUGGESTED_DEADLINE;
			// for now, we assume that the input token is fixed 
			outputAmount = Number((await this.getQuote(
				{
					network: network, 
					from: quote.from, 
					to: quote.to, 
					amount: new BN(quote.fromAmount) 
				}
			)).toAmount)*(100 - SLIPPAGE);
		} else {
			isExchange = false;
			appId = TRANSFER_APP_ID;
			exchangeTokenAddress = ZERO_ADDRESS;
			deadline = 0;
			outputAmount = 0;
		}
		
		// return hex format of op_return data
		return this._getTransferOpReturnData(
			chainId,
			appId,
			recipientAddress,
			percentageFee,
			speed,
			isExchange,
			exchangeTokenAddress,
			outputAmount,
			deadline,
			isFixedToken,
		);
	}
	// TODO: get from package
  private _getTransferOpReturnData(
    chainId: any,
    appId: any,
    recipientAddress: any, // 20 bytes
    percentageFee: any, // 2 bytes in satoshi
    speed = 0, // 1 byte
    isExchange = false,
    exchangeTokenAddress = "0x0000000000000000000000000000000000000000", // 20 bytes
    outputAmount = 0, // 28 bytes
    deadline: any, // 4 bytes
    isFixedToken = false, // 1 byte
  ) {
    let chainIdHex = Number(chainId).toString(16).padStart(2, "0")
    let appIdHex = Number(appId).toString(16).padStart(4, "0")
    let recipientAddressHex = recipientAddress.replace("0x", "").toLowerCase().padStart(40, "0")
    let percentageFeeHex = Number((percentageFee * 100).toFixed(0))
      .toString(16)
      .padStart(4, "0")
    let speedHex = speed ? "01" : "00"
    let dataHex = chainIdHex + appIdHex + recipientAddressHex + percentageFeeHex + speedHex
    if (!isExchange) {
      if (dataHex.length !== 26 * 2) throw new Error("invalid data length")
      return dataHex
    }

    let exchangeTokenAddressHex = exchangeTokenAddress
      .replace("0x", "")
      .toLowerCase()
      .padStart(40, "0")
    let outputAmountHex = Number(outputAmount).toString(16).padStart(56, "0")
    let deadlineHex = Number(deadline).toString(16).padStart(8, "0")
    let isFixedTokenHex = isFixedToken ? "01" : "00"

    dataHex = dataHex + exchangeTokenAddressHex + outputAmountHex + deadlineHex + isFixedTokenHex
    if (dataHex.length !== 79 * 2) throw new Error("invalid data length")
    return dataHex
  }
}

export { TeleSwapSwapProvider };