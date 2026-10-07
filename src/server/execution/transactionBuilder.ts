import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import crypto from 'crypto';
import { solanaRpcMesh } from '../solanaRpc.ts';
import { signerService } from '../signer/signerService.ts';

export interface BuiltTransactionResult {
  transaction: Transaction;
  serializedMessageBase64: string;
  messageDigest: string; // SHA-256
  feePayer: string;
  recentBlockhash: string;
  baseFeeSol: number;
  priorityFeeLamports: number;
  totalEstimatedFeeSol: number;
}

export class TransactionBuilder {
  /**
   * Constructs a real Solana Transfer transaction with priority fee support and SHA-256 message fingerprinting.
   */
  public async buildTransferTransaction(params: {
    fromAddress: string;
    toAddress: string;
    amountSol: number;
    priorityFeeLamports?: number;
    memo?: string;
  }): Promise<BuiltTransactionResult> {
    if (params.fromAddress === params.toAddress) {
      throw new Error(`Self-transfer prohibited: Source wallet and Destination wallet cannot be identical (${params.fromAddress}). Real transactions must originate from a distinct verifiable source (e.g. Agent Fleet or Liquidity Pool) into the Destination Treasury.`);
    }

    const fromPubkey = new PublicKey(params.fromAddress);
    const toPubkey = new PublicKey(params.toAddress);
    const lamports = Math.round(params.amountSol * LAMPORTS_PER_SOL);

    const { conn } = await solanaRpcMesh.getHealthyConnection();
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');

    const tx = new Transaction({
      feePayer: fromPubkey,
      recentBlockhash: blockhash
    });

    // Add priority fee instruction if specified
    if (params.priorityFeeLamports && params.priorityFeeLamports > 0) {
      const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.round(params.priorityFeeLamports * 1000)
      });
      tx.add(priorityIx);
    }

    // Add system transfer instruction
    const transferIx = SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports
    });
    tx.add(transferIx);

    // Freeze and serialize message
    const messageBytes = tx.serializeMessage();
    const messageDigest = crypto.createHash('sha256').update(messageBytes).digest('hex');
    const feeEstimation = signerService.estimateFee(tx.instructions.length, 200000, params.priorityFeeLamports ? 1000 : 0);

    return {
      transaction: tx,
      serializedMessageBase64: Buffer.from(messageBytes).toString('base64'),
      messageDigest,
      feePayer: params.fromAddress,
      recentBlockhash: blockhash,
      baseFeeSol: feeEstimation.baseFeeSol,
      priorityFeeLamports: params.priorityFeeLamports || 0,
      totalEstimatedFeeSol: feeEstimation.totalFeeSol
    };
  }

  /**
   * Builds a multi-transfer transaction combining multiple compatible transfers into a single transaction.
   */
  public async buildMultiTransferTransaction(params: {
    fromAddress: string;
    transfers: Array<{ toAddress: string; amountSol: number }>;
    priorityFeeLamports?: number;
  }): Promise<BuiltTransactionResult> {
    const fromPubkey = new PublicKey(params.fromAddress);
    const { conn } = await solanaRpcMesh.getHealthyConnection();
    const { blockhash } = await conn.getLatestBlockhash('confirmed');

    const tx = new Transaction({
      feePayer: fromPubkey,
      recentBlockhash: blockhash
    });

    if (params.priorityFeeLamports && params.priorityFeeLamports > 0) {
      tx.add(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.round(params.priorityFeeLamports * 1000)
      }));
    }

    for (const t of params.transfers) {
      const toPubkey = new PublicKey(t.toAddress);
      const lamports = Math.round(t.amountSol * LAMPORTS_PER_SOL);
      tx.add(SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports
      }));
    }

    const messageBytes = tx.serializeMessage();
    const messageDigest = crypto.createHash('sha256').update(messageBytes).digest('hex');
    const feeEstimation = signerService.estimateFee(tx.instructions.length, 300000, 1000);

    return {
      transaction: tx,
      serializedMessageBase64: Buffer.from(messageBytes).toString('base64'),
      messageDigest,
      feePayer: params.fromAddress,
      recentBlockhash: blockhash,
      baseFeeSol: feeEstimation.baseFeeSol,
      priorityFeeLamports: params.priorityFeeLamports || 0,
      totalEstimatedFeeSol: feeEstimation.totalFeeSol
    };
  }
}

export const transactionBuilder = new TransactionBuilder();
