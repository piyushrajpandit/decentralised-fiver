export const Hero = () => {
    return (
        <section className="pt-14 pb-8 text-center max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-300 text-xs font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Decentralized Micro-Tasks on Solana</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Test thumbnails and collect human feedback
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Upload image variations and let independent workers vote on the best option. Fast, verifiable results powered by Solana micro-transactions.
            </p>
        </section>
    );
};