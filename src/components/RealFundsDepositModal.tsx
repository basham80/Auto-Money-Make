import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

interface RealFundsDepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RealFundsDepositModal: React.FC<RealFundsDepositModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [custodyWallet, setCustodyWallet] = useState<{
    address: string;
    balanceSol: number;
    balanceLamports: number;
    explorerUrl: string;
    masterTreasury: string;
  }>({
    address: '7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns',
    balanceSol: 0,
    balanceLamports: 0,
    explorerUrl: 'https://solscan.io/account/7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns',
    masterTreasury: 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i'
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [depositAmountSol, setDepositAmountSol] = useState<number>(0.01);
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [manualSignature, setManualSignature] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [depositReceipt, setDepositReceipt] = useState<any>(null);

  // Fetch live custody wallet status
  const fetchCustodyInfo = async () => {
    try {
      const res = await fetch('/api/funds/custody-wallet');
      if (res.ok) {
        const data = await res.json();
        setCustodyWallet(data);
      }
    } catch (e) {
      console.warn('Failed to fetch custody wallet:', e);
    }
  };

  useEffect(() => {
    fetchCustodyInfo();
    // Check if Phantom is already connected
    const solana = (window as any).solana;
    if (solana?.isPhantom && solana.publicKey) {
      setPhantomConnected(true);
      setPhantomAddress(solana.publicKey.toString());
    }
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(custodyWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connect Phantom Wallet
  const connectPhantom = async () => {
    try {
      setErrorMessage(null);
      const solana = (window as any).solana;
      if (!solana?.isPhantom) {
        setErrorMessage('Phantom wallet not detected in your browser. Please install Phantom or use manual deposit.');
        return;
      }
      const resp = await solana.connect();
      const addr = resp.publicKey.toString();
      setPhantomConnected(true);
      setPhantomAddress(addr);
      setStatusMessage(`Phantom connected: ${addr.slice(0, 4)}...${addr.slice(-4)}`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  // Direct deposit via Phantom
  const handlePhantomDeposit = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Preparing on-chain transfer...');
    try {
      const solana = (window as any).solana;
      if (!solana?.publicKey) {
        throw new Error('Please connect your Phantom wallet first.');
      }

      if (depositAmountSol <= 0) {
        throw new Error('Please enter a deposit amount greater than 0 SOL.');
      }

      const rpcEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/rpc/proxy` : 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      const fromPubkey = solana.publicKey;
      const toPubkey = new PublicKey(custodyWallet.address);
      const lamports = Math.round(depositAmountSol * 1e9);

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey
      }).add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports
        })
      );

      setStatusMessage('Please approve the deposit in your Phantom wallet...');
      const { signature } = await solana.signAndSendTransaction(transaction);

      setStatusMessage(`Transaction broadcasted: ${signature.slice(0, 8)}... Awaiting cluster confirmation...`);
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, 'confirmed');

      setStatusMessage('Verifying deposit with application custody ledger...');
      const verifyRes = await fetch('/api/funds/deposit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionSignature: signature })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Server failed to verify deposit receipt');
      }

      setDepositReceipt(verifyData);
      setStatusMessage(`Successfully deposited ${depositAmountSol} SOL! Funds now held in app custody.`);
      await fetchCustodyInfo();
      onSuccess();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Verify manual transaction signature
  const handleVerifyManualSignature = async () => {
    if (!manualSignature.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Verifying transaction on Solana Mainnet...');
    try {
      const res = await fetch('/api/funds/deposit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionSignature: manualSignature.trim() })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Could not verify transaction on Solana cluster');
      }
      setDepositReceipt(data);
      setStatusMessage(`Verified deposit of ${data.amountSol} SOL! Funds now credited to custody wallet.`);
      await fetchCustodyInfo();
      onSuccess();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Scan for any new inbound transactions
  const handleScanDeposits = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Scanning Solana Mainnet for new inbound transfers...');
    try {
      const res = await fetch('/api/funds/deposit/scan', { method: 'POST' });
      const data = await res.json();
      if (data.newDepositsFound > 0) {
        setStatusMessage(`Found and verified ${data.newDepositsFound} new on-chain deposit(s)!`);
        await fetchCustodyInfo();
        onSuccess();
      } else {
        setStatusMessage(`Scanned ${data.scannedCount} recent cluster transactions. No unrecorded deposits found.`);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-neutral-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">Deposit & Possess Real Funds</h2>
              <p className="text-xs text-neutral-400">Hold operational capital on Solana Mainnet for live financial execution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custody Wallet Status Box */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              App Custody & Execution Wallet (Possesses Real Funds)
            </span>
            <span className="text-emerald-400 font-mono font-semibold">
              Balance: {custodyWallet.balanceSol.toFixed(6)} SOL
            </span>
          </div>

          <div className="flex items-center justify-between bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800/80 font-mono text-xs">
            <span className="truncate text-emerald-300 pr-2">{custodyWallet.address}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={copyAddress}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a 
                href={custodyWallet.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
                title="View on Solscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Guaranteed Destination for Sweeps:</span>
            <span className="font-mono text-purple-300 truncate max-w-[220px]" title={custodyWallet.masterTreasury}>
              {custodyWallet.masterTreasury}
            </span>
          </div>
        </div>

        {/* Deposit Methods Tabs */}
        <div className="mt-5 space-y-4">
          
          {/* Method 1: Phantom Direct Deposit */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-neutral-200">1-Click Deposit via Phantom / Solflare</span>
              </div>
              {!phantomConnected ? (
                <button
                  onClick={connectPhantom}
                  className="px-2.5 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
                >
                  Connect Phantom
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-mono">
                  Connected: {phantomAddress?.slice(0, 4)}...{phantomAddress?.slice(-4)}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block">Select or Enter Amount (SOL):</label>
                <div className="flex gap-2 mb-2">
                  {[0.005, 0.01, 0.05, 0.1].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmountSol(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition ${
                        depositAmountSol === val 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {val} SOL
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={depositAmountSol}
                  onChange={(e) => setDepositAmountSol(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="0.01"
                />
              </div>

              <button
                onClick={phantomConnected ? handlePhantomDeposit : connectPhantom}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing on Solana Cluster...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>{phantomConnected ? `Deposit ${depositAmountSol} SOL to App Custody` : 'Connect & Deposit SOL'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 2: Manual External Transfer */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-200">Manual Transfer (Any Exchange / Wallet)</span>
              <button
                onClick={handleScanDeposits}
                disabled={loading}
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition"
                title="Scan blockchain for incoming transfers"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Scan for Inflows</span>
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Send SOL directly to the custody address above from any exchange (Coinbase, Kraken, Binance) or wallet. Then paste the transaction signature below:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualSignature}
                onChange={(e) => setManualSignature(e.target.value)}
                placeholder="Paste Solana Transaction Signature..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleVerifyManualSignature}
                disabled={loading || !manualSignature.trim()}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-medium transition"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        {/* Feedback / Status Messages */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {depositReceipt && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-emerald-500/30 text-xs">
            <div className="font-semibold text-emerald-400 mb-1">Receipt Confirmed On-Chain:</div>
            <div className="font-mono text-neutral-300 truncate">Sig: {depositReceipt.transactionSignature}</div>
            {depositReceipt.explorerUrl && (
              <a 
                href={depositReceipt.explorerUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 underline inline-flex items-center gap-1 mt-1 text-[11px]"
              >
                Verify on Solscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-4 text-[11px] text-neutral-500 text-center">
          Funds are held in isolated cryptographic custody on Solana Mainnet. 100% withdrawable to your Master Treasury at any time.
        </div>
      </div>
    </div>
  );
};
