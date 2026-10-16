# # NetworkTrace — Graph-Based Community Detection

### Uncovering Hidden Communities and Structural Relationships in Complex Networks

NetworkTrace is a graph-based unsupervised learning and network analysis platform designed to discover hidden communities, identify structurally important nodes, detect bridge entities, and explore relationships within complex networks.

The project combines graph mining, community detection, network centrality analysis, crime statistics, and interactive visualizations in a unified web application.

## Live Demo

- **Frontend (Vercel):** [Open NetworkTrace](YOUR_VERCEL_URL)
- **Backend API (Render):** [Open NetworkTrace API](https://net-trace.onrender.com)
- **API Documentation:** [Swagger UI](https://net-trace.onrender.com/docs)

> Replace `YOUR_VERCEL_URL` with your actual Vercel deployment URL.

## About the Project

NetworkTrace explores how unsupervised graph algorithms can reveal meaningful structures in complex networks.

The primary analysis uses the Google+ Social Circles (GPlus) dataset as a benchmark for graph construction, community detection, and structural evaluation.

To demonstrate potential applications in criminal-network analysis, the project also includes a separately generated synthetic criminal network. Crime statistics from India provide an additional statistical context layer.

**Important:** The GPlus dataset is a social-network benchmark, not a criminal dataset. The synthetic network contains generated entities and does not represent real individuals or actual criminal investigations.

## Objectives

- Discover communities in complex networks using unsupervised learning.
- Evaluate detected communities against known social circles.
- Identify structurally important nodes using network centrality measures.
- Detect bridge nodes that connect different communities.
- Analyze relationships between communities.
- Demonstrate graph analysis using a synthetic criminal-network structure.
- Explore historical crime trends and geographical statistics.
- Present network insights through an interactive dashboard.

## How the Project Works

### 1. Data Collection and Preprocessing

The GPlus dataset contains network edges, node features, and known social circles.

The raw data is processed into structured node, edge, community-membership, and ego-network datasets.

### 2. Graph Construction

The processed data is represented as a graph:

- **Nodes:** Entities in the network.
- **Edges:** Relationships between entities.
- **Communities:** Groups discovered or provided by the dataset.

### 3. Unsupervised Community Detection

The Louvain algorithm is applied to identify densely connected groups in the network.

The selected benchmark network produced **8 detected communities**.

### 4. Community Evaluation

Detected communities are compared with known social circles using:

- Jaccard similarity
- Community coverage
- Community precision

These metrics help evaluate how closely the detected structures match known groups.

### 5. Network Centrality Analysis

The system analyzes node importance using:

- Degree centrality
- Betweenness centrality
- Closeness centrality
- PageRank

These measures reveal different structural roles within the network.

### 6. Bridge Node Detection

Bridge analysis identifies nodes connecting multiple communities. Such nodes can help explain how different parts of a network interact.

### 7. Synthetic Criminal Network

A synthetic network containing generated people, organizations, locations, and relationships demonstrates how community detection and bridge analysis can be applied to a criminal-network-style structure.

### 8. Crime Statistics Analysis

Historical Crime in India data is used to explore crime trends, geographical patterns, and crime categories.

These statistics are analyzed separately from the GPlus network because the datasets do not provide a valid identity mapping between GPlus users and real-world crime records.

### 9. Interactive Web Application

The frontend presents network structures, community information, centrality results, synthetic network analysis, and crime statistics.

The FastAPI backend exposes endpoints that supply data and analytical results to the frontend.

## Key Results

| Analysis | Result |
|---|---|
| GPlus ego networks inspected | 132 |
| Processed node records | 256,831 |
| Processed edge records | 26,777,078 |
| Selected benchmark graph nodes | 1,650 |
| Selected benchmark graph edges | 151,766 |
| Louvain communities detected | 8 |
| Synthetic network entities defined | 67 |
| Synthetic network graph nodes | 66 |
| Synthetic network edges | 293 |
| Synthetic network communities | 3 |

The counts above describe different datasets and processing stages; they should not be interpreted as one combined graph.

## Technology Stack

### Machine Learning and Graph Analysis
- Python
- NetworkX
- Louvain Community Detection
- Pandas
- NumPy
- Scikit-learn

### Backend
- FastAPI
- Uvicorn
- Pydantic

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Cytoscape.js
- Recharts

### Deployment
- Vercel — Frontend
- Render — Backend API
- GitHub — Version Control

## Project Structure

```text
NetworkTrace/
├── data/
│   ├── raw/
│   ├── processed/
│   ├── synthetic/
│   └── crime_context/
├── src/
│   ├── data/
│   ├── graph/
│   ├── community/
│   ├── analytics/
│   ├── evaluation/
│   └── simulation/
├── backend/
├── frontend/
├── results/
├── docs/
└── README.md
```

## Future Improvements

- Add an interactive geographical map of India.
- Improve community visualization and filtering.
- Add more graph algorithms for comparison.
- Expand network explainability and evaluation.
- Improve model validation and performance reporting.
- Add reproducible experiments and detailed documentation.

## Limitations

- GPlus is a benchmark social graph and does not contain verified criminal identities.
- Synthetic criminal-network results are demonstrations, not real-world investigative findings.
- Historical crime statistics describe recorded aggregate crime data and do not establish individual criminal behaviour.
- Community detection results depend on graph structure, algorithm settings, and dataset characteristics.

## About Me

**Utkarsh Sengar**  
AI/ML Engineering Student | Graph Machine Learning | Data Science

I am interested in machine learning, graph analytics, unsupervised learning, and building practical AI-powered applications.

NetworkTrace is a project through which I explore community detection, network science, structural analysis, and interactive analytical systems.

### Connect With Me

- **GitHub:** [Utkarsh-sengar3](https://github.com/Utkarsh-sengar3)
- **LinkedIn:** Add your LinkedIn profile URL here.

---

*Developed by Utkarsh Sengar as a graph-based unsupervised learning and network analysis project.*

