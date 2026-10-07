import React, { useState } from 'react';
import { 
  ShoppingBag, 
  KeyRound, 
  CheckCircle, 
  Copy, 
  Send, 
  FileCode, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { MachineProduct, X402Challenge } from '../types/index.ts';

interface X402ProductsMarketProps {
  products: MachineProduct[];
  treasuryAddress: string;
  onRequestChallenge: (productId: string) => Promise<X402Challenge>;
  onVerifyPayment: (challengeId: string, txSignature: string, payload?: Record<string, unknown>) => Promise<{
    success: boolean;
    receiptId?: string;
    result?: unknown;
    error?: string;
    truthClass: string;
  }>;
}

export const X402ProductsMarket: React.FC<X402ProductsMarketProps> = ({
  products,
  treasuryAddress,
  onRequestChallenge,
  onVerifyPayment
}) => {
  const [selectedProduct, setSelectedProduct] = useState<MachineProduct | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<X402Challenge | null>(null);
  const [txSignature, setTxSignature] = useState('');
  const [targetAddressInput, setTargetAddressInput] = useState('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fulfilledResult, setFulfilledResult] = useState<{
    receiptId?: string;
    result?: unknown;
    truthClass?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestChallenge = async (product: MachineProduct) => {
    setSelectedProduct(product);
    setErrorMsg(null);
    setFulfilledResult(null);
    setTxSignature('');
    setIsRequesting(true);

    try {
      const challenge = await onRequestChallenge(product.productId);
      setActiveChallenge(challenge);
    } catch (err) {
      setErrorMsg(`Failed to create x402 challenge: ${(err as Error).message}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChallenge || !txSignature.trim()) return;

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await onVerifyPayment(activeChallenge.challengeId, txSignature.trim(), {
        targetAddress: targetAddressInput
      });

      if (res.success) {
        setFulfilledResult({
          receiptId: res.receiptId,
          result: res.result,
          truthClass: res.truthClass
        });
      } else {
        setErrorMsg(res.error || 'Payment verification failed on Solana RPC mesh.');
      }
    } catch (err) {
      setErrorMsg(`Verification error: ${(err as Error).message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-neutral-100">Machine-Native Products & x402 Protocol</h2>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">
          Autonomous machine-to-machine service marketplace. Callable by other autonomous AI agents via HTTP 402 payment challenges.
        </p>
      </div>

      {/* Products Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(product => (
          <div 
            key={product.productId}
            className={`p-4 rounded-xl bg-neutral-900/80 border transition-all flex flex-col justify-between space-y-3 font-mono text-xs ${
              selectedProduct?.productId === product.productId 
                ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/50' 
                : 'border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-neutral-100 text-sm">{product.name}</span>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    {product.productId}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-400">{product.priceSol}</span>
                  <span className="text-[10px] text-emerald-500 ml-1">SOL</span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 font-sans mt-2">
                {product.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                <div>
                  <span className="text-neutral-500">SLA:</span> {product.slaSeconds}s
                </div>
                <div>
                  <span className="text-neutral-500">Format:</span> {product.deliveryFormat}
                </div>
                <div>
                  <span className="text-neutral-500">Total Orders:</span> {product.totalOrders}
                </div>
                <div>
                  <span className="text-neutral-500">Verified Rev:</span> {product.verifiedRevenueSol.toFixed(4)} SOL
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRequestChallenge(product)}
              disabled={isRequesting && selectedProduct?.productId === product.productId}
              className="w-full py-2 bg-neutral-800 hover:bg-emerald-600 hover:text-white text-neutral-200 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Request x402 Payment Challenge</span>
            </button>
          </div>
        ))}
      </div>

      {/* Interactive x402 Protocol Sandbox */}
      {activeChallenge && (
        <div className="p-5 rounded-xl bg-neutral-900 border border-emerald-500/50 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-neutral-100 text-sm">
                HTTP 402 Payment Challenge: {activeChallenge.challengeId}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              STATUS: {activeChallenge.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
            <div>
              <span className="text-neutral-500 block mb-0.5">Required Amount:</span>
              <span className="text-base font-black text-emerald-400">{activeChallenge.requiredAmountSol} SOL</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Recipient Treasury Address:</span>
              <span className="text-cyan-400 break-all text-[11px]">{activeChallenge.recipientAddress}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Target Network:</span>
              <span className="text-neutral-200 font-bold">{activeChallenge.network}</span>
            </div>
            <div>
              <span className="text-neutral-500 block mb-0.5">Challenge Expires In:</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                15 Minutes
              </span>
            </div>
          </div>

          {/* Verification Form */}
          {!fulfilledResult ? (
            <form onSubmit={handleVerify} className="space-y-3 pt-2">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">
                  Payload Parameter (Target Address / Token Mint):
                </label>
                <input
                  type="text"
                  value={targetAddressInput}
                  onChange={(e) => setTargetAddressInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-neutral-300 font-semibold">
                    Solana Transaction Signature (Base58):
                  </label>
                  <button
                    type="button"
                    onClick={() => setTxSignature(`sim_sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    [Use Sandbox Test Signature]
                  </button>
                </div>
                <input
                  id="x402-tx-signature-input"
                  type="text"
                  required
                  value={txSignature}
                  onChange={(e) => setTxSignature(e.target.value)}
                  placeholder="Paste on-chain transaction signature..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-neutral-100 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || !txSignature.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying on Solana RPC...' : 'Verify Payment & Fulfill Product'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 rounded-lg text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Payment Verified & Settled to Authoritative Ledger</div>
                    <div className="text-[10px] text-emerald-400/80">Receipt ID: {fulfilledResult.receiptId} · Truth Class: {fulfilledResult.truthClass}</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-neutral-300 font-semibold block mb-1">Delivered Machine Product Payload:</span>
                <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-emerald-300 text-xs overflow-x-auto max-h-72">
                  {JSON.stringify(fulfilledResult.result, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveChallenge(null);
                    setFulfilledResult(null);
                  }}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
