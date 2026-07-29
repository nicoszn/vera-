'use client';
import { useState, useEffect } from 'react';

export default function AgentConsole() {
  const [objective, setObjective] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Poll for updates while the agent runs on Railway
  useEffect(() => {
    if (!activeTaskId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/agent-status?taskId=${activeTaskId}`);
      const data = await res.json();
      setTaskData(data);

      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        clearInterval(interval);
        setLoading(false);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTaskId]);

  const startAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTaskData(null);

    const res = await fetch('/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective }),
    });
    const data = await res.json();
    setActiveTaskId(data.taskId);
  };

  return (
    <main className="p-8 max-w-5xl mx-auto grid grid-cols-3 gap-6 h-screen bg-slate-50 text-slate-900">
      <div className="col-span-1 bg-white border p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Autonomous Operator</h1>
          <p className="text-xs text-slate-500 mb-6">Orchestrated with Next.js & Railway Engine</p>
          
          <form onSubmit={startAgent} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400">Objective Target</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., Set up a temporary Docker cluster environment configuration file..."
                className="w-full mt-1 p-3 border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black h-32"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !objective}
              className="w-full bg-black text-white text-sm font-medium py-3 px-4 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
            >
              {loading ? 'Agent Executing...' : 'Deploy Autonomous Loop'}
            </button>
          </form>
        </div>

        {taskData && (
          <div className="mt-4 p-4 rounded-lg border text-xs bg-slate-50">
            <span className="font-bold">Task Status:</span>{' '}
            <span className={`font-semibold ${taskData.status === 'RUNNING' ? 'text-amber-500' : taskData.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-700'}`}>
              {taskData.status}
            </span>
          </div>
        )}
      </div>

      <div className="col-span-2 bg-zinc-950 text-zinc-200 border p-6 rounded-xl shadow-inner font-mono text-sm overflow-y-auto flex flex-col justify-between">
        <div className="space-y-3">
          <div className="text-xs text-zinc-500 border-b border-zinc-800 pb-2">EXECUTION STREAM LOGS</div>
          {!taskData && <div className="text-zinc-600 text-xs italic">System idle. Awaiting command orchestration...</div>}
          
          {taskData?.logs?.map((log: any, idx: number) => (
            <div key={idx} className="p-2 bg-zinc-900 rounded border border-zinc-800 text-xs">
              <span className="text-purple-400 font-bold">[{log.type.toUpperCase()}]</span> {log.message}
            </div>
          ))}
        </div>

        {taskData?.output && (
          <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
            <div className="text-xs text-emerald-400 font-bold mb-1">FINAL OBJECTIVE OUTPUT:</div>
            <p className="text-emerald-200 text-xs whitespace-pre-wrap">{taskData.output}</p>
          </div>
        )}
      </div>
    </main>
  );
}
