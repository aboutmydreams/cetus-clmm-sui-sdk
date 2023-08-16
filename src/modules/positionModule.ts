import BN from 'bn.js'
import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions'
import { isValidSuiObjectId } from '@mysten/sui.js/utils'
import {
  AddLiquidityFixTokenParams,
  AddLiquidityParams,
  ClosePositionParams,
  CollectFeeParams,
  OpenPositionParams,
  Position,
  PositionReward,
  RemoveLiquidityParams,
  getPackagerConfigs,
} from '../types'
import {
  CachedContent,
  asUintN,
  buildPosition,
  buildPositionReward,
  cacheTime24h,
  cacheTime5min,
  extractStructTagFromType,
  getFutureTime,
} from '../utils'
import { findAdjustCoin, TransactionUtil } from '../utils/transaction-util'
import { ClmmFetcherModule, ClmmIntegratePoolModule, CLOCK_ADDRESS, SuiObjectIdType, SuiResource } from '../types/sui'
import { CetusClmmSDK } from '../sdk'
import { IModule } from '../interfaces/IModule'
import { getObjectFields } from '../utils/objects'
import { CollectFeesQuote } from '../math'
import { FetchPosFeeParams } from './rewarderModule'

/**
 * Helper class to help interact with clmm position with a position router interface.
 */
export class PositionModule implements IModule {
  protected _sdk: CetusClmmSDK

  private readonly _cache: Record<string, CachedContent> = {}

  constructor(sdk: CetusClmmSDK) {
    this._sdk = sdk
  }

  get sdk() {
    return this._sdk
  }

  /**
   * Builds the full address of the Position type.
   * @returns The full address of the Position type.
   */
  buildPositionType() {
    const cetusClmm = this._sdk.sdkOptions.clmm_pool.package_id
    return `${cetusClmm}::position::Position`
  }

  /**
   * Gets a list of positions for the given account address.
   * @param accountAddress The account address to get positions for.
   * @param assignPoolIds An array of pool IDs to filter the positions by.
   * @returns array of Position objects.
   */
  async getPositionList(accountAddress: string, assignPoolIds: string[] = []): Promise<Position[]> {
    const allPosition: Position[] = []

    const ownerRes: any = await this._sdk.fullClient.getOwnedObjectsByPage(accountAddress, {
      options: { showType: true, showContent: true, showDisplay: true, showOwner: true },
      filter: { Package: this._sdk.sdkOptions.clmm_pool.package_id },
    })

    const hasAssignPoolIds = assignPoolIds.length > 0
    for (const item of ownerRes.data as any[]) {
      const type = extractStructTagFromType(item.data.type)

      if (type.full_address === this.buildPositionType()) {
        const position = buildPosition(item)
        const cacheKey = `${position.pos_object_id}_getPositionList`
        this.updateCache(cacheKey, position, cacheTime24h)
        if (hasAssignPoolIds) {
          if (assignPoolIds.includes(position.pool)) {
            allPosition.push(position)
          }
        } else {
          allPosition.push(position)
        }
      }
    }

    return allPosition
  }

  /**
   * Gets a position by its handle and ID. But it needs pool info, so it is not recommended to use this method.
   * if you want to get a position, you can use getPositionById method directly.
   * @param {string} positionHandle The handle of the position to get.
   * @param {string} positionID The ID of the position to get.
   * @param {boolean} calculateRewarder Whether to calculate the rewarder of the position.
   * @returns {Promise<Position>} Position object.
   */
  async getPosition(positionHandle: string, positionID: string, calculateRewarder = true): Promise<Position> {
    let position = await this.getSipmlePosition(positionID)
    if (calculateRewarder) {
      position = await this.updatePositionRewarders(positionHandle, position)
    }
    return position
  }

  /**
   * Gets a position by its ID.
   * @param {string} positionID The ID of the position to get.
   * @param {boolean} calculateRewarder Whether to calculate the rewarder of the position.
   * @returns {Promise<Position>} Position object.
   */
  async getPositionById(positionID: string, calculateRewarder = true): Promise<Position> {
    const position = await this.getSipmlePosition(positionID)
    if (calculateRewarder) {
      const pool = await this._sdk.Pool.getPool(position.pool, false)
      const result = await this.updatePositionRewarders(pool.position_manager.positions_handle, position)
      return result
    }
    return position
  }

  /**
   * Gets a simple position for the given position ID.
   * @param {string} positionID The ID of the position to get.
   * @returns {Promise<Position>} Position object.
   */
  async getSipmlePosition(positionID: string): Promise<Position> {
    const cacheKey = `${positionID}_getPositionList`

    let position = this.getSipmlePositionByCache(positionID)

    if (position === undefined) {
      const objectDataResponses = await this.sdk.fullClient.getObject({
        id: positionID,
        options: { showContent: true, showType: true, showDisplay: true, showOwner: true },
      })
      position = buildPosition(objectDataResponses)

      this.updateCache(cacheKey, position, cacheTime24h)
    }
    return position
  }

  /**
   * Gets a simple position for the given position ID.
   * @param {string} positionID Position object id
   * @returns {Position | undefined} Position object
   */
  private getSipmlePositionByCache(positionID: string): Position | undefined {
    const cacheKey = `${positionID}_getPositionList`
    return this.getCache<Position>(cacheKey)
  }

  /**
   * Gets a list of simple positions for the given position IDs.
   * @param {SuiObjectIdType[]} positionIDs The IDs of the positions to get.
   * @returns {Promise<Position[]>} A promise that resolves to an array of Position objects.
   */
  async getSipmlePositionList(positionIDs: SuiObjectIdType[]): Promise<Position[]> {
    const positionList: Position[] = []
    const notFoundIds: SuiObjectIdType[] = []

    positionIDs.forEach((id) => {
      const position = this.getSipmlePositionByCache(id)
      if (position) {
        positionList.push(position)
      } else {
        notFoundIds.push(id)
      }
    })

    if (notFoundIds.length > 0) {
      const objectDataResponses = await this._sdk.fullClient.batchGetObjects(notFoundIds, {
        showOwner: true,
        showContent: true,
        showDisplay: true,
        showType: true,
      })

      objectDataResponses.forEach((info) => {
        const position = buildPosition(info)
        positionList.push(position)
        const cacheKey = `${position.pos_object_id}_getPositionList`
        this.updateCache(cacheKey, position, cacheTime24h)
      })
    }

    return positionList
  }

  /**
   * Updates the rewarders of position
   * @param {string} positionHandle Position handle
   * @param {Position} position Position object
   * @returns {Promise<Position>} A promise that resolves to an array of Position objects.
   */
  private async updatePositionRewarders(positionHandle: string, position: Position): Promise<Position> {
    const positionReward = await this.getPositionRewarders(positionHandle, position.pos_object_id)
    return {
      ...position,
      ...positionReward,
    }
  }

  /**
   * Gets the position rewarders for the given position handle and position object ID.
   * @param {string} positionHandle The handle of the position.
   * @param {string} positionID The ID of the position object.
   * @returns {Promise<PositionReward | undefined>} PositionReward object.
   */
  async getPositionRewarders(positionHandle: string, positionID: string): Promise<PositionReward | undefined> {
    try {
      const dynamicFieldObject = await this._sdk.fullClient.getDynamicFieldObject({
        parentId: positionHandle,
        name: {
          type: '0x2::object::ID',
          value: positionID,
        },
      })

      const objectFields = getObjectFields(dynamicFieldObject.data as any) as any

      const fields = objectFields.value.fields.value

      const positionReward = buildPositionReward(fields)
      return positionReward
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  /**
   * Fetches the Position fee amount for a given list of addresses.
   * @param {FetchPosFeeParams[]} params  An array of FetchPosFeeParams objects containing the target addresses and their corresponding amounts.
   * @returns {Promise<CollectFeesQuote[]>} A Promise that resolves with the fetched position fee amount for the specified addresses.
   */
  private async fetchPosFeeAmount(params: FetchPosFeeParams[]): Promise<CollectFeesQuote[]> {
    const { clmm_pool, integrate, simulationAccount } = this.sdk.sdkOptions
    const tx = new TransactionBlock()

    for (const paramItem of params) {
      const typeArguments = [paramItem.coinTypeA, paramItem.coinTypeB]
      const args = [
        tx.object(getPackagerConfigs(clmm_pool).global_config_id),
        tx.object(paramItem.poolAddress),
        tx.pure(paramItem.positionId),
      ]
      tx.moveCall({
        target: `${integrate.published_at}::${ClmmFetcherModule}::fetch_position_fees`,
        arguments: args,
        typeArguments,
      })
    }

    const simulateRes = await this.sdk.fullClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: simulationAccount.address,
    })

    const valueData: any = simulateRes.events?.filter((item: any) => {
      return extractStructTagFromType(item.type).name === `FetchPositionFeesEvent`
    })
    if (valueData.length === 0) {
      return []
    }

    const result: CollectFeesQuote[] = []

    for (let i = 0; i < valueData.length; i += 1) {
      const { parsedJson } = valueData[i]
      const posRrewarderResult: CollectFeesQuote = {
        feeOwedA: new BN(parsedJson.fee_owned_a),
        feeOwedB: new BN(parsedJson.fee_owned_b),
        position_id: parsedJson.position_id,
      }
      result.push(posRrewarderResult)
    }

    return result
  }

  /**
   * Fetches the Position fee amount for a given list of addresses.
   * @param positionIDs An array of position object ids.
   * @returns {Promise<Record<string, CollectFeesQuote>>} A Promise that resolves with the fetched position fee amount for the specified position object ids.
   */
  async batchFetchPositionFees(positionIDs: string[]): Promise<Record<string, CollectFeesQuote>> {
    const posFeeParamsList: FetchPosFeeParams[] = []
    for (const id of positionIDs) {
      const position = await this._sdk.Position.getPositionById(id, false)
      const pool = await this._sdk.Pool.getPool(position.pool, false)
      posFeeParamsList.push({
        poolAddress: pool.poolAddress,
        positionId: position.pos_object_id,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
      })
    }

    const positionMap: Record<string, CollectFeesQuote> = {}

    if (posFeeParamsList.length > 0) {
      const result: CollectFeesQuote[] = await this.fetchPosFeeAmount(posFeeParamsList)
      for (const posRewarderInfo of result) {
        positionMap[posRewarderInfo.position_id] = posRewarderInfo
      }
      return positionMap
    }
    return positionMap
  }

  /**
   * create add liquidity transaction payload with fix token
   * @param {AddLiquidityFixTokenParams} params
   * @param gasEstimateArg : When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
   * If this parameter is not passed, gas estimation is not performed
   * @returns {Promise<TransactionBlock>}
   */
  async createAddLiquidityFixTokenPayload(
    params: AddLiquidityFixTokenParams,
    gasEstimateArg?: {
      slippage: number
      curSqrtPrice: BN
    }
  ): Promise<TransactionBlock> {
    if (this._sdk.senderAddress.length === 0) {
      throw Error('this config sdk senderAddress is empty')
    }
    const allCoinAsset = await this._sdk.getOwnerCoinAssets(this._sdk.senderAddress)

    if (gasEstimateArg) {
      const { isAdjustCoinA, isAdjustCoinB } = findAdjustCoin(params)
      params = params as AddLiquidityFixTokenParams
      if ((params.fix_amount_a && isAdjustCoinA) || (!params.fix_amount_a && isAdjustCoinB)) {
        const tx = await TransactionUtil.buildAddLiquidityFixTokenForGas(this._sdk, allCoinAsset, params, gasEstimateArg)
        return tx
      }
    }

    return TransactionUtil.buildAddLiquidityFixToken(this._sdk, allCoinAsset, params)
  }

  /**
   * create add liquidity transaction payload
   * @param {AddLiquidityParams} params
   * @returns {Promise<TransactionBlock>}
   */
  async createAddLiquidityPayload(params: AddLiquidityParams): Promise<TransactionBlock> {
    const { integrate, clmm_pool } = this._sdk.sdkOptions
    if (this._sdk.senderAddress.length === 0) {
      throw Error('this config sdk senderAddress is empty')
    }
    const allCoinAsset = await this._sdk.getOwnerCoinAssets(this._sdk.senderAddress)
    const tick_lower = asUintN(BigInt(params.tick_lower)).toString()
    const tick_upper = asUintN(BigInt(params.tick_upper)).toString()

    const typeArguments = [params.coinTypeA, params.coinTypeB]

    const tx = new TransactionBlock()

    const needOpenPosition = !isValidSuiObjectId(params.pos_id)

    let positionNft: TransactionArgument[] = []

    if (needOpenPosition) {
      positionNft = tx.moveCall({
        target: `${clmm_pool.published_at}::pool::open_position`,
        typeArguments,
        arguments: [
          tx.object(getPackagerConfigs(clmm_pool).global_config_id),
          tx.object(params.pool_id),
          tx.pure(tick_lower),
          tx.pure(tick_upper),
        ],
      })
    } else {
      this._sdk.Rewarder.collectRewarderTransactionPayload(
        {
          pool_id: params.pool_id,
          pos_id: params.pos_id,
          coinTypeA: params.coinTypeA,
          coinTypeB: params.coinTypeB,
          collect_fee: params.collect_fee,
          rewarder_coin_types: params.rewarder_coin_types,
        },
        tx
      )
    }

    const max_amount_a = BigInt(params.max_amount_a)
    const max_amount_b = BigInt(params.max_amount_b)

    const warpInputs: {
      coinInput: TransactionArgument
      amount: string
    }[] = []

    let funName = ''

    if (max_amount_a > 0) {
      const primaryCoinAInputs: any = TransactionUtil.buildCoinInputForAmount(
        tx,
        allCoinAsset,
        max_amount_a,
        params.coinTypeA
      )?.transactionArgument
      warpInputs.push({
        coinInput: primaryCoinAInputs,
        amount: max_amount_a.toString(),
      })
      funName = 'add_liquidity_only_a'
    }
    if (max_amount_b > 0) {
      const primaryCoinBInputs: any = TransactionUtil.buildCoinInputForAmount(
        tx,
        allCoinAsset,
        max_amount_b,
        params.coinTypeB
      )?.transactionArgument
      warpInputs.push({
        coinInput: primaryCoinBInputs,
        amount: max_amount_b.toString(),
      })
      funName = 'add_liquidity_only_b'
    }

    if (max_amount_a > 0 && max_amount_b > 0) {
      funName = 'add_liquidity_with_all'
    }

    tx.moveCall({
      target: `${integrate.published_at}::${ClmmIntegratePoolModule}::${funName}`,
      typeArguments,
      arguments: [
        tx.object(getPackagerConfigs(clmm_pool).global_config_id),
        tx.object(params.pool_id),
        needOpenPosition ? positionNft[0] : tx.object(params.pos_id),
        ...warpInputs.map((item) => item.coinInput),
        ...warpInputs.map((item) => tx.pure(item.amount)),
        tx.pure(params.delta_liquidity),
        tx.object(CLOCK_ADDRESS),
      ],
    })
    if (needOpenPosition) {
      tx.transferObjects([positionNft[0]], tx.object(this._sdk.senderAddress))
    }
    return tx
  }

  /**
   * Remove liquidity from a position.
   * @param {RemoveLiquidityParams} params
   * @returns {TransactionBlock}
   */
  removeLiquidityTransactionPayload(params: RemoveLiquidityParams): TransactionBlock {
    const { clmm_pool, integrate } = this.sdk.sdkOptions

    const functionName = 'remove_liquidity'

    const tx = new TransactionBlock()

    const typeArguments = [params.coinTypeA, params.coinTypeB]

    this._sdk.Rewarder.collectRewarderTransactionPayload(
      {
        pool_id: params.pool_id,
        pos_id: params.pos_id,
        coinTypeA: params.coinTypeA,
        coinTypeB: params.coinTypeB,
        collect_fee: params.collect_fee,
        rewarder_coin_types: params.rewarder_coin_types,
      },
      tx
    )

    const args = [
      tx.object(getPackagerConfigs(clmm_pool).global_config_id),
      tx.object(params.pool_id),
      tx.object(params.pos_id),
      tx.pure(params.delta_liquidity),
      tx.pure(params.min_amount_a),
      tx.pure(params.min_amount_b),
      tx.object(CLOCK_ADDRESS),
    ]

    tx.moveCall({
      target: `${integrate.published_at}::${ClmmIntegratePoolModule}::${functionName}`,
      typeArguments,
      arguments: args,
    })

    return tx
  }

  /**
   * Close position and remove all liquidity and collect_reward
   * @param {ClosePositionParams} params
   * @returns {TransactionBlock}
   */
  closePositionTransactionPayload(params: ClosePositionParams): TransactionBlock {
    const { clmm_pool, integrate } = this.sdk.sdkOptions

    const tx = new TransactionBlock()

    const typeArguments = [params.coinTypeA, params.coinTypeB]

    this._sdk.Rewarder.collectRewarderTransactionPayload(
      {
        pool_id: params.pool_id,
        pos_id: params.pos_id,
        coinTypeA: params.coinTypeA,
        coinTypeB: params.coinTypeB,
        collect_fee: params.collect_fee,
        rewarder_coin_types: params.rewarder_coin_types,
      },
      tx
    )

    tx.moveCall({
      target: `${integrate.published_at}::${ClmmIntegratePoolModule}::close_position`,
      typeArguments,
      arguments: [
        tx.object(getPackagerConfigs(clmm_pool).global_config_id),
        tx.object(params.pool_id),
        tx.object(params.pos_id),
        tx.pure(params.min_amount_a),
        tx.pure(params.min_amount_b),
        tx.object(CLOCK_ADDRESS),
      ],
    })

    return tx
  }

  /**
   * Open position in clmmpool.
   * @param {OpenPositionParams} params
   * @returns {TransactionBlock}
   */
  openPositionTransactionPayload(params: OpenPositionParams): TransactionBlock {
    const { clmm_pool, integrate } = this.sdk.sdkOptions

    const tx = new TransactionBlock()

    const typeArguments = [params.coinTypeA, params.coinTypeB]
    const tick_lower = asUintN(BigInt(params.tick_lower)).toString()
    const tick_upper = asUintN(BigInt(params.tick_upper)).toString()
    const args = [
      tx.pure(getPackagerConfigs(clmm_pool).global_config_id),
      tx.pure(params.pool_id),
      tx.pure(tick_lower),
      tx.pure(tick_upper),
    ]

    tx.moveCall({
      target: `${integrate.published_at}::${ClmmIntegratePoolModule}::open_position`,
      typeArguments,
      arguments: args,
    })

    return tx
  }

  /**
   * Collect LP fee from Position.
   * @param {CollectFeeParams} params
   * @param {TransactionBlock} tx
   * @returns {TransactionBlock}
   */
  collectFeeTransactionPayload(params: CollectFeeParams, tx?: TransactionBlock): TransactionBlock {
    const { clmm_pool, integrate } = this.sdk.sdkOptions

    tx = tx === undefined ? new TransactionBlock() : tx

    const typeArguments = [params.coinTypeA, params.coinTypeB]
    const args = [tx.object(getPackagerConfigs(clmm_pool).global_config_id), tx.object(params.pool_id), tx.object(params.pos_id)]

    tx.moveCall({
      target: `${integrate.published_at}::${ClmmIntegratePoolModule}::collect_fee`,
      typeArguments,
      arguments: args,
    })

    return tx
  }

  /**
   * calculate fee
   * @param {CollectFeeParams} params
   * @returns
   */
  async calculateFee(params: CollectFeeParams) {
    const paylod = this.collectFeeTransactionPayload(params, new TransactionBlock())

    const res = await this._sdk.fullClient.devInspectTransactionBlock({
      transactionBlock: paylod,
      sender: this._sdk.senderAddress,
    })
    for (const event of res.events) {
      if (extractStructTagFromType(event.type).name === 'CollectFeeEvent') {
        const json = event.parsedJson as any
        return {
          feeOwedA: json.amount_a,
          feeOwedB: json.amount_b,
        }
      }
    }

    return {
      feeOwedA: '0',
      feeOwedB: '0',
    }
  }

  /**
   * Updates the cache for the given key.
   * @param {string} key The key of the cache entry to update.
   * @param {SuiResource} data The data to store in the cache.
   * @param {cacheTime5min} time The time in minutes after which the cache entry should expire.
   */
  private updateCache(key: string, data: SuiResource, time = cacheTime5min) {
    let cacheData = this._cache[key]
    if (cacheData) {
      cacheData.overdueTime = getFutureTime(time)
      cacheData.value = data
    } else {
      cacheData = new CachedContent(data, getFutureTime(time))
    }
    this._cache[key] = cacheData
  }

  /**
   * Gets the cache entry for the given key.
   * @param {string} key The key of the cache entry to get.
   * @param {boolean} forceRefresh Whether to force a refresh of the cache entry.
   * @returns The cache entry for the given key, or undefined if the cache entry does not exist or is expired.
   */
  private getCache<T>(key: string, forceRefresh = false): T | undefined {
    const cacheData = this._cache[key]
    const isValid = cacheData?.isValid()
    if (!forceRefresh && isValid) {
      return cacheData.value as T
    }
    if (!isValid) {
      delete this._cache[key]
    }
    return undefined
  }
}
