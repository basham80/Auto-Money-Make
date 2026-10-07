import { economicLedger } from '../ledger.ts';
import { db } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';

/**
 * MANDATORY ECONOMIC TRUTH INVARIANT TESTS
 * Verifies that the internal world (Agents, Opportunities, Quotes, Intents)
 * cannot fabricate Realized Revenue or Realized Profit without verified external evidence.
 */
export async function runEconomicTruthTests(): Promise<{ passed: boolean; testResults: Array<{ name: string; passed: boolean; details: string }> }> {
  const results: Array<{ name: string; passed: boolean; details: string }> = [];

  // Snapshot initial real revenue & profit
  const initialSummary = economicLedger.getEconomicSummary();
  const initialRealRevenue = initialSummary.real.grossRevenueSol;
  const initialRealProfit = initialSummary.real.realizedProfitSol;

  // TEST 1: Agent creates opportunity -> REAL REVENUE must remain unchanged
  try {
    const oppId = `OPP-TEST-${Date.now()}`;
    db.updateState(draft => {
      draft.opportunities.push({
        id: oppId,
        title: 'Simulated EV Arbitrage Vector',
        description: 'Simulated EV Arbitrage Opportunity',
        provider: 'JUPITER_DEX_ARBITRAGE',
        category: 'DEFI_AUDIT',
        capitalRequiredSol: 2.0,
        capitalAvailableSol: 2.0,
        capitalGapSol: 0,
        upfrontCostSol: 0.05,
        expectedRevenueSol: 15.5,
        expectedNetSol: 15.45,
        probabilityOfSuccess: 0.95,
        expectedValueSol: 14.67,
        worstCaseLossSol: 0.05,
        confidenceScore: 0.99,
        riskLevel: 'LOW',
        deadlineMs: Date.now() + 60000,
        status: 'DISCOVERED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        evidence: { dexRoutes: ['SOL/USDC', 'USDC/RAY'] },
        truthClass: 'ESTIMATE'
      });
    });

    const summaryAfterOpp = economicLedger.getEconomicSummary();
    const passed1 = summaryAfterOpp.real.grossRevenueSol === initialRealRevenue && summaryAfterOpp.real.realizedProfitSol === initialRealProfit;
    results.push({
      name: 'Invariant 1: Opportunity Creation Cannot Affect Real Revenue',
      passed: passed1,
      details: passed1 
        ? `Passed. Real Revenue: ${summaryAfterOpp.real.grossRevenueSol} SOL (Expected ${initialRealRevenue} SOL)`
        : `Failed. Real Revenue modified by opportunity creation!`
    });

    // Clean up test opportunity
    db.updateState(draft => {
      draft.opportunities = draft.opportunities.filter(o => o.id !== oppId);
    });
  } catch (err: unknown) {
    results.push({
      name: 'Invariant 1: Opportunity Creation Cannot Affect Real Revenue',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`
    });
  }

  // TEST 2: Agent predicts revenue -> REAL REVENUE must remain unchanged
  let forecastIdemKey: string = `forecast-${Date.now()}`;
  try {
    const recordedEstimate = economicLedger.recordEvent({
      source: 'AGENT_PROJECTION',
      counterparty: 'FORECAST_ENGINE',
      asset: 'SOL',
      grossAmount: 50.0,
      attributableCost: 1.0,
      verificationStatus: 'UNVERIFIED',
      truthClass: 'ESTIMATE',
      network: 'MAINNET',
      idempotencyKey: forecastIdemKey
    });

    const summaryAfterForecast = economicLedger.getEconomicSummary();
    const passed2 = summaryAfterForecast.real.grossRevenueSol === initialRealRevenue;
    results.push({
      name: 'Invariant 2: Revenue Forecast Cannot Affect Real Revenue',
      passed: passed2,
      details: passed2 
        ? `Passed. Estimate ledger has ${summaryAfterForecast.estimate.estimatedGrossSol} SOL while Real Revenue remains strictly ${initialRealRevenue} SOL.`
        : `Failed. Forecast leaked into Real Revenue!`
    });

    // Clean up test forecast event
    db.updateState(draft => {
      draft.ledger = draft.ledger.filter(e => e.eventId !== recordedEstimate.eventId);
    });
  } catch (err: unknown) {
    results.push({
      name: 'Invariant 2: Revenue Forecast Cannot Affect Real Revenue',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`
    });
  }

  // TEST 3: Transaction intent created -> REAL REVENUE must remain unchanged
  const testExecutionId = `EXE-TEST-${Date.now()}`;
  try {
    db.updateState(draft => {
      draft.signingRequests.unshift({
        executionId: testExecutionId,
        transactionIntentId: `INTENT-TEST-${Date.now()}`,
        agentId: 'AGENT-SOL-01',
        sourceWallet: 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i',
        destinationWallet: '7N2YJvB9B8x3uQdRtH1111111111111111111111111',
        amountSol: 1.5,
        baseFeeSol: 0.000005,
        priorityFeeLamports: 10000,
        totalMaxSpendSol: 1.500015,
        expectedRevenueSol: 0,
        expectedCostSol: 1.500015,
        expectedProfitSol: -1.500015,
        state: 'READY_TO_SIGN',
        messageDigest: 'sha256_dummy_digest',
        truthClass: 'ESTIMATE',
        idempotencyKey: `idem-intent-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    });

    const summaryAfterIntent = economicLedger.getEconomicSummary();
    const passed3 = summaryAfterIntent.real.grossRevenueSol === initialRealRevenue;
    results.push({
      name: 'Invariant 3: Transaction Intent Cannot Affect Real Revenue',
      passed: passed3,
      details: passed3 ? `Passed. Real Revenue: ${summaryAfterIntent.real.grossRevenueSol} SOL` : 'Failed.'
    });

    // Clean up test intent
    db.updateState(draft => {
      draft.signingRequests = draft.signingRequests.filter(s => s.executionId !== testExecutionId);
    });
  } catch (err: unknown) {
    results.push({
      name: 'Invariant 3: Transaction Intent Cannot Affect Real Revenue',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`
    });
  }

  // TEST 4: External payment verified -> REAL REVENUE must increase
  let testEventId: string | null = null;
  try {
    const verifiedPaymentId = `TEST-VERIFIED-PAYMENT-${uuidv4()}`;
    const testGross = 0.05;
    const testCost = 0.001;

    const recorded = economicLedger.recordEvent({
      source: 'X402_MACHINE_COMMERCE',
      counterparty: 'CLIENT-VERIFIED-WALLET',
      orderId: `ORDER-TEST-${Date.now()}`,
      asset: 'SOL',
      grossAmount: testGross,
      attributableCost: testCost,
      transactionSignature: `sig_verified_${Date.now()}`,
      verificationStatus: 'VERIFIED_REAL',
      truthClass: 'REAL',
      network: 'MAINNET',
      evidence: {
        slot: 289410112,
        blockTime: Math.floor(Date.now() / 1000),
        confirmationStatus: 'finalized',
        sha256Proof: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      idempotencyKey: verifiedPaymentId
    });

    testEventId = recorded.eventId;

    const summaryAfterVerified = economicLedger.getEconomicSummary();
    const expectedTarget = Number((initialRealRevenue + testGross).toFixed(6));
    const passed4 = summaryAfterVerified.real.grossRevenueSol >= (expectedTarget - 0.000001);
    
    results.push({
      name: 'Invariant 4: Verified External Payment Must Flow to Real Revenue',
      passed: passed4,
      details: passed4 
        ? `Passed. Verified Real Revenue increased to ${summaryAfterVerified.real.grossRevenueSol.toFixed(4)} SOL (+${testGross} SOL verified settlement).`
        : `Failed. Verified payment did not register in Real Revenue!`
    });

    // Cleanup test record to preserve pristine ledger state
    db.updateState(draft => {
      draft.ledger = draft.ledger.filter(e => e.eventId !== testEventId && !e.idempotencyKey?.startsWith('TEST-VERIFIED-PAYMENT-'));
      draft.treasury.lifetimeRevenueSol = Math.max(0, draft.treasury.lifetimeRevenueSol - testGross);
      draft.treasury.lifetimeCostSol = Math.max(0, draft.treasury.lifetimeCostSol - testCost);
      draft.treasury.realizedProfitSol = Math.max(0, draft.treasury.realizedProfitSol - (testGross - testCost));
    });
  } catch (err: unknown) {
    results.push({
      name: 'Invariant 4: Verified External Payment Must Flow to Real Revenue',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`
    });
  }

  const allPassed = results.every(r => r.passed);
  return { passed: allPassed, testResults: results };
}
