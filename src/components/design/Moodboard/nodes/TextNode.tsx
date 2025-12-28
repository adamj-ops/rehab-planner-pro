"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface TextNodeData {
  text: string;
  fontSize?: number;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
}

function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const {
    text,
    fontSize = 14,
    fontWeight = "normal",
    textAlign = "left",
    textColor = "#18181b",
  } = data;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const { setNodes } = useReactFlow();

  const fontWeightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const textAlignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditText(text);
  }, [text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, text: editText } }
          : node
      )
    );
  }, [id, editText, setNodes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
      if (e.key === "Escape") {
        setIsEditing(false);
        setEditText(text);
      }
    },
    [handleBlur, text]
  );

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={30}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="bg-primary border-primary"
      />
      <div
        className={cn(
          "relative p-3",
          "bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-700",
          "shadow-sm hover:shadow-md transition-shadow",
          selected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{ width: "100%", height: "100%" }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn(
              "w-full h-full resize-none bg-transparent outline-none",
              fontWeightClasses[fontWeight],
              textAlignClasses[textAlign]
            )}
            style={{ fontSize, color: textColor }}
          />
        ) : (
          <p
            className={cn(
              "whitespace-pre-wrap",
              fontWeightClasses[fontWeight],
              textAlignClasses[textAlign]
            )}
            style={{ fontSize, color: textColor }}
          >
            {text || "Double-click to edit"}
          </p>
        )}

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 bg-zinc-400 border-none opacity-0 group-hover:opacity-100"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 bg-zinc-400 border-none opacity-0 group-hover:opacity-100"
        />
      </div>
    </>
  );
}

export default memo(TextNode);
