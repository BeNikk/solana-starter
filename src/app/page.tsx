"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@/components/wallet";
import SendSol from "@/components/sendSol";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/theme-changer";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";

export default function Home() {
  const wallet = useWallet();
  const [balance, setBalance] = useState("");

  useEffect(() => {
    async function fetchBalance() {
      if (wallet.publicKey) {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const publicKey = new PublicKey(wallet.publicKey);
        const balance = await connection.getBalance(publicKey);
        setBalance((balance / 1e9).toFixed(4)); // lamports to SOL
      }
    }
    fetchBalance();
  }, [wallet]);

  const handleAirdrop = async () => {
    if (wallet.publicKey) {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      await connection.requestAirdrop(wallet.publicKey, 1e9); // 1 SOL
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-12 py-10">
      {/* Header bar with ModeToggle */}
      <div className="flex justify-end max-w-3xl mx-auto mb-4">
        <ModeToggle />
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Solana Assignment 1
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Wallet Connection</h2>
              <WalletMultiButton />
            </div>
            <Separator />
            {wallet.publicKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Address</span>
                  <div className="flex items-center justify-start" >
                  <CopyButton content={wallet.publicKey.toString()} size="sm" className="m-2" />
                  <Badge variant="outline" className="text-xs ">
                    {wallet.publicKey.toString()}
                  </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                  <span className="font-medium text-green-500 dark:text-green-400">
                    {balance} SOL
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">Wallet not connected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Airdrop Test SOL</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleAirdrop}>Airdrop 1 SOL</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Send SOL</CardTitle>
          </CardHeader>
          <CardContent>
            <SendSol />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
