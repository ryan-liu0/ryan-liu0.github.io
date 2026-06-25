let cy;

let currentGraph = {
  nodes: [],
  edges: []
};

function generateGraph() {
  const n = clampNumber(Number(document.getElementById("n").value), 2, 150);
  const maxEdgesInput = clampNumber(Number(document.getElementById("max-edges").value), 1, 500);
  const edgeProb = clampNumber(Number(document.getElementById("edge-prob").value), 0, 1);

  const minWeight = Number(document.getElementById("min-weight").value);
  const maxWeight = Number(document.getElementById("max-weight").value);

  const panel = document.getElementById("cy");
  const width = Math.max(panel.clientWidth || 1200, 600);
  const height = Math.max(panel.clientHeight || 650, 500);

  const nodeRadius = 15;
  const minNodeDistance = 2.8 * nodeRadius;
  const margin = 45;

  const kNearest = Math.min(4, n - 1);
  const maxEdges = Math.min(maxEdgesInput, 3 * n);

  const nodes = generateNonOverlappingNodes(n, width, height, margin, minNodeDistance);
  const elements = [];
  const graphEdges = [];
  const edgeSet = new Set();

  for (const node of nodes) {
    elements.push({
      group: "nodes",
      data: {
        id: node.id
      },
      position: {
        x: node.x,
        y: node.y
      }
    });
  }

  for (let i = 0; i < n; i++) {
    const neighbors = [];

    for (let j = 0; j < n; j++) {
      if (i === j) continue;

      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist2 = dx * dx + dy * dy;

      neighbors.push({ j, dist2 });
    }

    neighbors.sort((a, b) => a.dist2 - b.dist2);

    for (let t = 0; t < kNearest; t++) {
      if (Math.random() > edgeProb) continue;
      if (edgeSet.size >= maxEdges) break;

      const j = neighbors[t].j;

      const a = Math.min(i, j);
      const b = Math.max(i, j);
      const edgeId = `${a}-${b}`;

      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);

        const weight = randomInt(minWeight, maxWeight);

        graphEdges.push({
          id: edgeId,
          source: String(a),
          target: String(b),
          weight: weight
        });

        elements.push({
          group: "edges",
          data: {
            id: edgeId,
            source: String(a),
            target: String(b),
            weight: weight,
            label: String(weight)
          }
        });
      }
    }
  }

  currentGraph = {
    nodes: nodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y
    })),
    edges: graphEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight
    }))
  };

  if (cy) {
    cy.destroy();
  }

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,

    style: [
      {
        selector: "node",
        style: {
          /*
            No node label here.
            IDs are still stored internally as data.id, but not displayed.
          */
          "background-color": "#0f766e",
          "border-color": "#d4af37",
          "border-width": 3,
          "width": 30,
          "height": 30
        }
      },
      {
        selector: "edge",
        style: {
          "label": "data(label)",
          "width": 2.25,
          "line-color": "#c9a227",
          "curve-style": "straight",

          "font-size": 11,
          "font-weight": 700,
          "color": "#111",
          "text-background-color": "#fbfbf8",
          "text-background-opacity": 0.9,
          "text-background-padding": 2,
          "text-rotation": "autorotate"
        }
      },
      {
        selector: ".highlighted-node",
        style: {
          "background-color": "#2563eb",
          "border-color": "#93c5fd"
        }
      },
      {
        selector: ".highlighted-edge",
        style: {
          "line-color": "#2563eb",
          "width": 4
        }
      }
    ],

    layout: {
      name: "preset",
      fit: true,
      padding: 30
    },

    userZoomingEnabled: false,
    userPanningEnabled: false,
    boxSelectionEnabled: false,
    autoungrabify: true,
    autounselectify: true,
    wheelSensitivity: 0
  });

  // Useful for debugging and later algorithms.
  console.log("Current graph:", currentGraph);
  console.log("Weighted adjacency list:", getWeightedAdjacencyList());
}

function generateNonOverlappingNodes(n, width, height, margin, minDistance) {
  const nodes = [];
  const maxAttemptsPerNode = 800;

  for (let i = 0; i < n; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttemptsPerNode; attempt++) {
      const x = margin + Math.random() * Math.max(1, width - 2 * margin);
      const y = margin + Math.random() * Math.max(1, height - 2 * margin);

      if (isFarEnough(x, y, nodes, minDistance)) {
        nodes.push({
          id: String(i),
          x,
          y
        });
        placed = true;
        break;
      }
    }

    /*
      Fallback: if the graph area is too crowded, place the node anyway.
      This prevents the generator from freezing for large n.
    */
    if (!placed) {
      nodes.push({
        id: String(i),
        x: margin + Math.random() * Math.max(1, width - 2 * margin),
        y: margin + Math.random() * Math.max(1, height - 2 * margin)
      });
    }
  }

  return nodes;
}

function isFarEnough(x, y, nodes, minDistance) {
  const minDist2 = minDistance * minDistance;

  for (const node of nodes) {
    const dx = x - node.x;
    const dy = y - node.y;

    if (dx * dx + dy * dy < minDist2) {
      return false;
    }
  }

  return true;
}

function getWeightedAdjacencyList() {
  const adj = {};

  if (!cy) return adj;

  cy.nodes().forEach((node) => {
    adj[node.id()] = [];
  });

  cy.edges().forEach((edge) => {
    const u = edge.source().id();
    const v = edge.target().id();
    const w = Number(edge.data("weight"));

    adj[u].push({ node: v, weight: w });
    adj[v].push({ node: u, weight: w });
  });

  return adj;
}

function getEdgeList() {
  if (!cy) return [];

  return cy.edges().map((edge) => ({
    source: edge.source().id(),
    target: edge.target().id(),
    weight: Number(edge.data("weight"))
  }));
}

function clearHighlights() {
  if (!cy) return;

  cy.nodes().removeClass("highlighted-node");
  cy.edges().removeClass("highlighted-edge");
}

function randomInt(min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));

  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) return min;

  return Math.min(max, Math.max(min, value));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate-btn").addEventListener("click", generateGraph);
  generateGraph();
});
