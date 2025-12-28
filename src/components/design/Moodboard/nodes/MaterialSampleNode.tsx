"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { IconBox } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface MaterialSampleNodeData {
  materialId?: string;
  materialName: string;
  materialType?: string;
  brand?: string;
  imageUrl?: string;
  showName?: boolean;
  showType?: boolean;
}

function MaterialSampleNode({ data, selected }: NodeProps<MaterialSampleNodeData>) {
  const {
    materialName,
    materialType,
    brand,
    imageUrl,
    showName = true,
    showType = true,
  } = data;

  return (
    <>
      <NodeResizer
        minWidth={80}
        minHeight={80}
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
        {/* Material Image */}
        <div className="flex-1 w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={materialName}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <IconBox className="w-8 h-8 text-zinc-400" />
          )}
        </div>

        {/* Material Info */}
        {(showName || showType) && (
          <div className="w-full p-2 bg-white dark:bg-zinc-900">
            {showName && (
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {materialName}
              </p>
            )}
            {showType && (materialType || brand) && (
              <p className="text-[10px] text-zinc-500 truncate">
                {brand && `${brand} • `}
                <span className="capitalize">{materialType}</span>
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

export default memo(MaterialSampleNode);
