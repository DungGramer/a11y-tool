export interface Range {
  min: number;
  max: number;
}

export function drag(props: DragProps): void;

export interface DragProps {
  dragTarget: string;
  dragArea?: boolean;
  snapsCorner?: boolean;
  snapsVertical?: boolean;
  snapsHorizontal?: boolean;
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
  snapCoordinates: [number, number];
}

export interface RangeHorizontal {
  rangeHeight: Range;
  snapCoordinates: [number, number];
}
