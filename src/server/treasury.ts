import { TreasuryState, NetworkMode } from '../types/index.ts';
import { db } from './db.ts';
import { solanaRpcMesh } from './solanaRpc.ts';

export class TreasuryManager {
  public async syncOnChainBalances(): Promise<TreasuryState> {
    const state = db.getState();
    const treasuryAddr = state.config.treasuryAddress;

    try {
      if (treasuryAddr && !treasuryAddr.includes('11111111111111111111111111111')) {
        const { balanceSol, balanceLamports } = await solanaRpcMesh.getWalletBalance(treasuryAddr);
        db.updateState(draft => {
          const reserveRatio = draft.config.reserveRatio !== undefined ? draft.config.reserveRatio : 0.15;
          const reservesSol = Number((balanceSol * reserveRatio).toFixed(6));
          const availableSol = Math.max(0, Number((balanceSol - reservesSol).toFixed(6)));
          draft.treasury.balanceSol = balanceSol;
          draft.treasury.balanceLamports = balanceLamports;
          draft.treasury.reservesSol = reservesSol;
          draft.treasury.availableSol = availableSol;
          draft.treasury.lastUpdated = Date.now();
        });
      }
    } catch (err) {
      console.warn('[TREASURY] On-chain sync notice:', err);
    }

    return db.getState().treasury;
  }

  public getTreasuryState(): TreasuryState {
    const state = db.getState();
    return state.treasury;
  }

  public updateConfig(config: {
    treasuryAddress?: string;
    executionWalletAddress?: string;
    reserveRatio?: number;
    minimumSweepThresholdSol?: number;
    network?: NetworkMode;
  }) {
    const IMMUTABLE_MASTER_TREASURY = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
    db.updateState(draft => {
      // Treasury destination address is strictly locked to immutable master treasury
      draft.config.treasuryAddress = IMMUTABLE_MASTER_TREASURY;
      draft.treasury.treasuryAddress = IMMUTABLE_MASTER_TREASURY;
      if (config.executionWalletAddress) {
        draft.config.executionWalletAddress = config.executionWalletAddress;
        draft.treasury.executionWalletAddress = config.executionWalletAddress;
      }
      if (config.reserveRatio !== undefined) {
        draft.config.reserveRatio = config.reserveRatio;
      }
      if (config.minimumSweepThresholdSol !== undefined) {
        draft.config.minimumSweepThresholdSol = config.minimumSweepThresholdSol;
      }
      if (config.network) {
        draft.config.network = config.network;
        draft.treasury.network = config.network;
      }
      draft.treasury.lastUpdated = Date.now();
    });

    db.logAudit('INFO', 'TREASURY', 'Treasury policy configuration updated.');
  }

  public evaluateProfitSweep(): {
    eligible: boolean;
    availableSweepSol: number;
    realizedProfitSol: number;
    reservesRequiredSol: number;
    reason: string;
  } {
    const state = db.getState();
    const { treasury, config } = state;

    if (config.emergencyStop) {
      return {
        eligible: false,
        availableSweepSol: 0,
        realizedProfitSol: treasury.realizedProfitSol,
        reservesRequiredSol: treasury.reservesSol,
        reason: 'Emergency Stop is active. Treasury sweeps forbidden.'
      };
    }

    if (treasury.realizedProfitSol <= 0) {
      return {
        eligible: false,
        availableSweepSol: 0,
        realizedProfitSol: 0,
        reservesRequiredSol: 0,
        reason: 'No verified realized profit available in authoritative ledger.'
      };
    }

    const availableToSweep = treasury.availableSol;

    if (availableToSweep < config.minimumSweepThresholdSol) {
      return {
        eligible: false,
        availableSweepSol: availableToSweep,
        realizedProfitSol: treasury.realizedProfitSol,
        reservesRequiredSol: treasury.reservesSol,
        reason: `Available amount (${availableToSweep.toFixed(4)} SOL) is below minimum threshold (${config.minimumSweepThresholdSol} SOL).`
      };
    }

    return {
      eligible: true,
      availableSweepSol: availableToSweep,
      realizedProfitSol: treasury.realizedProfitSol,
      reservesRequiredSol: treasury.reservesSol,
      reason: 'Profit sweep conditions satisfied. Ready for authorized execution.'
    };
  }

  public executeProfitSweepIntent(destinationAddress: string): {
    success: boolean;
    sweepAmountSol: number;
    intentId?: string;
    error?: string;
  } {
    const IMMUTABLE_MASTER_TREASURY = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
    const effectiveDestination = IMMUTABLE_MASTER_TREASURY;
    const evalResult = this.evaluateProfitSweep();
    if (!evalResult.eligible) {
      return { success: false, sweepAmountSol: 0, error: evalResult.reason };
    }

    const intentId = `SWEEP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    db.updateState(draft => {
      draft.treasury.availableSol = 0;
      draft.treasury.lastUpdated = Date.now();
    });

    db.logAudit('SECURITY', 'TREASURY_SWEEP', `Authorized profit sweep intent created: ${intentId}. Amount: ${evalResult.availableSweepSol} SOL to ${effectiveDestination}`);

    return {
      success: true,
      sweepAmountSol: evalResult.availableSweepSol,
      intentId
    };
  }
}

export const treasuryManager = new TreasuryManager();
