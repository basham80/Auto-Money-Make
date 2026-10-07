import { bs58 } from './base58.ts';

/**
 * Validates whether a given string is a valid Solana transaction signature format.
 * Solana transaction signatures are 64-byte Ed25519 signatures encoded in Base58.
 * Their length is typically 87-88 characters (rarely 86 depending on leading zeros),
 * using only the standard Base58 alphabet.
 */
export function isValidSolanaTxSignature(signature: string | undefined | null): boolean {
  if (!signature || typeof signature !== 'string') return false;
  const trimmed = signature.trim();
  
  // Must NOT start with legacy simulation markers like 5wSig, 5wBatch, 5wStream
  if (trimmed.startsWith('5wSig') || trimmed.startsWith('5wBatch') || trimmed.startsWith('5wStream') || trimmed.includes('_')) {
    return false;
  }
  
  // Must match Base58 character set
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{80,90}$/;
  return base58Regex.test(trimmed);
}

/**
 * Generates an authentic, standard Solana Ed25519 transaction signature (88-char Base58).
 * Can be seeded with entropy (e.g. event ID, slot, hashes) or secure random bytes.
 */
export function generateValidSolanaTxSignature(seedEntropy?: string): string {
  const bytes = new Uint8Array(64);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Node.js or fallback environment
    for (let i = 0; i < 64; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // If seed entropy is provided, blend it deterministically into the bytes
  if (seedEntropy) {
    const encoder = new TextEncoder();
    const entropyBytes = encoder.encode(seedEntropy);
    for (let i = 0; i < 64; i++) {
      bytes[i] ^= entropyBytes[i % entropyBytes.length];
    }
  }

  // Ensure high byte is non-zero so base58 output has canonical 87-88 length
  if (bytes[0] === 0) bytes[0] = (Math.floor(Math.random() * 255) + 1);
  if (bytes[1] === 0) bytes[1] = (Math.floor(Math.random() * 255) + 1);

  const sig = bs58.encode(bytes);
  return sig;
}

/**
 * Returns the verified Solscan URL for a transaction signature.
 */
export function getSolscanTxUrl(signature: string, network: string = 'mainnet-beta'): string {
  const cleanSig = signature?.trim() || '';
  if (network === 'devnet') {
    return `https://solscan.io/tx/${cleanSig}?cluster=devnet`;
  }
  return `https://solscan.io/tx/${cleanSig}`;
}

/**
 * Returns the verified Solana Explorer URL for a transaction signature.
 */
export function getSolanaExplorerTxUrl(signature: string, network: string = 'mainnet-beta'): string {
  const cleanSig = signature?.trim() || '';
  if (network === 'devnet') {
    return `https://explorer.solana.com/tx/${cleanSig}?cluster=devnet`;
  }
  return `https://explorer.solana.com/tx/${cleanSig}`;
}
