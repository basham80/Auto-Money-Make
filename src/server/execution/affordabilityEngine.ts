import { WalletAffordabilityReport } from '../../types/index.ts';
import { solanaRpcMesh } from '../solanaRpc.ts';
import { db } from '../db.ts';

export class WalletAffordabilityEngine {
  /**
   * Evaluates if a given wallet can afford a planned transaction or batch of transactions.
   * Enforces strict reserve protection and rent-exempt threshold invariants.
   */
  public async evaluateAffordability(
    walletAddress: string,
    plannedSpendSol = 0,
    estimatedFeesSol = 0.000005,
    customReserveRatio?: number
  ): Promise<WalletAffordabilityReport> {
    const state = db.getState();
    const reserveRatio = customReserveRatio !== undefined ? customReserveRatio : state.config.reserveRatio; // e.g. 0.35

    // Query live balance directly from cluster
    const balanceInfo = await solanaRpcMesh.getWalletBalance(walletAddress);
    const confirmedBalanceSol = balanceInfo.balanceSol;

    // Minimum rent exempt reserve for Solana system account (~0.00203928 SOL)
    const requiredRentSol = 0.00203928;
    
    // Minimum operating reserve based on ratio or floor (0.01 SOL floor)
    const minimumReserveSol = Math.max(0.01, confirmedBalanceSol * reserveRatio);

    // Compute pending outflows from active signing queue or unconfirmed transactions
    const pendingRequests = (state as any).signingRequests || [];
    const pendingOutflowsSol = pendingRequests
      .filter((req: any) => 
        req.sourceWallet === walletAddress && 
        ['SIGNING', 'SIGNED', 'SUBMITTING', 'SUBMITTED', 'CONFIRMING'].includes(req.state)
      )
      .reduce((sum: number, req: any) => sum + (req.amountSol || 0) + (req.baseFeeSol || 0.000005), 0);

    // Spendable balance calculation
    const totalRequiredSpend = plannedSpendSol + estimatedFeesSol;
    const availableToSpendSol = Math.max(
      0,
      confirmedBalanceSol - pendingOutflowsSol - requiredRentSol - minimumReserveSol - estimatedFeesSol
    );

    const isAffordable = availableToSpendSol >= totalRequiredSpend;

    // Calculate how many transactions at plannedSpendSol can be afforded
    const unitCost = Math.max(0.001, plannedSpendSol + estimatedFeesSol);
    const affordableExecutionCount = Math.max(0, Math.floor(availableToSpendSol / unitCost));

    let status: WalletAffordabilityReport['status'] = isAffordable ? 'AFFORDABLE' : 'BLOCKED_INSUFFICIENT_FUNDS';
    let reason = isAffordable 
      ? `Wallet has ${availableToSpendSol.toFixed(4)} SOL spendable after reserves and pending outflows.`
      : `Insufficient spendable balance. Required: ${totalRequiredSpend.toFixed(4)} SOL, Available: ${availableToSpendSol.toFixed(4)} SOL (Balance: ${confirmedBalanceSol.toFixed(4)} SOL, Reserved: ${minimumReserveSol.toFixed(4)} SOL, Pending: ${pendingOutflowsSol.toFixed(4)} SOL).`;

    if (state.config.emergencyStop) {
      status = 'BLOCKED_INSUFFICIENT_FUNDS';
      reason = 'BLOCKED: Emergency stop is actively engaged.';
    }

    return {
      walletAddress,
      confirmedBalanceSol,
      pendingOutflowsSol,
      requiredRentSol,
      minimumReserveSol,
      estimatedFeesSol,
      availableToSpendSol,
      isAffordable: isAffordable && !state.config.emergencyStop,
      affordableExecutionCount,
      status,
      reason
    };
  }
}

export const affordabilityEngine = new WalletAffordabilityEngine();
