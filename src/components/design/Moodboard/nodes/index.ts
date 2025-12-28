export { default as ColorSwatchNode } from "./ColorSwatchNode";
export type { ColorSwatchNodeData } from "./ColorSwatchNode";

export { default as MaterialSampleNode } from "./MaterialSampleNode";
export type { MaterialSampleNodeData } from "./MaterialSampleNode";

export { default as ImageNode } from "./ImageNode";
export type { ImageNodeData } from "./ImageNode";

export { default as TextNode } from "./TextNode";
export type { TextNodeData } from "./TextNode";

// Node types registry for React Flow
import ColorSwatchNode from "./ColorSwatchNode";
import MaterialSampleNode from "./MaterialSampleNode";
import ImageNode from "./ImageNode";
import TextNode from "./TextNode";

export const nodeTypes = {
  colorSwatch: ColorSwatchNode,
  materialSample: MaterialSampleNode,
  image: ImageNode,
  text: TextNode,
};
