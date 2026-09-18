import { useMemo, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { branches, colors, type Data, type Skill } from "./model";
import { checkpoints } from "./data";
import { ancestors, readiness, unlocked } from "./logic";
type CardData = {
  title: string;
  color: string;
  status?: string;
  subtitle?: string;
  kind: string;
  locked?: boolean;
};
function Card({ data }: NodeProps<Node<CardData>>) {
  return (
    <div
      className={`map-card ${data.kind}`}
      style={{ borderColor: data.color }}
    >
      <Handle type="target" position={Position.Top} />
      <span className="node-dot" style={{ color: data.color }}>
        {data.status === "Competent"
          ? "✓"
          : data.status === "Learning"
            ? "◉"
            : data.status === "Practicing"
              ? "◈"
              : data.status === "Skipped"
                ? "−"
                : "○"}
      </span>
      <div>
        <strong>{data.title}</strong>
        <small>
          {data.subtitle || data.status}
          {data.locked ? " · prerequisites pending" : ""}
        </small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { card: Card };
export default function Graph({
  data,
  query,
  branch,
  status,
  checkpoint,
  onSkill,
  onCheckpoint,
}: {
  data: Data;
  query: string;
  branch: string;
  status: string;
  checkpoint: string;
  onSkill: (id: string) => void;
  onCheckpoint: () => void;
}) {
  const [instance, setInstance] = useState<ReactFlowInstance<
    Node<CardData>
  > | null>(null);
  const graph = useMemo(() => {
    const cp = checkpoints.find((c) => c.id === checkpoint);
    const path = cp ? ancestors(cp.requirements, data.skills) : null;
    const visible = data.skills.filter(
      (s) =>
        (!query || s.title.toLowerCase().includes(query.toLowerCase())) &&
        (!branch || s.branch === branch) &&
        (!status || s.status === status) &&
        (!path || path.has(s.id)),
    );
    const positions = new Map<string, number>();
    const occupied = new Set<string>();
    const level = (s: Skill): number => {
      if (positions.has(s.id)) return positions.get(s.id)!;
      let n = s.prerequisites.length
        ? Math.max(
            ...s.prerequisites.map((id) => {
              const p = data.skills.find((x) => x.id === id);
              return p ? level(p) : 0;
            }),
          ) + 1
        : 0;
      const col = branches.indexOf(s.branch);
      while (occupied.has(`${col}-${n}`)) n++;
      occupied.add(`${col}-${n}`);
      positions.set(s.id, n);
      return n;
    };
    data.skills.forEach(level);
    const nodes: Node<CardData>[] = visible.map((s) => {
      const col = branches.indexOf(s.branch);
      const row = positions.get(s.id)!;
      return {
        id: s.id,
        type: "card",
        position: { x: col * 260, y: row * 116 + 85 },
        data: {
          title: s.title,
          color: colors[col],
          status: s.status,
          kind: s.id.startsWith("project") ? "project-node" : "skill-node",
          locked: !unlocked(s, data.skills),
        },
      };
    });
    branches.forEach((b, i) => {
      if (visible.some((s) => s.branch === b))
        nodes.push({
          id: "branch-" + i,
          type: "card",
          position: { x: i * 260, y: 0 },
          selectable: false,
          data: {
            title: b,
            color: colors[i],
            kind: "branch-node",
            subtitle: `${visible.filter((s) => s.branch === b).length} competencies`,
          },
        });
    });
    const maxY = Math.max(300, ...nodes.map((n) => n.position.y)) + 160;
    checkpoints
      .filter((c) => !query && !branch && !status && (!checkpoint || c.id === checkpoint))
      .forEach((c, i) =>
        nodes.push({
          id: c.id,
          type: "card",
          position: { x: i * 320, y: maxY },
          data: {
            title: `${checkpoints.indexOf(c) + 1}. ${c.title}`,
            color: colors[checkpoints.indexOf(c) + 1],
            kind: "checkpoint-node",
            subtitle: `${readiness(c, data).percent}% ready · ${c.weeks} weeks*`,
          },
        }),
      );
    const visibleIds = new Set(visible.map((s) => s.id));
    const edges = visible.flatMap((s) =>
      s.prerequisites
        .filter((id) => visibleIds.has(id))
        .map((id) => ({
          id: id + "-" + s.id,
          source: id,
          target: s.id,
          type: "smoothstep",
          style: {
            stroke: colors[branches.indexOf(s.branch)],
            strokeWidth: 1.4,
            opacity: 0.45,
          },
        })),
    );
    checkpoints.forEach((c) => {
      if (nodes.some((n) => n.id === c.id))
        c.requirements
          .filter((id) => visibleIds.has(id))
          .forEach((id) =>
            edges.push({
              id: id + "-" + c.id,
              source: id,
              target: c.id,
              type: "smoothstep",
              style: { stroke: "#e8bd72", strokeWidth: 2, opacity: 0.8 },
            }),
          );
    });
    return { nodes, edges, count: visible.length };
  }, [data, query, branch, status, checkpoint]);
  useEffect(() => {
    if (instance) {
      const t = setTimeout(() => {
        if (query || branch || status || checkpoint)
          void instance.fitView({ padding: 0.15, maxZoom: 1 });
        else void instance.setViewport({ x: 28, y: 28, zoom: 0.67 });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [instance, query, branch, status, checkpoint]);
  return (
    <div className="graph">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onInit={setInstance}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.08}
        maxZoom={1.8}
        onNodeClick={(_, n) => {
          if (n.id.startsWith("c") && checkpoints.some((c) => c.id === n.id))
            onCheckpoint();
          else if (!n.id.startsWith("branch-")) onSkill(n.id);
        }}
        colorMode={data.settings.theme}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={(n) => n.data.color as string} pannable zoomable />
      </ReactFlow>
      <div className="graph-caption">
        {graph.count} competencies · Drag to explore · Scroll to zoom
      </div>
      {!graph.count && (
        <div className="empty graph-empty">
          No competencies match these filters.
        </div>
      )}
    </div>
  );
}
