"use client";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from 'next/link';

interface Task {
    id: number;
    amount: number;
    title: string;
    options: {
        id: number;
        image_url: string;
        task_id: number;
    }[];
}

export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

    function fetchNextTask() {
        setLoading(true);
        axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })
            .then(res => {
                setCurrentTask(res.data.task);
                setLoading(false);
            })
            .catch(e => {
                setLoading(false);
                setCurrentTask(null);
            });
    }

    useEffect(() => {
        fetchNextTask();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-3"></div>
                <div className="text-slate-400 text-sm">
                    Checking for available tasks...
                </div>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="min-h-[65vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center p-8 rounded-xl bg-[#111520] border border-slate-800">
                    <h2 className="text-lg font-semibold text-white mb-2">
                        No tasks currently available
                    </h2>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        There are no active submissions awaiting review right now. You can check back shortly or create a new test task.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={fetchNextTask}
                            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                        >
                            Refresh
                        </button>
                        <a
                            href="http://localhost:3000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition"
                        >
                            Create Task
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Task Card Header */}
            <div className="bg-[#111520] border border-slate-800 rounded-xl p-6 sm:p-7 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Task #{currentTask.id}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            +0.001 SOL reward
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {currentTask.title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Click the option that best answers the prompt.
                    </p>
                </div>

                {submitting && (
                    <div className="text-xs font-medium text-indigo-400 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                        Submitting vote...
                    </div>
                )}
            </div>

            {/* Voting Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentTask.options.map((option, index) => {
                    const isSelected = selectedOptionId === option.id;

                    return (
                        <div
                            key={option.id}
                            onClick={async () => {
                                if (submitting) return;
                                setSelectedOptionId(option.id);
                                setSubmitting(true);
                                try {
                                    const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                                        taskId: currentTask.id.toString(),
                                        selection: option.id.toString()
                                    }, {
                                        headers: {
                                            "Authorization": localStorage.getItem("token")
                                        }
                                    });

                                    const nextTask = response.data.nextTask;
                                    if (nextTask) {
                                        setCurrentTask(nextTask);
                                    } else {
                                        setCurrentTask(null);
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Submission failed. Ensure your wallet is connected.");
                                } finally {
                                    setSubmitting(false);
                                    setSelectedOptionId(null);
                                }
                            }}
                            className={`group bg-[#111520] border rounded-xl overflow-hidden cursor-pointer transition flex flex-col ${
                                isSelected ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-800 hover:border-slate-600"
                            }`}
                        >
                            <div className="relative aspect-[4/3] w-full bg-slate-900 border-b border-slate-800">
                                <img
                                    src={option.image_url}
                                    alt={`Option ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2.5 left-2.5">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-black/70 backdrop-blur-sm text-slate-200 border border-white/10">
                                        Option {String.fromCharCode(65 + index)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition">
                                    Select this option
                                </span>
                                <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition">
                                    Vote →
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
};