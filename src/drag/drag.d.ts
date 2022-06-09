export interface Range {
  min: number;
  max: number;
}

export function drag(props: DragProps): void;

export interface DragProps {
  dragTarget: string;
  dragArea?: boolean;
  snapPlacement?: SnapPlacement;
  initLocation?: number[];
}

export type ClientCoordinates = {
  clientX: number;
  clientY: number;
  typeListener: 'pointermove';
};

export interface InnerRangeCoordinates {
  safeInnerRangeX: number;
  safeInnerRangeY: number;
}

export interface RangeScope {
  scopeMinWidth: number;
  scopeMaxWidth: number;
  scopeMinHeight: number;
  scopeMaxHeight: number;
  scopeWidth: number;
  scopeHeight: number;
  scopeX: number;
  scopeY: number;
  rangeLeft: Range;
  rangeTop: Range;
  rangeRight: Range;
  rangeBottom: Range;
}

export interface RangeVertical {
  rangeWidth: Range;
  snapCoordinates: number[];
}

export interface RangeHorizontal {
  rangeHeight: Range;
  snapCoordinates: number[];
}

interface RangeCorner {
  rangeWidth: Range;
  rangeHeight: Range;
  snapCoordinates: number[];
}

export interface RangeCorners {
  'top-left': RangeCorner;
  'top-right': RangeCorner;
  'bottom-left': RangeCorner;
  'bottom-right': RangeCorner;
}

export const corners = ['top', 'right', 'bottom', 'left'];
export const snapPlacement = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
  'horizontal',
  'vertical',
  'both',
  'corner',
] as const;

export type SnapPlacement = typeof snapPlacement[number];
export type TargetElement = HTMLElement | null;
export type ScopeElement = HTMLElement | Window | null;
