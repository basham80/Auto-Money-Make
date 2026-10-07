import React, { useState } from 'react';
import { 
  Coins, 
  ArrowRightLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { SolanaAssetInfo, AssetConversionQuote, LiquidityPosition } from '../types/omega.ts';

interface SolanaAssetHubProps {
  assets: SolanaAssetInfo[];
  lpPositions: LiquidityPosition[];
  onRefresh?: () => void;
}

export const SolanaAssetHub: React.FC<SolanaAssetHubProps> = ({ 
  assets, 
  lpPositions,
  onRefresh 
}) => {
  const [selectedAsset, setSelectedAsset] = useState<SolanaAssetInfo | null>(assets[1] || null);
  const [amountToConvert, setAmountToConvert] = useState<string>('1.0');
  const [quote, setQuote] = useState<AssetConversionQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const handleGetQuote = async () => {
    if (!selectedAsset || !amountToConvert) return;
    setIsQuoting(true);
    try {
      const res = await fetch('/api/assets/conversion-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromMint: selectedAsset.mint,
          amount: parseFloat(amountToConvert)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Asset & Liquidity Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-neutral-100">Solana Asset Registry & Liquidity Positions</h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                SPL & Token-2022
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Tracks on-chain token balances, valuations, and authorized CLMM liquidity positions. Converts supported assets to SOL only when economically optimal after slippage and fees.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500">Tracked:</span> <span className="text-amber-300 font-bold">{assets.length} Assets</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              <span className="text-emerald-500">Active LP:</span> <span className="font-bold">{lpPositions.length} Positions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tracked Assets Table + Conversion Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets & LP Table (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Universal Asset Registry */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-bold text-neutral-200">Universal Solana Asset Registry</h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Live RPC Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                    <th className="p-3">Asset</th>
                    <th className="p-3">Standard</th>
                    <th className="p-3">Price in SOL</th>
                    <th className="p-3">Liquidity Depth</th>
                    <th className="p-3">Risk Score</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {assets.map(asset => (
                    <tr key={asset.mint} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-neutral-100">{asset.symbol}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">{asset.name}</div>
                      </td>
                      <td className="p-3 text-[11px] text-neutral-300">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                          {asset.tokenStandard}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-200 font-medium">
                        {asset.priceInSol.toFixed(6)} SOL
                      </td>
                      <td className="p-3 text-neutral-400">
                        {asset.liquidityDepthSol.toLocaleString()} SOL
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          asset.riskScore >= 90 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {asset.riskScore}/100 Safe
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setQuote(null);
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
                        >
                          Select Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Authorized CLMM Liquidity Positions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-neutral-200">Authorized Liquidity Positions</h3>
              </div>
              <span className="text-xs text-indigo-400 font-mono">CLMM Engine</span>
            </div>

            <div className="p-4 space-y-3">
              {lpPositions.map(lp => (
                <div key={lp.poolId} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-100">{lp.pair}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-800/40">{lp.dex}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">{lp.rangeStatus}</span>
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-1">
                      Deposited: {lp.depositedTokenA} {lp.tokenASymbol} + {lp.depositedTokenB} {lp.tokenBSymbol}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-neutral-500 text-[10px]">Fee APR</div>
                      <div className="text-emerald-400 font-bold">{lp.feeAprPct}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px]">Earned Fees</div>
                      <div className="text-neutral-200 font-bold">+{lp.earnedFeesSol.toFixed(6)} SOL</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optimal Conversion Optimizer (1 col) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-200">Optimal Asset-to-SOL Conversion</h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Routes asset liquidation through Raydium/Orca pools. Verifies price impact and gas boundaries before execution.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-neutral-500 text-[11px] block mb-1">Source Asset</label>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 font-bold">
                {selectedAsset ? `${selectedAsset.symbol} (${selectedAsset.name})` : 'Select an asset'}
              </div>
            </div>

            <div>
              <label className="text-neutral-500 text-[11px] block mb-1">Amount to Convert</label>
              <input
                type="number"
                value={amountToConvert}
                onChange={e => setAmountToConvert(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                placeholder="1.0"
              />
            </div>

            <button
              onClick={handleGetQuote}
              disabled={isQuoting || !selectedAsset}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {isQuoting ? 'Calculating Optimal Route...' : 'Get Optimal Conversion Quote'}
            </button>
          </div>

          {quote && (
            <div className="mt-4 p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Expected Output:</span>
                <span className="text-neutral-200 font-bold">{quote.expectedSolOutput} SOL</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Price Impact:</span>
                <span className="text-emerald-400 font-bold">{quote.priceImpactPct}%</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Network Fee:</span>
                <span className="text-neutral-400">{quote.estimatedNetworkFeeSol} SOL</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold">
                <span className="text-neutral-300">Net Yield:</span>
                <span className="text-emerald-400">+{quote.netYieldSol} SOL</span>
              </div>

              <div className={`mt-2 p-2 rounded text-[11px] flex items-center gap-1.5 ${
                quote.isEconomicallyOptimal 
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' 
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}>
                {quote.isEconomicallyOptimal ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span>{quote.isEconomicallyOptimal ? 'Optimal conversion confirmed by policy.' : quote.rejectionReason}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
