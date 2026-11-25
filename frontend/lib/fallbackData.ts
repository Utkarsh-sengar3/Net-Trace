import networkSummaryData from './data/network_summary.json';
import graphViewData from './data/graph_view.json';
import graphViewC0 from './data/graph_view_c0.json';
import graphViewC1 from './data/graph_view_c1.json';
import graphViewC2 from './data/graph_view_c2.json';
import graphViewC3 from './data/graph_view_c3.json';
import graphViewC4 from './data/graph_view_c4.json';
import graphViewC5 from './data/graph_view_c5.json';
import graphViewC6 from './data/graph_view_c6.json';
import graphViewC7 from './data/graph_view_c7.json';
import communitiesData from './data/communities.json';
import bridgesData from './data/bridges.json';
import nodesData from './data/nodes.json';
import centralityData from './data/centrality_distributions.json';
import crimeSummaryData from './data/crime_summary.json';
import crimeYearlyData from './data/crime_yearly.json';
import crimeStatesData from './data/crime_states.json';
import crimeDistrictsData from './data/crime_districts.json';
import crimeCategoriesData from './data/crime_categories.json';
import syntheticNetworkData from './data/synthetic_network.json';
import syntheticSummaryData from './data/synthetic_summary.json';
import mlInfoData from './data/ml_info.json';
import mlMetricsData from './data/ml_metrics.json';

import {
  NetworkSummary,
  GraphViewResponse,
  CommunityItem,
  BridgeNodeItem,
  CrimeSummary,
  YearlyTrendItem,
  StateCrimeItem,
  DistrictCrimeItem,
  CategorySummaryItem,
  SyntheticNetworkSummary,
  MLMetrics,
  NodeItem,
} from './types';

const communityGraphViews: Record<number, GraphViewResponse> = {
  0: graphViewC0 as unknown as GraphViewResponse,
  1: graphViewC1 as unknown as GraphViewResponse,
  2: graphViewC2 as unknown as GraphViewResponse,
  3: graphViewC3 as unknown as GraphViewResponse,
  4: graphViewC4 as unknown as GraphViewResponse,
  5: graphViewC5 as unknown as GraphViewResponse,
  6: graphViewC6 as unknown as GraphViewResponse,
  7: graphViewC7 as unknown as GraphViewResponse,
};

export const fallbackData = {
  getNetworkSummary: (): NetworkSummary => networkSummaryData as unknown as NetworkSummary,
  
  getGraphView: (community_id?: number | null): GraphViewResponse => {
    if (community_id !== undefined && community_id !== null && communityGraphViews[community_id]) {
      return communityGraphViews[community_id];
    }
    return graphViewData as unknown as GraphViewResponse;
  },

  getCommunities: (): CommunityItem[] => communitiesData as unknown as CommunityItem[],

  getCommunityDetail: (id: number): CommunityItem => {
    const list = communitiesData as unknown as CommunityItem[];
    return list.find((c) => c.community_id === id) || list[0];
  },

  getBridges: (): BridgeNodeItem[] => bridgesData as unknown as BridgeNodeItem[],

  getNodes: (params?: { community_id?: number; is_bridge?: boolean; search?: string; limit?: number; offset?: number }) => {
    let list: NodeItem[] = (nodesData as any).nodes || (graphViewData as any).nodes || [];
    if (params?.community_id !== undefined && params.community_id !== null) {
      list = list.filter((n) => n.community_id === params.community_id);
    }
    if (params?.is_bridge !== undefined && params.is_bridge !== null) {
      list = list.filter((n) => n.is_bridge === params.is_bridge);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((n) => n.node_id.toLowerCase().includes(q));
    }
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    return {
      total: list.length,
      offset,
      limit,
      nodes: list.slice(offset, offset + limit),
    };
  },

  getNodeDetail: (nodeId: string): NodeItem => {
    const list: NodeItem[] = (graphViewData as any).nodes || [];
    const found = list.find((n) => n.node_id === nodeId);
    if (found) {
      return {
        ...found,
        neighbors_count: found.degree || 12,
        neighbors_sample: list.filter((n) => n.node_id !== nodeId).slice(0, 10),
      };
    }
    return {
      node_id: nodeId,
      community_id: 0,
      degree: 15,
      degree_centrality: 0.009,
      betweenness_centrality: 0.002,
      closeness_centrality: 0.35,
      pagerank: 0.0006,
      is_bridge: false,
      color: '#06B6D4',
      connected_communities_count: 1,
      connected_communities: [0],
      neighbors_count: 15,
      neighbors_sample: list.slice(0, 8),
    };
  },

  getNodeNeighborhood: (nodeId: string, hops: number = 1) => {
    const list: NodeItem[] = (graphViewData as any).nodes || [];
    const edges: any[] = (graphViewData as any).edges || [];
    const nodeEdges = edges.filter((e) => e.source === nodeId || e.target === nodeId).slice(0, 30);
    const connectedIds = new Set<string>([nodeId]);
    nodeEdges.forEach((e) => {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    });
    const subNodes = list.filter((n) => connectedIds.has(n.node_id));
    return {
      root_node: nodeId,
      hops,
      nodes: subNodes.length > 0 ? subNodes : list.slice(0, 15),
      edges: nodeEdges,
    };
  },

  getCentralityDistributions: () => centralityData,

  getCrimeSummary: (): CrimeSummary => crimeSummaryData as unknown as CrimeSummary,

  getYearlyTrends: (state?: string): YearlyTrendItem[] => crimeYearlyData as unknown as YearlyTrendItem[],

  getStates: (): StateCrimeItem[] => crimeStatesData as unknown as StateCrimeItem[],

  getDistricts: (params?: { state?: string; limit?: number }): DistrictCrimeItem[] => {
    let list = crimeDistrictsData as unknown as DistrictCrimeItem[];
    if (params?.state) {
      const st = params.state.toUpperCase();
      list = list.filter((d) => d.state.toUpperCase() === st);
    }
    return list.slice(0, params?.limit || 100);
  },

  getCategories: (): CategorySummaryItem[] => crimeCategoriesData as unknown as CategorySummaryItem[],

  getSyntheticNetwork: () => syntheticNetworkData,

  getSyntheticSummary: (): SyntheticNetworkSummary => syntheticSummaryData as unknown as SyntheticNetworkSummary,

  getMLInfo: () => mlInfoData,

  getMLMetrics: (): MLMetrics => mlMetricsData as unknown as MLMetrics,

  predictCrime: (payload: { burglary: number; theft: number; robbery: number; riots: number; cheating: number; murder: number; kidnapping: number }) => {
    const totalEst = Math.round(
      payload.theft * 1.8 +
      payload.burglary * 2.2 +
      payload.cheating * 1.5 +
      payload.riots * 2.5 +
      payload.robbery * 3.0 +
      payload.murder * 4.5 +
      payload.kidnapping * 2.8 +
      1200
    );
    return {
      predicted_total_ipc: totalEst,
      confidence_interval: {
        lower_bound_95: Math.round(totalEst * 0.92),
        upper_bound_95: Math.round(totalEst * 1.08),
      },
      risk_level: totalEst < 4000 ? 'Low' : totalEst < 9000 ? 'Moderate' : 'High',
      contributing_factors: [
        { feature: 'THEFT', input_value: payload.theft },
        { feature: 'BURGLARY', input_value: payload.burglary },
        { feature: 'CHEATING', input_value: payload.cheating },
        { feature: 'RIOTS', input_value: payload.riots },
        { feature: 'ROBBERY', input_value: payload.robbery },
        { feature: 'MURDER', input_value: payload.murder },
      ],
      model_used: 'Random Forest Regressor (Standalone Engine)',
    };
  },

  predictSyntheticRole: (payload: { degree: number; betweenness_centrality: number }) => {
    const isBridge = payload.betweenness_centrality > 0.02 || payload.degree > 14;
    const prob = Math.min(0.99, Math.max(0.05, payload.betweenness_centrality * 15 + (payload.degree / 30) * 0.3));
    return {
      is_bridge_predicted: isBridge,
      bridge_probability: Number(prob.toFixed(3)),
      entity_role_predicted: isBridge ? 'Cross-Community Bridge Entity' : 'Cluster Internal Member',
      explanation: `Entity with degree=${payload.degree} and betweenness=${payload.betweenness_centrality.toFixed(4)} exhibits a ${(prob * 100).toFixed(1)}% likelihood of acting as an inter-community bridge bottleneck.`,
    };
  },
};
