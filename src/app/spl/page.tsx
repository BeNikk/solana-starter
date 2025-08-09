"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  clusterApiUrl, 
  Connection, 
  Transaction,
  SystemProgram,
  Keypair,
  PublicKey
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getAccount,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { WalletMultiButton } from "@/components/wallet";

export default function SplPage() {
  const wallet = useWallet();
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [tokenAccount, setTokenAccount] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const handleCreateMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.warning("Please connect your wallet");
      return;
    }

    setLoading(true);
    
    try {
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey
      );

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mint,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      transaction.add(
        createInitializeMintInstruction(
          mint,
          6, // as said 6 decimals
          wallet.publicKey,
          wallet.publicKey
        )
      );

      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAddress,
          wallet.publicKey,
          mint 
        )
      );

      transaction.add(
        createMintToInstruction(
          mint,
          associatedTokenAddress,
          wallet.publicKey,
          10 * 10 ** 6
        )
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      transaction.partialSign(mintKeypair);

      const signedTransaction = await wallet.signTransaction(transaction);

      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      
      await connection.confirmTransaction({
        signature: txid,
        blockhash,
        lastValidBlockHeight
      });

      setMintAddress(mint.toBase58());
      setTokenAccount(associatedTokenAddress.toBase58());

      const accountInfo = await getAccount(connection, associatedTokenAddress);
      setTokenBalance(Number(accountInfo.amount) / 10 ** 6);

      toast.success("Token created and minted successfully!");
      
    } catch (error) {
      console.error("Error creating token:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error creating token: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!tokenAccount) return;
    
    try {
      const tokenAccountPublicKey = new PublicKey(tokenAccount);
      const accountInfo = await getAccount(connection, tokenAccountPublicKey);
      setTokenBalance(Number(accountInfo.amount) / 10 ** 6);
      toast.success("Balance refreshed!");
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Error refreshing balance");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-12 py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">SPL Token Creator</CardTitle>
            <WalletMultiButton />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This will create a new SPL token with 6 decimals and mint 10 tokens to your wallet.
              </p>
              <Button 
                onClick={handleCreateMint} 
                disabled={!wallet.connected || loading}
                className="w-full"
              >
                {loading ? "Creating Token..." : "Create & Mint Token"}
              </Button>
            </div>

            {mintAddress && (
              <div className="mt-6 p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Token Created Successfully!</h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Mint Address:</strong>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                      {mintAddress}
                    </p>
                  </div>
                  
                  <div>
                    <strong>Token Account:</strong>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                      {tokenAccount}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Token Balance:</strong> {tokenBalance} tokens
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshBalance}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                     You can view this token in your wallet or add it using the mint address above.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}