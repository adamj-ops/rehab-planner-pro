"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { MoodboardToolbar } from "./MoodboardToolbar";
import { cn } from "@/lib/utils";

// Types for moodboard elements
export type MoodboardNodeType = "colorSwatch" | "materialSample" | "image" | "text";

export interface MoodboardNode extends Node {
  type: MoodboardNodeType;
}

interface MoodboardCanvasProps {
  initialNodes?: MoodboardNode[];
  initialEdges?: Edge[];
  onNodesUpdate?: (nodes: MoodboardNode[]) => void;
  onEdgesUpdate?: (edges: Edge[]) => void;
  readOnly?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  className?: string;
}

export function MoodboardCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesUpdate,
  onEdgesUpdate,
  readOnly = false,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  className,
}: MoodboardCanvasProps) {
  const [nodes, setNodes] = useState<MoodboardNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds) as MoodboardNode[];
        onNodesUpdate?.(updated);
        return updated;
      });
    },
    [onNodesUpdate]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        onEdgesUpdate?.(updated);
        return updated;
      });
    },
    [onEdgesUpdate]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const updated = addEdge(params, eds);
        onEdgesUpdate?.(updated);
        return updated;
      });
    },
    [onEdgesUpdate]
  );

  // Add a new element to the canvas
  const addElement = useCallback(
    (type: MoodboardNodeType, data: Record<string, unknown>) => {
      const id = `${type}-${Date.now()}`;
      const newNode: MoodboardNode = {
        id,
        type,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data,
        style: getDefaultNodeStyle(type),
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        onNodesUpdate?.(updated);
        return updated;
      });

      return newNode;
    },
    [onNodesUpdate]
  );

  // Delete selected nodes
  const deleteSelected = useCallback(() => {
    setNodes((nds) => {
      const updated = nds.filter((node) => !node.selected);
      onNodesUpdate?.(updated);
      return updated;
    });
    setEdges((eds) => {
      const updated = eds.filter((edge) => !edge.selected);
      onEdgesUpdate?.(updated);
      return updated;
    });
  }, [onNodesUpdate, onEdgesUpdate]);

  return (
    <div className={cn("w-full h-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={readOnly ? null : ["Backspace", "Delete"]}
        multiSelectionKeyCode={["Shift"]}
        selectionKeyCode={["Shift"]}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]} // Middle and right mouse button
        selectNodesOnDrag={false}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        proOptions={{ hideAttribution: true }}
      >
        {/* Background Grid */}
        {showBackground && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e4e4e7"
          />
        )}

        {/* Toolbar Panel */}
        {!readOnly && (
          <Panel position="top-left" className="m-2">
            <MoodboardToolbar
              onAddColorSwatch={() =>
                addElement("colorSwatch", {
                  colorName: "New Color",
                  hexCode: "#6366f1",
                  showName: true,
                  showCode: true,
                })
              }
              onAddMaterialSample={() =>
                addElement("materialSample", {
                  materialName: "New Material",
                  showName: true,
                  showType: true,
                })
              }
              onAddImage={() =>
                addElement("image", {
                  caption: "",
                  showCaption: false,
                })
              }
              onAddText={() =>
                addElement("text", {
                  text: "Add your text here",
                  fontSize: 14,
                  fontWeight: "normal",
                  textAlign: "left",
                })
              }
              onDelete={deleteSelected}
            />
          </Panel>
        )}

        {/* Controls (zoom, fit view) */}
        {showControls && (
          <Controls
            position="bottom-right"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-none"
          />
        )}

        {/* MiniMap */}
        {showMiniMap && (
          <MiniMap
            position="bottom-left"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-none"
            maskColor="rgba(0, 0, 0, 0.1)"
            nodeColor={(node) => {
              if (node.type === "colorSwatch") {
                return (node.data as { hexCode?: string })?.hexCode || "#6366f1";
              }
              return "#e4e4e7";
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}

// Default styles for each node type
function getDefaultNodeStyle(type: MoodboardNodeType): React.CSSProperties {
  switch (type) {
    case "colorSwatch":
      return { width: 120, height: 150 };
    case "materialSample":
      return { width: 150, height: 180 };
    case "image":
      return { width: 200, height: 200 };
    case "text":
      return { width: 200, height: 80 };
    default:
      return { width: 150, height: 150 };
  }
}

export default MoodboardCanvas;
