"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface ColorSwatchNodeData {
  colorId?: string;
  colorName: string;
  colorCode?: string;
  hexCode: string;
  showName?: boolean;
  showCode?: boolean;
}

function ColorSwatchNode({ data, selected }: NodeProps<ColorSwatchNodeData>) {
  const { colorName, colorCode, hexCode, showName = true, showCode = true } = data;

  return (
    <>
      <NodeResizer
        minWidth={60}
        minHeight={60}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="bg-primary border-primary"
      />
      <div
        className={cn(
          "relative flex flex-col items-center justify-center",
          "border border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "shadow-sm hover:shadow-md transition-shadow",
          selected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Color Swatch */}
        <div
          className="flex-1 w-full"
          style={{ backgroundColor: hexCode, minHeight: 60 }}
        />

        {/* Color Info */}
        {(showName || showCode) && (
          <div className="w-full p-2 bg-white dark:bg-zinc-900 text-center">
            {showName && (
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {colorName}
              </p>
            )}
            {showCode && colorCode && (
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {colorCode}
              </p>
            )}
          </div>
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

export default memo(ColorSwatchNode);
