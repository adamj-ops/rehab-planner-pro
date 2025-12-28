"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { IconPhoto } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface ImageNodeData {
  imageUrl?: string;
  caption?: string;
  showCaption?: boolean;
}

function ImageNode({ data, selected }: NodeProps<ImageNodeData>) {
  const { imageUrl, caption, showCaption = false } = data;

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={100}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="bg-primary border-primary"
      />
      <div
        className={cn(
          "relative flex flex-col",
          "border border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-900",
          "shadow-sm hover:shadow-md transition-shadow overflow-hidden",
          selected && "ring-2 ring-primary ring-offset-2"
        )}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Image */}
        <div className="flex-1 w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={caption || "Moodboard image"}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <IconPhoto className="w-10 h-10" />
              <span className="text-xs">Drop image here</span>
            </div>
          )}
        </div>

        {/* Caption */}
        {showCaption && caption && (
          <div className="w-full p-2 bg-white dark:bg-zinc-900">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
              {caption}
            </p>
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

export default memo(ImageNode);
