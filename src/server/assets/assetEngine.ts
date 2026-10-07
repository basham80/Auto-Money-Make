import { 
  SolanaAssetInfo, 
  AssetConversionQuote, 
  LiquidityPosition 
} from '../../types/omega.ts';
import { db } from '../db.ts';
import { solanaRpcMesh } from '../solanaRpc.ts';
import { v4 as uuidv4 } from 'uuid';

export class SolanaAssetAndLiquidityEngine {
  private knownTokens: SolanaAssetInfo[] = [
    {
      mint: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'WSOL',
      decimals: 9,
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      tokenStandard: 'SPL_TOKEN',
      balanceRaw: '0',
      balanceFormatted: 0,
      priceInSol: 1.0,
      totalValueSol: 0,
      liquidityDepthSol: 500000,
      isSupportedForConversion: true,
      riskScore: 99,
      authorities: { mintAuthority: null, freezeAuthority: null },
      lastPriceUpdate: Date.now(),
      explorerUrl: 'https://solscan.io/token/So11111111111111111111111111111111111111112'
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      tokenStandard: 'SPL_TOKEN',
      balanceRaw: '0',
      balanceFormatted: 0,
      priceInSol: 0.00714, // ~ $140 SOL
      totalValueSol: 0,
      liquidityDepthSol: 1200000,
      isSupportedForConversion: true,
      riskScore: 95,
      authorities: { mintAuthority: null, freezeAuthority: null },
      lastPriceUpdate: Date.now(),
      explorerUrl: 'https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      tokenStandard: 'SPL_TOKEN',
      balanceRaw: '0',
      balanceFormatted: 0,
      priceInSol: 0.00714,
      totalValueSol: 0,
      liquidityDepthSol: 800000,
      isSupportedForConversion: true,
      riskScore: 92,
      authorities: { mintAuthority: null, freezeAuthority: null },
      lastPriceUpdate: Date.now(),
      explorerUrl: 'https://solscan.io/token/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    },
    {
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter',
      symbol: 'JUP',
      decimals: 6,
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      tokenStandard: 'SPL_TOKEN',
      balanceRaw: '0',
      balanceFormatted: 0,
      priceInSol: 0.0055,
      totalValueSol: 0,
      liquidityDepthSol: 250000,
      isSupportedForConversion: true,
      riskScore: 88,
      authorities: { mintAuthority: null, freezeAuthority: null },
      lastPriceUpdate: Date.now(),
      explorerUrl: 'https://solscan.io/token/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
    }
  ];

  private authorizedLpPositions: LiquidityPosition[] = [
    {
      poolId: 'RAY-SOL-USDC-CLMM-01',
      dex: 'RAYDIUM',
      pair: 'SOL/USDC',
      tokenAMint: 'So11111111111111111111111111111111111111112',
      tokenBMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenASymbol: 'SOL',
      tokenBSymbol: 'USDC',
      depositedTokenA: 0.0005,
      depositedTokenB: 0.07,
      totalValueSol: 0.001,
      feeAprPct: 28.4,
      earnedFeesSol: 0.000042,
      ilExposurePct: 0.4,
      rangeStatus: 'IN_RANGE',
      isAuthorized: true,
      lastHarvestTimestamp: Date.now() - 3600000
    }
  ];

  public async getTrackedAssets(walletAddress: string): Promise<SolanaAssetInfo[]> {
    try {
      const assetsReport = await solanaRpcMesh.getWalletAssets(walletAddress);
      const updated = this.knownTokens.map(tok => {
        const matching = assetsReport.tokens.find(t => t.mint === tok.mint);
        if (matching) {
          return {
            ...tok,
            balanceRaw: matching.rawAmount,
            balanceFormatted: matching.quantity,
            totalValueSol: matching.quantity * tok.priceInSol,
            lastPriceUpdate: Date.now()
          };
        }
        return tok;
      });
      return updated;
    } catch {
      return this.knownTokens;
    }
  }

  public getConversionQuote(fromMint: string, amount: number): AssetConversionQuote {
    const fromToken = this.knownTokens.find(t => t.mint === fromMint);
    if (!fromToken) {
      throw new Error(`Token ${fromMint} is not supported in the Universal Asset Registry.`);
    }

    const estimatedGrossSol = amount * fromToken.priceInSol;
    const priceImpactPct = Math.min(1.5, Math.max(0.02, (estimatedGrossSol / fromToken.liquidityDepthSol) * 100));
    const estimatedNetworkFeeSol = 0.000005; // 5000 lamports standard
    const netYieldSol = Number((estimatedGrossSol * (1 - priceImpactPct / 100) - estimatedNetworkFeeSol).toFixed(6));
    const minSolOutput = Number((netYieldSol * 0.99).toFixed(6)); // 1% slippage tolerance

    const isEconomicallyOptimal = netYieldSol > 0 && priceImpactPct < 1.0;

    return {
      quoteId: `QUOTE-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
      fromMint: fromToken.mint,
      fromSymbol: fromToken.symbol,
      fromAmount: amount,
      toMint: 'So11111111111111111111111111111111111111112',
      toSymbol: 'SOL',
      expectedSolOutput: Number(estimatedGrossSol.toFixed(6)),
      minSolOutput,
      priceImpactPct: Number(priceImpactPct.toFixed(3)),
      routeType: 'RAYDIUM_AMM',
      estimatedNetworkFeeSol,
      netYieldSol,
      isEconomicallyOptimal,
      rejectionReason: isEconomicallyOptimal ? undefined : 'Price impact or network fees exceed economic threshold for conversion.',
      validUntil: Date.now() + 60000 // 60s
    };
  }

  public getLiquidityPositions(): LiquidityPosition[] {
    return this.authorizedLpPositions;
  }
}

export const solanaAssetAndLiquidityEngine = new SolanaAssetAndLiquidityEngine();
