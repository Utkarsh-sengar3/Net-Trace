# NetworkTrace — Graph-Based Community Detection & Network Intelligence

### Uncovering Hidden Communities and Structural Relationships in Complex Networks

NetworkTrace is an advanced graph-based unsupervised learning, structural network intelligence, and analytics platform designed to discover hidden communities, identify high-centrality bottleneck nodes, detect bridge entities, and explore relationships within complex multi-relational graphs.

The project combines graph mining, Louvain community detection, network centrality profiling, Crime in India macroscopic statistics, and supervised machine learning forecasting within a responsive, high-precision dark analytics interface.

## Live Deployments

- **Frontend Application (Vercel):** [https://net-trace-utkarsh.vercel.app](https://net-trace-utkarsh.vercel.app)
- **Backend API (Render):** [https://net-trace.onrender.com](https://net-trace.onrender.com)
- **Interactive Swagger Docs:** [https://net-trace.onrender.com/docs](https://net-trace.onrender.com/docs)
- **GitHub Repository:** [https://github.com/Utkarsh-sengar3/Net-Trace](https://github.com/Utkarsh-sengar3/Net-Trace)

## Core Capabilities & Visual Analytics

1. **Interactive Network Explorer:** Force-directed WebGL topology canvas powered by Cytoscape.js with Louvain cluster isolation, dynamic degree-based sizing, and live shortest-path routing.
2. **Community Explorer:** 8 distinct Louvain community clusters with Jaccard similarity metrics, internal edge densities, and ego-circle ground truth comparisons.
3. **Bridge Node Analysis:** Automated detection of cross-community gateway nodes using betweenness centrality, degree differentials, and community participation coefficients.
4. **Synthetic Criminal Network Simulation:** Multi-relational synthetic demonstration network modeling hierarchy, money laundering channels, operational logistics, and contraband flow.
5. **Crime Context Intelligence:** State-level and district-level temporal trend breakdowns based on 2001–2014 NCRB Crime in India data.
6. **Supervised ML Forecasting Engine:** Ridge & Random Forest regressors for aggregate crime trajectory estimation alongside synthetic bridge role classification.

## Key Results

| Analysis Domain | Metric | Result |
|---|---|---|
| **Social Benchmark (GPlus)** | Ego Networks Inspected | 132 |
| | Total Processed Nodes | 256,831 |
| | Total Processed Edges | 26,777,078 |
| | Benchmark Subgraph Nodes | 1,650 |
| | Benchmark Subgraph Edges | 151,766 |
| | Detected Louvain Communities | 8 |
| | Average Clustering Coefficient | 0.4912 |
| **Bridge Analysis** | Key Bridge Bottlenecks | 12 critical gateway entities |
| | Highest Betweenness Node | Node `100129275726588145876` (0.0163) |
| **Synthetic Simulation** | Generated Entities | 67 nodes (3 syndicate cells) |
| | Multi-Relational Edges | 293 (co-conspirator, financial, communication) |
| **Context Statistics** | Historical Crime Records | 9,017 district-year entries across 35 States/UTs |
| **Supervised ML** | Crime Forecasting | R² = 0.942, MAE = 214.3 |
| | Synthetic Bridge Classifier | Precision = 0.923, Recall = 0.857, F1 = 0.889 |

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Cytoscape.js, Recharts, Lucide Icons
- **Backend:** FastAPI, Uvicorn, Pydantic v2, Python 3.10+
- **Graph & ML Pipeline:** NetworkX, Scikit-learn, Pandas, NumPy, SciPy, python-louvain
- **Deployment:** Vercel (Edge & Serverless API Routes with static data fallback), Render (FastAPI Cloud API)

## Getting Started Locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend API will be running on `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the dashboard.

## Responsible Use & Data Semantics

- **Google+ (GPlus) Social Circles:** Benchmark academic social network graph collected by Stanford SNAP. Node IDs represent social media profiles and have **no correlation** to criminal behavior.
- **Crime in India Context:** Macroscopic, aggregate statistical records published by the National Crime Records Bureau (NCRB). Not linked to any individuals or graph nodes.
- **Synthetic Criminal Network:** Fully generated, synthetic mock scenario explicitly labeled for educational and methodological demonstration.

## Author

**Utkarsh Sengar**  
AI/ML Engineering | Graph Machine Learning | Data Science  
- GitHub: [@Utkarsh-sengar3](https://github.com/Utkarsh-sengar3)

---
*Developed with precision for network intelligence research and high-dimensional community analytics.*
