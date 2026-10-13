"use client";
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Link from 'next/link';

const DEMO_TITLE = "Which thumbnail would you click?";
const DEMO_IMAGES = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80"
];

export const Upload = () => {
    const [images, setImages] = useState<string[]>(DEMO_IMAGES);
    const [title, setTitle] = useState(DEMO_TITLE);
    const [txSignature, setTxSignature] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [copied, setCopied] = useState(false);

    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    async function onSubmit() {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
                options: images.map(image => ({
                    imageUrl: image,
                })),
                title,
                signature: txSignature
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            router.push(`/task/${response.data.id}`);
        } catch (e: any) {
            console.error("Submission error:", e);
            alert("Error creating task. Please ensure you are connected with Phantom wallet.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function makePayment() {
        if (!publicKey) {
            alert("Please connect your Phantom wallet first.");
            return;
        }

        setIsPaying(true);
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey("2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq"),
                    lamports: 100000000, // 0.1 SOL
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            const signature = await sendTransaction(transaction, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            setTxSignature(signature);
        } catch (e: any) {
            console.error("Payment failed:", e);
            alert(`Payment could not complete: ${e.message || "Ensure your wallet has devnet SOL."}`);
        } finally {
            setIsPaying(false);
        }
    }

    function handleCopy(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function removeImage(index: number) {
        setImages(images.filter((_, i) => i !== index));
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Clean Demo Shortcut Notice */}
            <div className="mb-6 px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="text-xs text-slate-300">
                        Looking for a quick demonstration? You can inspect the existing sample data directly.
                    </span>
                </div>
                <Link
                    href="/task/1"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                >
                    View Task #1 Results →
                </Link>
            </div>

            {/* Task Form Card */}
            <div className="bg-[#111520] border border-slate-800 rounded-xl p-6 sm:p-8">
                <div className="border-b border-slate-800 pb-5 mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Create a New Task</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Upload image choices and submit on Solana Devnet.</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                        Fee: 0.1 SOL
                    </span>
                </div>

                {/* Question Input */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Question or Task Title
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className="w-full bg-[#0b0e14] border border-slate-700/80 focus:border-indigo-500 focus:outline-none text-slate-100 rounded-lg px-3.5 py-2.5 text-sm transition placeholder:text-slate-600"
                        placeholder="e.g., Which thumbnail would you click?"
                    />
                </div>

                {/* Variations */}
                <div className="mb-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                        Image Variations ({images.length})
                    </label>
                    <div className="flex flex-wrap gap-4 items-center">
                        {images.map((image, idx) => (
                            <UploadImage
                                key={idx}
                                image={image}
                                onImageAdded={(imageUrl) => setImages([...images, imageUrl])}
                                onImageRemoved={() => removeImage(idx)}
                            />
                        ))}
                        <UploadImage
                            onImageAdded={(imageUrl) => setImages([...images, imageUrl])}
                        />
                    </div>
                </div>

                {/* Transaction Notice */}
                {txSignature && (
                    <div className="mb-6 p-4 rounded-lg bg-slate-900 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-400">
                                {txSignature === "DEMO_MODE" ? "Demo Mode Active" : "Transaction Confirmed"}
                            </span>
                            {txSignature !== "DEMO_MODE" && (
                                <a
                                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-400 hover:underline"
                                >
                                    Solana Explorer ↗
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-2 bg-[#0b0e14] p-2 rounded border border-slate-800">
                            <span className="text-xs font-mono text-slate-400 truncate flex-1 select-all">
                                {txSignature}
                            </span>
                            <button
                                onClick={() => handleCopy(txSignature)}
                                type="button"
                                className="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded transition"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    {!txSignature && (
                        <button
                            onClick={() => setTxSignature("DEMO_MODE")}
                            type="button"
                            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                        >
                            Skip Payment (Demo Mode)
                        </button>
                    )}
                    <button
                        onClick={txSignature ? onSubmit : makePayment}
                        disabled={isPaying || isSubmitting}
                        type="button"
                        className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                        {isPaying ? "Confirming..." :
                         isSubmitting ? "Creating..." :
                         txSignature ? "Submit Task" :
                         "Pay 0.1 SOL & Publish"}
                    </button>
                </div>
            </div>
        </div>
    );
};
