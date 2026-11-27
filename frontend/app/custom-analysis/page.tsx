'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Network,
  GitBranch,
  Users2,
  Cpu,
  Layers,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  FileText,
  Radio,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { CytoscapeGraph } from '@/components/network/CytoscapeGraph';
import { NodeItem, EdgeItem } from '@/lib/types';
import { COMMUNITY_COLORS } from '@/lib/constants';

// Sample Forensic Datasets for 1-click exploration
const SAMPLE_PRESETS: Record<string, { name: string; description: string; data: string }> = {
  hawala: {
    name: 'Hawala & Money Laundering Network',
    description: '3-tier illicit remittance syndicate connecting source accounts, intermediary money mules, and international brokers.',
    data: `source,target,weight,type
Broker_Dubai,Mule_Mumbai_1,15.5,wire
Broker_Dubai,Mule_Mumbai_2,12.0,wire
Broker_Dubai,Broker_Karachi,45.0,settlement
Broker_Karachi,Mule_Lahore_1,18.0,wire
Broker_Karachi,Mule_Lahore_2,22.0,wire
Mule_Mumbai_1,Shell_Co_Exports,8.5,commercial
Mule_Mumbai_1,Smurf_Account_A,4.2,cash_deposit
Mule_Mumbai_2,Smurf_Account_B,6.1,cash_deposit
Mule_Mumbai_2,Shell_Co_Exports,7.0,commercial
Smurf_Account_A,Retail_Storefront_1,2.0,retail_layer
Smurf_Account_B,Retail_Storefront_2,3.5,retail_layer
Mule_Lahore_1,Exchange_House_A,9.0,remittance
Mule_Lahore_2,Exchange_House_B,11.5,remittance
Exchange_House_A,Offshore_Trust_X,14.0,layered_transfer
Exchange_House_B,Offshore_Trust_X,16.5,layered_transfer
Offshore_Trust_X,Broker_Dubai,28.0,repatriation
Shell_Co_Exports,Broker_London,19.2,invoice_padding
Broker_London,Offshore_Trust_X,20.0,trust_distribution
Smurf_Account_C,Mule_Mumbai_1,3.0,cash_deposit
Smurf_Account_D,Mule_Mumbai_2,2.8,cash_deposit
Courier_Delhi,Mule_Mumbai_1,5.0,cash_courier
Courier_Delhi,Mule_Mumbai_2,5.0,cash_courier
Courier_Delhi,Smurf_Account_C,1.5,cash_courier`,
  },
  cdr: {
    name: 'Telecom CDR Syndicate Tracing',
    description: 'Call Detail Records mapping burner phone communications, cross-cell dispatchers, and field operatives.',
    data: `caller,receiver,calls,duration
Dispatcher_East,Operative_E1,14,320
Dispatcher_East,Operative_E2,18,410
Dispatcher_East,Cross_Hub_Coordinator,32,1280
Dispatcher_West,Operative_W1,12,240
Dispatcher_West,Operative_W2,19,550
Dispatcher_West,Cross_Hub_Coordinator,28,1100
Cross_Hub_Coordinator,Logistics_Overseer,45,2100
Logistics_Overseer,Warehouse_Dock_Lead,22,640
Logistics_Overseer,Transport_Driver_1,15,390
Logistics_Overseer,Transport_Driver_2,17,420
Operative_E1,Field_Spotter_1,8,120
Operative_E1,Field_Spotter_2,10,180
Operative_E2,Field_Spotter_3,11,210
Operative_W1,Field_Spotter_4,9,150
Operative_W2,Field_Spotter_5,13,290
Transport_Driver_1,Safehouse_Manager,16,400
Transport_Driver_2,Safehouse_Manager,14,350
Safehouse_Manager,Cross_Hub_Coordinator,25,980
Kingpin_Direct,Logistics_Overseer,8,450
Kingpin_Direct,Cross_Hub_Coordinator,12,850`,
  },
  narcotics: {
    name: 'Narcotics Multi-Cell Smuggling Network',
    description: 'Maritime import cell, overland transport cell, urban distribution network, and intermediary brokers.',
    data: `node1,node2,weight
Maritime_Skipper_1,Coastal_Offloader,4
Maritime_Skipper_2,Coastal_Offloader,5
Coastal_Offloader,Stash_Warehouse_Coast,9
Stash_Warehouse_Coast,Interstate_Courier_Alpha,6
Stash_Warehouse_Coast,Interstate_Courier_Beta,7
Interstate_Courier_Alpha,Inland_Stash_Depot,6
Interstate_Courier_Beta,Inland_Stash_Depot,7
Inland_Stash_Depot,Wholesale_Broker_City,12
Wholesale_Broker_City,Distributor_North,8
Wholesale_Broker_City,Distributor_South,8
Wholesale_Broker_City,Distributor_Central,9
Distributor_North,Sub_Dealer_N1,5
Distributor_North,Sub_Dealer_N2,6
Distributor_South,Sub_Dealer_S1,4
Distributor_South,Sub_Dealer_S2,5
Distributor_Central,Sub_Dealer_C1,7
Distributor_Central,Sub_Dealer_C2,7
Sub_Dealer_N1,Street_Runner_1,3
Sub_Dealer_S1,Street_Runner_2,3
Sub_Dealer_C1,Street_Runner_3,4
Financier_Patron,Coastal_Offloader,10
Financier_Patron,Wholesale_Broker_City,15
Financier_Patron,Legal_Intermediary,5`,
  },
};

// Graph Algorithms for In-Browser Forensic Analysis
function parseAndBuildGraph(csvText: string) {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('File must contain at least a header row and 1 data row.');
  }

  // Detect delimiter: comma, tab, semicolon, or space
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  const rawHeaders = firstLine.split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

  // Detect source and target columns
  let srcIdx = -1;
  let dstIdx = -1;
  let weightIdx = -1;

  for (let i = 0; i < rawHeaders.length; i++) {
    const h = rawHeaders[i];
    if (['source', 'caller', 'from', 'node1', 'src', 'origin', 'sender', 'u'].includes(h)) srcIdx = i;
    if (['target', 'receiver', 'to', 'node2', 'dst', 'destination', 'callee', 'recipient', 'v'].includes(h)) dstIdx = i;
    if (['weight', 'calls', 'duration', 'amount', 'value', 'strength', 'count', 'w'].includes(h)) weightIdx = i;
  }

  // Default to first two columns if named headers not matched
  if (srcIdx === -1 || dstIdx === -1) {
    if (rawHeaders.length >= 2) {
      srcIdx = 0;
      dstIdx = 1;
      if (rawHeaders.length >= 3 && !isNaN(Number(lines[1].split(delimiter)[2]))) {
        weightIdx = 2;
      }
    } else {
      throw new Error('Could not identify source and target columns. Ensure headers like source,target or two columns exist.');
    }
  }

  const rawEdges: Array<{ source: string; target: string; weight: number }> = [];
  const adjacency = new Map<string, Set<string>>();
  const nodeDegrees = new Map<string, number>();

  function addNode(id: string) {
    if (!adjacency.has(id)) {
      adjacency.set(id, new Set());
      nodeDegrees.set(id, 0);
    }
  }

  // Read data rows
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length <= Math.max(srcIdx, dstIdx)) continue;

    const source = parts[srcIdx];
    const target = parts[dstIdx];
    if (!source || !target || source === target) continue;

    let weight = 1.0;
    if (weightIdx !== -1 && parts[weightIdx]) {
      const parsedW = parseFloat(parts[weightIdx]);
      if (!isNaN(parsedW) && parsedW > 0) weight = parsedW;
    }

    addNode(source);
    addNode(target);

    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);

    nodeDegrees.set(source, (nodeDegrees.get(source) || 0) + 1);
    nodeDegrees.set(target, (nodeDegrees.get(target) || 0) + 1);

    rawEdges.push({ source, target, weight });
  }

  const allNodeIds = Array.from(adjacency.keys());
  const N = allNodeIds.length;
  const E = rawEdges.length;

  if (N === 0) {
    throw new Error('No valid nodes or connections found in the uploaded file.');
  }

  // 1. Connected Components (BFS)
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of allNodeIds) {
    if (!visited.has(node)) {
      const comp: string[] = [];
      const queue = [node];
      visited.add(node);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        comp.push(curr);
        for (const neighbor of Array.from(adjacency.get(curr) || [])) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(comp);
    }
  }

  // 2. Fast Label Propagation for Community Detection
  const nodeCommunity = new Map<string, number>();
  // Initialize each node with its own label or sequential ID
  allNodeIds.forEach((id, idx) => {
    nodeCommunity.set(id, idx % 8); // seed initial assignments
  });

  // Run 8 iterations of synchronous Label Propagation
  for (let iter = 0; iter < 10; iter++) {
    for (const node of allNodeIds) {
      const neighbors = Array.from(adjacency.get(node) || []);
      if (neighbors.length === 0) continue;

      const freq = new Map<number, number>();
      for (const nbr of neighbors) {
        const c = nodeCommunity.get(nbr) ?? 0;
        freq.set(c, (freq.get(c) || 0) + 1);
      }

      let maxC = nodeCommunity.get(node) ?? 0;
      let maxCount = -1;
      freq.forEach((count, c) => {
        if (count > maxCount) {
          maxCount = count;
          maxC = c;
        }
      });
      nodeCommunity.set(node, maxC);
    }
  }

  // Re-map communities to contiguous IDs 0..K (up to 8 for color harmony)
  const commSizes = new Map<number, number>();
  nodeCommunity.forEach((c) => {
    commSizes.set(c, (commSizes.get(c) || 0) + 1);
  });
  const sortedComms = Array.from(commSizes.keys()).sort((a, b) => (commSizes.get(b) || 0) - (commSizes.get(a) || 0));
  const commMapping = new Map<number, number>();
  sortedComms.forEach((oldId, newIdx) => {
    commMapping.set(oldId, newIdx % 8);
  });
  allNodeIds.forEach((id) => {
    nodeCommunity.set(id, commMapping.get(nodeCommunity.get(id)!) ?? 0);
  });

  // 3. Centrality Metrics (Degree & Brandes Betweenness Centrality)
  const betweenness = new Map<string, number>();
  allNodeIds.forEach((n) => betweenness.set(n, 0));

  // Compute Brandes shortest path betweenness for all nodes (capped at 400 nodes for instant sub-second response)
  const sampleNodes = allNodeIds.length > 300 ? allNodeIds.slice(0, 300) : allNodeIds;
  for (const s of sampleNodes) {
    const S: string[] = [];
    const P = new Map<string, string[]>();
    allNodeIds.forEach((n) => P.set(n, []));

    const sigma = new Map<string, number>();
    allNodeIds.forEach((n) => sigma.set(n, 0));
    sigma.set(s, 1);

    const d = new Map<string, number>();
    allNodeIds.forEach((n) => d.set(n, -1));
    d.set(s, 0);

    const Q: string[] = [s];

    while (Q.length > 0) {
      const v = Q.shift()!;
      S.push(v);

      for (const w of Array.from(adjacency.get(v) || [])) {
        // Path discovery
        if (d.get(w)! < 0) {
          d.set(w, d.get(v)! + 1);
          Q.push(w);
        }
        // Path counting
        if (d.get(w) === d.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          P.get(w)!.push(v);
        }
      }
    }

    const delta = new Map<string, number>();
    allNodeIds.forEach((n) => delta.set(n, 0));

    // Accumulation
    while (S.length > 0) {
      const w = S.pop()!;
      for (const v of P.get(w)!) {
        const c = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + c);
      }
      if (w !== s) {
        betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
      }
    }
  }

  // Normalize betweenness centrality
  const normFactor = N > 2 ? 1 / ((N - 1) * (N - 2)) : 1;
  const maxBetweenness = Math.max(...Array.from(betweenness.values()), 0.0001);

  // 4. Cross-Community Bridge Identification
  const nodeConnectedCommunities = new Map<string, Set<number>>();
  allNodeIds.forEach((n) => {
    const s = new Set<number>();
    s.add(nodeCommunity.get(n)!);
    for (const nbr of Array.from(adjacency.get(n) || [])) {
      s.add(nodeCommunity.get(nbr)!);
    }
    nodeConnectedCommunities.set(n, s);
  });

  // Calculate top 15% betweenness threshold for bridge identification
  const sortedBetweennessVals = Array.from(betweenness.values()).sort((a, b) => b - a);
  const bridgeThreshold = sortedBetweennessVals[Math.floor(sortedBetweennessVals.length * 0.18)] || 0;

  // Build NodeItem objects
  const formattedNodes: NodeItem[] = allNodeIds.map((id) => {
    const commId = nodeCommunity.get(id) ?? 0;
    const deg = nodeDegrees.get(id) || 0;
    const rawB = betweenness.get(id) || 0;
    const normB = rawB * normFactor;
    const connComms = Array.from(nodeConnectedCommunities.get(id) || [commId]);
    const isBridge = connComms.length > 1 || (normB > bridgeThreshold && deg > 1);

    const commColor = COMMUNITY_COLORS[commId]?.hex || '#06B6D4';

    // Neighbors sample for inspector
    const nbrs = Array.from(adjacency.get(id) || []).slice(0, 10).map((nbrId) => ({
      node_id: nbrId,
      community_id: nodeCommunity.get(nbrId) ?? 0,
      degree: nodeDegrees.get(nbrId) || 0,
      is_bridge: (nodeConnectedCommunities.get(nbrId)?.size || 1) > 1,
      color: COMMUNITY_COLORS[nodeCommunity.get(nbrId) ?? 0]?.hex || '#06B6D4',
    }));

    return {
      node_id: id,
      community_id: commId,
      degree: deg,
      degree_centrality: N > 1 ? deg / (N - 1) : 0,
      betweenness_centrality: parseFloat(normB.toFixed(5)),
      closeness_centrality: 0,
      pagerank: parseFloat((deg / (2 * Math.max(1, E))).toFixed(4)),
      is_bridge: isBridge,
      color: isBridge ? '#FCD34D' : commColor,
      connected_communities_count: connComms.length,
      connected_communities: connComms,
      neighbors_count: deg,
      neighbors_sample: nbrs,
    };
  });

  // Format edges
  const formattedEdges: EdgeItem[] = rawEdges.map((e) => {
    const c1 = nodeCommunity.get(e.source);
    const c2 = nodeCommunity.get(e.target);
    const isCross = c1 !== undefined && c2 !== undefined && c1 !== c2;
    return {
      source: e.source,
      target: e.target,
      weight: e.weight,
      is_cross_community: isCross,
    };
  });

  // Graph Summary
  const density = N > 1 ? (2 * E) / (N * (N - 1)) : 0;
  const avgDegree = (2 * E) / N;
  const bridgeCount = formattedNodes.filter((n) => n.is_bridge).length;
  const uniqueComms = Array.from(new Set(formattedNodes.map((n) => n.community_id)));

  // Community-specific stats
  const communitySummaries = uniqueComms.map((cid) => {
    const commNodes = formattedNodes.filter((n) => n.community_id === cid);
    const nodeSet = new Set(commNodes.map((n) => n.node_id));
    const internalEdges = formattedEdges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target)).length;
    const externalEdges = formattedEdges.filter(
      (e) => (nodeSet.has(e.source) && !nodeSet.has(e.target)) || (!nodeSet.has(e.source) && nodeSet.has(e.target))
    ).length;
    const k = commNodes.length;
    const commDensity = k > 1 ? (2 * internalEdges) / (k * (k - 1)) : 0;

    const topAnchors = [...commNodes].sort((a, b) => b.degree - a.degree).slice(0, 3);
    const topBridges = [...commNodes].filter((n) => n.is_bridge).sort((a, b) => b.betweenness_centrality - a.betweenness_centrality).slice(0, 3);

    return {
      community_id: cid,
      size: k,
      internal_edges: internalEdges,
      external_edges: externalEdges,
      density: commDensity,
      top_anchor_nodes: topAnchors,
      top_bridge_nodes: topBridges,
      color: COMMUNITY_COLORS[cid]?.hex || '#06B6D4',
      bg: COMMUNITY_COLORS[cid]?.bg || 'bg-cyan-500/10',
      border: COMMUNITY_COLORS[cid]?.border || 'border-cyan-500/30',
    };
  }).sort((a, b) => b.size - a.size);

  return {
    nodes: formattedNodes,
    edges: formattedEdges,
    summary: {
      total_nodes: N,
      total_edges: E,
      density: parseFloat(density.toFixed(4)),
      average_degree: parseFloat(avgDegree.toFixed(2)),
      connected_components: components.length,
      largest_component_size: Math.max(...components.map((c) => c.length), 0),
      community_count: uniqueComms.length,
      bridge_node_count: bridgeCount,
    },
    communitySummaries,
  };
}

export default function CustomAnalysisPage() {
  const [inputText, setInputText] = useState<string>(SAMPLE_PRESETS.hawala.data);
  const [selectedPreset, setSelectedPreset] = useState<string>('hawala');
  const [fileName, setFileName] = useState<string>('sample_hawala_network.csv');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analyzed Graph State
  const [graphData, setGraphData] = useState<{
    nodes: NodeItem[];
    edges: EdgeItem[];
    summary: {
      total_nodes: number;
      total_edges: number;
      density: number;
      average_degree: number;
      connected_components: number;
      largest_component_size: number;
      community_count: number;
      bridge_node_count: number;
    };
    communitySummaries: Array<{
      community_id: number;
      size: number;
      internal_edges: number;
      external_edges: number;
      density: number;
      color: string;
      bg: string;
      border: string;
      top_anchor_nodes: NodeItem[];
      top_bridge_nodes: NodeItem[];
    }>;
  } | null>(() => {
    try {
      return parseAndBuildGraph(SAMPLE_PRESETS.hawala.data);
    } catch {
      return null;
    }
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightCommunityId, setHighlightCommunityId] = useState<number | null>(null);
  const [highlightBridgeOnly, setHighlightBridgeOnly] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run Analysis on the current text
  const handleAnalyze = (textToAnalyze = inputText) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = parseAndBuildGraph(textToAnalyze);
      setGraphData(result);
      setSelectedNodeId(null);
      setHighlightCommunityId(null);
      setHighlightBridgeOnly(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse graph data. Please verify your CSV format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preset Selection
  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = SAMPLE_PRESETS[presetKey];
    if (preset) {
      setInputText(preset.data);
      setFileName(`${presetKey}_forensic_network.csv`);
      handleAnalyze(preset.data);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedPreset('custom');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        handleAnalyze(content);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded file.');
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedPreset('custom');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        handleAnalyze(content);
      }
    };
    reader.readAsText(file);
  };

  // Export Analyzed JSON
  const handleExportJSON = () => {
    if (!graphData) return;
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `networktrace_analysis_${fileName.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Selected Node Details
  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId || !graphData) return null;
    return graphData.nodes.find((n) => n.node_id === selectedNodeId) || null;
  }, [selectedNodeId, graphData]);

  // Top overall brokers/bridges
  const topBrokers = useMemo(() => {
    if (!graphData) return [];
    return [...graphData.nodes]
      .sort((a, b) => b.betweenness_centrality - a.betweenness_centrality)
      .slice(0, 6);
  }, [graphData]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen">
      <Topbar
        title="Custom Graph Ingestion & Forensic Analyzer"
        subtitle="Upload your custom edge list, Call Detail Records, or transaction CSV to uncover hidden communities, brokers, and network bridges"
      />

      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* Top Info Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm">Flexible Edge-List Ingestion</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Instant Client-Side Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports CSV, TSV, and TXT files with auto-detection for headers like <code className="text-cyan-300">source,target,weight</code>, <code className="text-cyan-300">caller,receiver</code>, or two-column adjacency lists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Upload CSV File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Input & Preset Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preset Buttons & Drag Drop Area */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Forensic Demo Presets
                </span>
                <span className="text-[10px] font-mono text-slate-500">1-Click Load</span>
              </div>

              <div className="space-y-2">
                {Object.entries(SAMPLE_PRESETS).map(([key, item]) => {
                  const isActive = selectedPreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handlePresetSelect(key)}
                      className={`w-full p-3 rounded-lg text-left transition-all border ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{item.name}</span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-medium text-slate-300">
                  Drop custom CSV or click to browse
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  Active File: <span className="text-cyan-400">{fileName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Edge List Text Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Edge List Data Preview & Editor
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isAnalyzing ? 'Analyzing...' : 'Re-Analyze Graph'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-3 flex-1 flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setSelectedPreset('custom');
                  }}
                  rows={8}
                  className="w-full h-44 p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/60 resize-y"
                  placeholder="source,target,weight..."
                />
                <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-500">
                  <span>Lines: {inputText.trim().split(/\r?\n/).length} records</span>
                  <span>Tip: You can edit or paste records directly above and click "Re-Analyze Graph".</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Metric Summary Cards */}
        {graphData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Entities (Nodes)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {graphData.summary.total_nodes}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Edges (Links)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {graphData.summary.total_edges}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Graph Density</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {(graphData.summary.density * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Avg Degree</div>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                {graphData.summary.average_degree}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Communities</div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                {graphData.summary.community_count} Clusters
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Bridge Brokers</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {graphData.summary.bridge_node_count} Identified
              </div>
            </div>
          </div>
        )}

        {/* Interactive Graph Canvas Section */}
        {graphData && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-slate-100">
                  Interactive Graph Topology & Community Partitioning
                </h2>
                <span className="text-xs text-slate-500">
                  ({graphData.nodes.length} nodes, {graphData.edges.length} edges)
                </span>
              </div>

              {/* Filtering & Highlight Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setHighlightBridgeOnly(!highlightBridgeOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    highlightBridgeOnly
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                  {highlightBridgeOnly ? 'Highlighting Bridges Only' : 'Highlight Bridges'}
                </button>

                {highlightCommunityId !== null && (
                  <button
                    onClick={() => setHighlightCommunityId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5"
                  >
                    Clear Cluster Filter ({highlightCommunityId})
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Cytoscape Canvas Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <CytoscapeGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={(id) => setSelectedNodeId(id)}
                  highlightCommunityId={highlightCommunityId}
                  highlightBridgeOnly={highlightBridgeOnly}
                  height="620px"
                />
              </div>

              {/* Node Inspector Side Panel */}
              <div className="lg:col-span-1 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Node Intelligence
                    </span>
                    {selectedNodeData && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    )}
                  </div>

                  {selectedNodeData ? (
                    <div className="space-y-4 mt-4">
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Entity ID</div>
                        <div className="text-base font-bold font-mono text-white break-all">
                          {selectedNodeData.node_id}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Cluster</div>
                          <div
                            className="text-xs font-bold font-mono mt-0.5 flex items-center gap-1.5"
                            style={{ color: COMMUNITY_COLORS[selectedNodeData.community_id]?.hex || '#06B6D4' }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: COMMUNITY_COLORS[selectedNodeData.community_id]?.hex || '#06B6D4' }}
                            ></span>
                            Cluster {selectedNodeData.community_id}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Degree</div>
                          <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">
                            {selectedNodeData.degree} connections
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Betweenness</div>
                          <div className="text-xs font-bold font-mono text-amber-400 mt-0.5">
                            {selectedNodeData.betweenness_centrality.toFixed(4)}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Role</div>
                          <div className="text-xs font-bold font-mono mt-0.5">
                            {selectedNodeData.is_bridge ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <GitBranch className="w-3 h-3" /> Bridge
                              </span>
                            ) : (
                              <span className="text-slate-400">Intra-Cluster</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connected Neighbors Preview */}
                      <div className="pt-2">
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                          Connected Neighbors ({selectedNodeData.neighbors_sample?.length || 0})
                        </div>
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {selectedNodeData.neighbors_sample?.map((nbr) => (
                            <div
                              key={nbr.node_id}
                              onClick={() => setSelectedNodeId(nbr.node_id)}
                              className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between cursor-pointer hover:border-slate-700"
                            >
                              <span className="truncate max-w-[120px]">{nbr.node_id}</span>
                              <span className="text-[10px] text-slate-500">d:{nbr.degree}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      Click on any node in the graph to inspect forensic centrality scores, bridging roles, and direct neighbors.
                    </div>
                  )}
                </div>

                {selectedNodeData && (
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-mono mt-4 border border-slate-800 cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Communities Breakdown & Top Bridge Brokers Cards */}
        {graphData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Detected Communities Breakdown */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Detected Community Clusters ({graphData.communitySummaries.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Modularity Partition</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {graphData.communitySummaries.map((comm) => (
                  <div
                    key={comm.community_id}
                    onClick={() =>
                      setHighlightCommunityId(highlightCommunityId === comm.community_id ? null : comm.community_id)
                    }
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      highlightCommunityId === comm.community_id
                        ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : `${comm.bg} ${comm.border} hover:border-slate-600`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: comm.color }}
                        ></span>
                        <span className="text-xs font-bold text-white font-mono">
                          Cluster {comm.community_id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {comm.size} entities
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-center">
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Internal</div>
                        <div className="text-xs font-mono text-slate-200 mt-0.5">{comm.internal_edges}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">External</div>
                        <div className="text-xs font-mono text-amber-400 mt-0.5">{comm.external_edges}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Density</div>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          {(comm.density * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {comm.top_anchor_nodes.length > 0 && (
                      <div className="mt-2.5 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <span className="text-slate-500">Key Anchor:</span>
                        <span className="text-cyan-300 font-semibold truncate">
                          {comm.top_anchor_nodes[0].node_id} (d:{comm.top_anchor_nodes[0].degree})
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Bridge / Broker Nodes */}
            <div className="lg:col-span-1 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Top Cross-Cluster Brokers
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/90 font-semibold">Brandes BC</span>
              </div>

              <div className="space-y-2">
                {topBrokers.map((node, idx) => (
                  <div
                    key={node.node_id}
                    onClick={() => setSelectedNodeId(node.node_id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      selectedNodeId === node.node_id
                        ? 'bg-amber-500/15 border-amber-500/60'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-200 font-mono truncate max-w-[130px]">
                          {node.node_id}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          Reaches {node.connected_communities_count} clusters
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-amber-400">
                        {node.betweenness_centrality.toFixed(3)}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">Degree {node.degree}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Forensic Significance
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Nodes with high betweenness centrality and multiple cluster connections act as bottlenecks. Disconnecting or surveilling these broker nodes fractures communication across separate syndicate cells.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
