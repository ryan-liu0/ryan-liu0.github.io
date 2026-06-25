let cy;

function generateGraph() {
  const n = Number(document.getElementById("n").value);
  const maxEdgesInput = Number(document.getElementById("max-edges").value);
  const edgeProb = Number(document.getElementById("edge-prob").value);

  const maxPlanarEdges = Math.max(0, 3 * n - 6);
  const maxEdges = Math.min(maxEdgesInput, maxPlanarEdges);

  const width = 900;
  const height = 650;
  const margin = 60;

  const nodes = [];
  const edges = [];
  const elements = [];

  for (let i = 0; i < n; i++) {
    const x = margin + Math.random() * (width - 2 * margin);
    const y = margin + Math.random() * (height - 2 * margin);

    nodes.push({ id: String(i), x, y });

    elements.push({
      data: {
        id: String(i),
        label: String(i)
      },
      position: { x, y }
    });
  }

  const candidateEdges = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() <= edgeProb) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        candidateEdges.push({
          source: String(i),
          target: String(j),
          distance: dist
        });
      }
    }
  }

  shuffle(candidateEdges);

  // Prefer shorter edges first; this tends to look cleaner and more planar.
  candidateEdges.sort((a, b) => {
    return a.distance - b.distance + 50 * (Math.random() - 0.5);
  });

  for (const edge of candidateEdges) {
    if (edges.length >= maxEdges) break;

    if (!crossesExistingEdge(edge, edges, nodes)) {
      edges.push(edge);

      elements.push({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        }
      });
    }
  }

  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "background-color": "#0f766e",
          "border-color": "#d4af37",
          "border-width": 3,
          color: "#1f2937",
          "font-weight": 600,
          "text-valign": "center",
          "text-halign": "center",
          width: 34,
          height: 34
        }
      },
      {
        selector: "edge",
        style: {
          width: 2.5,
          "line-color": "#c9a227",
          "curve-style": "straight"
        }
      }
    ],
    layout: {
      name: "preset",
      fit: true,
      padding: 30
    }
  });
}

function crossesExistingEdge(newEdge, edges, nodes) {
  const a = getNode(newEdge.source, nodes);
  const b = getNode(newEdge.target, nodes);

  for (const edge of edges) {
    // Edges sharing an endpoint are allowed.
    if (
      newEdge.source === edge.source ||
      newEdge.source === edge.target ||
      newEdge.target === edge.source ||
      newEdge.target === edge.target
    ) {
      continue;
    }

    const c = getNode(edge.source, nodes);
    const d = getNode(edge.target, nodes);

    if (segmentsIntersect(a, b, c, d)) {
      return true;
    }
  }

  return false;
}

function getNode(id, nodes) {
  return nodes.find((node) => node.id === id);
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);

  return o1 !== o2 && o3 !== o4;
}

function orientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (Math.abs(val) < 1e-9) {
    return 0;
  }

  return val > 0 ? 1 : 2;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate-btn").addEventListener("click", generateGraph);
  generateGraph();
});
