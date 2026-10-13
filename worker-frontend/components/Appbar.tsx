"use client";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';
import Link from 'next/link';

export const Appbar = () => {
    const { publicKey, signMessage } = useWallet();
    const [balance, setBalance] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isPayingOut, setIsPayingOut] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function signAndSend() {
        if (!publicKey) return;
        try {
            const message = new TextEncoder().encode("Sign into mechanical turks as a worker");
            const signature = await signMessage?.(message);
            const response = await axios.post(`${BACKEND_URL}/v1/worker/signin`, {
                signature,
                publicKey: publicKey?.toString()
            });

            setBalance(response.data.amount);
            localStorage.setItem("token", response.data.token);
        } catch (e) {
            console.error("Worker signin error:", e);
        }
    }

    useEffect(() => {
        signAndSend();
    }, [publicKey]);

    async function handlePayout() {
        setIsPayingOut(true);
        try {
            await axios.post(`${BACKEND_URL}/v1/worker/payout`, {}, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            alert("Payout initiated. Check your wallet balance shortly.");
        } catch (e: any) {
            console.error(e);
            alert("Payout failed. Ensure you have accumulated earnings.");
        } finally {
            setIsPayingOut(false);
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-800/80">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            W
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-white">
                            turkify <span className="text-xs font-normal text-slate-400">worker</span>
                        </span>
                    </Link>

                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Solana Devnet
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <a
                        href="http://localhost:3000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition px-2 py-1"
                    >
                        Task Creator App
                        <span className="text-xs">↗</span>
                    </a>

                    {/* Payout Button */}
                    <button
                        onClick={handlePayout}
                        disabled={isPayingOut}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition disabled:opacity-50"
                    >
                        Withdraw ({balance} SOL)
                    </button>

                    {/* Solana Wallet Button */}
                    <div>
                        {mounted && (publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />)}
                    </div>
                </div>
            </div>
        </header>
    );
};