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
  minScopeWidth: number;
  maxScopeWidth: number;
  minScopeHeight: number;
  maxScopeHeight: number;
  widthScope: number;
  heightScope: number;
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

export interface RangeCorners {
  cornerName: string[SnapPlacement];
  rangeWidth: Range;
  rangeHeight: Range;
  snapCoordinates: number[];
}

export type SnapPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'horizontal' | 'vertical' | 'both' | 'corner';
export type TargetElement = HTMLElement | null;
export type ScopeElement = HTMLElement | Window | null;