"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ChangeEvent, useState } from "react";
import * as web3 from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SendSol() {
    const [signature, setSignature] = useState("");
    const [amount, setAmount] = useState("0");
    const [address, setAddress] = useState("");
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const link = () =>
        signature
            ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            : "";

    async function sendSol(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();
            if (!connection || !publicKey) return;

            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey(address);

            const sendSolInstruction = web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: LAMPORTS_PER_SOL * Number(amount),
            });

            transaction.add(sendSolInstruction);
            const sig = await sendTransaction(transaction, connection);
            setSignature(sig);
            toast.success("Transaction successful");

        } catch (error) {
            toast.error("something went wrong");
            console.log(error);

        }

    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardHeader>
                    <CardTitle>Send SOL</CardTitle>
                    <CardDescription>Transfer SOL on the Solana Devnet</CardDescription>
                </CardHeader>
                <CardContent>
                    {publicKey ? (
                        <form onSubmit={sendSol} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (SOL)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 0.1"
                                    required
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setAmount(e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="recipient">Recipient Address</Label>
                                <Input
                                    id="recipient"
                                    type="text"
                                    placeholder="Enter recipient wallet address"
                                    required
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setAddress(e.target.value)
                                    }
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Send SOL
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center text-green-500 font-medium">
                            Please connect your wallet.
                        </div>
                    )}
                </CardContent>

                {signature && (
                    <>
                        <Separator />
                        <CardFooter className="flex flex-col text-center">
                            <p className="text-sm text-muted-foreground">
                                View your transaction:
                            </p>
                            <a
                                href={link()}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline text-sm font-medium mt-1"
                            >
                                Solana Explorer
                            </a>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}
