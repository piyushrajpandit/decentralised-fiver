"use client";
import { Appbar } from '@/components/Appbar';
import { BACKEND_URL } from '@/utils';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';

async function getTaskDetails(taskId: string) {
    const response = await axios.get(`${BACKEND_URL}/v1/user/task?taskId=${taskId}`);
    return response.data;
}

export default function Page({params: { 
    taskId 
}}: {params: { taskId: string }}) {
    const [result, setResult] = useState<Record<string, {
        count: number;
        option: {
            imageUrl: string;
        };
    }>>({});
    const [taskDetails, setTaskDetails] = useState<{
        title?: string;
        id?: number;
    }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getTaskDetails(taskId)
            .then((data) => {
                setResult(data.result);
                setTaskDetails(data.taskDetails);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [taskId]);

    const optionsArray = Object.keys(result || {}).map(id => ({
        id,
        count: result[id].count,
        imageUrl: result[id].option.imageUrl
    }));

    const totalVotes = optionsArray.reduce((acc, curr) => acc + curr.count, 0);
    const maxVotes = optionsArray.length > 0 ? Math.max(...optionsArray.map(o => o.count)) : 0;

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100">
            <Appbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Back Nav */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                    >
                        <span>←</span>
                        <span>Back to all tasks</span>
                    </Link>
                </div>

                {/* Task Header */}
                <div className="bg-[#111520] border border-slate-800 rounded-xl p-6 sm:p-7 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Task #{taskId}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-400">
                                {totalVotes} {totalVotes === 1 ? "response" : "responses"}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {loading ? "Loading task..." : taskDetails.title || "Image Comparison Task"}
                        </h1>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition"
                    >
                        Refresh Data
                    </button>
                </div>

                {/* Options Grid */}
                {loading ? (
                    <div className="text-center py-16 text-slate-500 text-sm">
                        Loading results...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {optionsArray.map((option, index) => {
                            const percentage = totalVotes > 0 ? Math.round((option.count / totalVotes) * 100) : 0;
                            const isTopChoice = option.count === maxVotes && maxVotes > 0;

                            return (
                                <div
                                    key={option.id}
                                    className={`bg-[#111520] border rounded-xl overflow-hidden flex flex-col ${
                                        isTopChoice ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : "border-slate-800"
                                    }`}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] w-full bg-slate-900 border-b border-slate-800/80">
                                        <img
                                            src={option.imageUrl}
                                            alt={`Option ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2.5 left-2.5">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-black/70 backdrop-blur-sm text-slate-200 border border-white/10">
                                                Option {String.fromCharCode(65 + index)}
                                            </span>
                                        </div>

                                        {isTopChoice && (
                                            <div className="absolute top-2.5 right-2.5">
                                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/90 text-white shadow-sm">
                                                    Top Choice
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metrics */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-baseline justify-between mb-2">
                                                <span className="text-xl font-bold text-white">
                                                    {option.count}{" "}
                                                    <span className="text-xs font-normal text-slate-400">
                                                        {option.count === 1 ? "vote" : "votes"}
                                                    </span>
                                                </span>
                                                <span className={`text-sm font-semibold ${isTopChoice ? "text-emerald-400" : "text-slate-300"}`}>
                                                    {percentage}%
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        isTopChoice ? "bg-emerald-500" : "bg-indigo-500"
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}