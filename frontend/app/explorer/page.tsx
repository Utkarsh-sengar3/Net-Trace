'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Network,
  Filter,
  Users2,
  GitBranch,
  Search,
  Sparkles,
  Info,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { CytoscapeGraph } from '@/components/network/CytoscapeGraph';
import { NodeInspectorDrawer } from '@/components/network/NodeInspectorDrawer';
import { CommandSearchModal } from '@/components/layout/CommandSearchModal';
import { DisclaimerBadge } from '@/components/layout/DisclaimerBadge';
import { api } from '@/lib/api';
import { fallbackData } from '@/lib/fallbackData';
import { NodeItem, EdgeItem } from '@/lib/types';
import { COMMUNITY_COLORS } from '@/lib/constants';

function ExplorerContent() {
  const searchParams = useSearchParams();
  const initialNode = searchParams.get('node');

  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<EdgeItem[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNode);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [bridgeOnly, setBridgeOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    loadGraphData();
  }, [selectedCommunity]);

  async function loadGraphData() {
    setLoading(true);
    try {
      const res = await api.getGraphView({
        community_id: selectedCommunity !== null ? selectedCommunity : undefined,
        max_nodes: 350,
        max_edges: 1200,
      });
      if (res && res.nodes && res.nodes.length > 0) {
        setNodes(res.nodes);
        setEdges(res.edges);
      } else {
        const fb = fallbackData.getGraphView(selectedCommunity);
        setNodes(fb.nodes);
        setEdges(fb.edges);
      }
    } catch (err) {
      console.warn('Failed to load graph view, falling back to local dataset:', err);
      const fb = fallbackData.getGraphView(selectedCommunity);
      setNodes(fb.nodes);
      setEdges(fb.edges);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen">
      <Topbar
        onSearchClick={() => setIsSearchOpen(true)}
        title="Interactive Network Explorer"
        subtitle="Force-directed WebGL topology canvas with Louvain cluster isolation and bridge analysis"
      />

      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
      />

      <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls and Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          {/* Community Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-500 uppercase mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Community:
            </span>
            <button
              onClick={() => setSelectedCommunity(null)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                selectedCommunity === null
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700/60'
              }`}
            >
              All (8 Clusters)
            </button>

            {Array.from({ length: 8 }).map((_, cid) => {
              const colorInfo = COMMUNITY_COLORS[cid];
              const isSelected = selectedCommunity === cid;
              return (
                <button
                  key={cid}
                  onClick={() => setSelectedCommunity(isSelected ? null : cid)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border font-bold text-white shadow-sm'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                  style={{ borderColor: isSelected ? colorInfo.hex : undefined }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorInfo.hex }} />
                  <span>C{cid}</span>
                </button>
              );
            })}
          </div>

          {/* Bridge Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBridgeOnly(!bridgeOnly)}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-xl border flex items-center gap-2 transition-all ${
                bridgeOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <span>Bridge Nodes Only</span>
            </button>

            <button
              onClick={loadGraphData}
              className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
              title="Reload Graph Canvas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Cytoscape Canvas */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Computing force-directed topology & Level-Of-Detail subgraphs...</span>
              </div>
            </div>
          )}

          <CytoscapeGraph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onNodeSelect={(nid) => setSelectedNodeId(nid)}
            highlightCommunityId={selectedCommunity}
            highlightBridgeOnly={bridgeOnly}
            height="640px"
          />

          {/* Node Inspector Drawer */}
          <NodeInspectorDrawer
            nodeId={selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
            onSelectNode={(nid) => setSelectedNodeId(nid)}
          />
        </div>

        {/* Responsible Use Disclaimer */}
        <DisclaimerBadge type="gplus" compact />
      </main>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-slate-950 p-8 text-center text-xs font-mono text-slate-500">Loading Network Explorer...</div>}>
      <ExplorerContent />
    </Suspense>
  );
}
