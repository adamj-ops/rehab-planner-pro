"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  IconColorSwatch,
  IconBox,
  IconPhoto,
  IconTypography,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MoodboardToolbarProps {
  onAddColorSwatch: () => void;
  onAddMaterialSample: () => void;
  onAddImage: () => void;
  onAddText: () => void;
  onDelete: () => void;
  className?: string;
}

export function MoodboardToolbar({
  onAddColorSwatch,
  onAddMaterialSample,
  onAddImage,
  onAddText,
  onDelete,
  className,
}: MoodboardToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center gap-1 p-1.5",
          "bg-white dark:bg-zinc-900",
          "border border-zinc-200 dark:border-zinc-700",
          "shadow-md",
          className
        )}
      >
        {/* Add Elements */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddColorSwatch}
              className="h-8 w-8 p-0 rounded-none"
            >
              <IconColorSwatch className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-none">
            <p>Add Color Swatch</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddMaterialSample}
              className="h-8 w-8 p-0 rounded-none"
            >
              <IconBox className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-none">
            <p>Add Material Sample</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddImage}
              className="h-8 w-8 p-0 rounded-none"
            >
              <IconPhoto className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-none">
            <p>Add Image</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddText}
              className="h-8 w-8 p-0 rounded-none"
            >
              <IconTypography className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-none">
            <p>Add Text</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 rounded-none text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-none">
            <p>Delete Selected (Del)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
