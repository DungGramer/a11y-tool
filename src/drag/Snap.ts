import { animateDrag } from './animateDrag';
import { RangeHorizontal, RangeVertical, RangeCorners, SnapPlacement } from './drag.d';
import { getRangeScope } from './RangeScope';

export function snapDirection(
  dragElement: HTMLElement | null,
  dragArea: HTMLElement | Window,
  snapPlacement: SnapPlacement | undefined
) {
  if (dragElement === null || dragArea === null || snapPlacement === undefined) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeInnerRangeX, safeInnerRangeY] = [0, 0];

  switch (snapPlacement) {
    case 'corner':
      snapCorner(dragElement, dragArea);
      return;
    case 'horizontal':
      const { rangeHorizontal } = getRangeCorners(dragElement, dragArea);

      for (const horizontal of rangeHorizontal) {
        if (centerY <= horizontal.rangeHeight.max) {
          [safeInnerRangeX, safeInnerRangeY] = horizontal.snapCoordinates;
          setLocalStorage(safeInnerRangeX, safeInnerRangeY);
          break;
        }
      }
      break;
    case 'vertical':
      const { rangeVertical } = getRangeCorners(dragElement, dragArea);

      for (const vertical of rangeVertical) {
        if (centerX <= vertical.rangeWidth.max) {
          [safeInnerRangeX, safeInnerRangeY] = vertical.snapCoordinates;
          setLocalStorage(safeInnerRangeX, safeInnerRangeY);
          break;
        }
      }
      break;
    default:
      const { rangeCorners } = getRangeCorners(dragElement, dragArea);

      for (const corner of rangeCorners) {
        if (corner.cornerName.includes(snapPlacement)) {
          [safeInnerRangeX, safeInnerRangeY] = corner.snapCoordinates;
          setLocalStorage(safeInnerRangeX, safeInnerRangeY, corner.cornerName[0]);
          break;
        }
      }
      break;
  }

  animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
}

export function setLocalStorage(left: number, top: number, cornerName?: string) {
  window.localStorage.setItem('left', left.toString());
  window.localStorage.setItem('top', top.toString());

  cornerName && window.localStorage.setItem('corner', cornerName);
}

// Snap to the corner of the scope
export function snapCorner(dragElement: HTMLElement, dragArea: HTMLElement | Window) {
  if (dragElement === null || dragArea === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeInnerRangeX, safeInnerRangeY] = [0, 0];
  const { rangeCorners } = getRangeCorners(dragElement, dragArea);

  for (const corner of rangeCorners) {
    if (
      centerX >= corner.rangeWidth.min &&
      centerX <= corner.rangeWidth.max &&
      centerY >= corner.rangeHeight.min &&
      centerY <= corner.rangeHeight.max
    ) {
      [safeInnerRangeX, safeInnerRangeY] = corner.snapCoordinates;
      setLocalStorage(safeInnerRangeX, safeInnerRangeY, corner.cornerName[0]);
      break;
    }
  }

  animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
}

export function getRangeCorners(
  dragElement: HTMLElement,
  dragArea: HTMLElement | Window
): { rangeCorners: RangeCorners[]; rangeVertical: RangeVertical[]; rangeHorizontal: RangeHorizontal[] } {
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, rangeLeft, rangeTop, rangeRight, rangeBottom } =
    getRangeScope(dragElement, dragArea);
  let { left, top } = dragElement.getBoundingClientRect();

  const rangeCorners = [
    {
      cornerName: ['left-top', 'top-left'],
      rangeWidth: rangeLeft,
      rangeHeight: rangeTop,
      snapCoordinates: [minScopeWidth, minScopeHeight],
    },
    {
      cornerName: ['right-top', 'top-right'],
      rangeWidth: rangeRight,
      rangeHeight: rangeTop,
      snapCoordinates: [maxScopeWidth, minScopeHeight],
    },
    {
      cornerName: ['left-bottom', 'bottom-left'],
      rangeWidth: rangeLeft,
      rangeHeight: rangeBottom,
      snapCoordinates: [minScopeWidth, maxScopeHeight],
    },
    {
      cornerName: ['right-bottom', 'bottom-right'],
      rangeWidth: rangeRight,
      rangeHeight: rangeBottom,
      snapCoordinates: [maxScopeWidth, maxScopeHeight],
    },
  ];

  const rangeVertical = [
    {
      rangeWidth: rangeLeft,
      snapCoordinates: [minScopeWidth, top],
    },
    {
      rangeWidth: rangeRight,
      snapCoordinates: [maxScopeWidth, top],
    },
  ];

  const rangeHorizontal = [
    {
      rangeHeight: rangeTop,
      snapCoordinates: [left, minScopeHeight],
    },
    {
      rangeHeight: rangeBottom,
      snapCoordinates: [left, maxScopeHeight],
    },
  ];

  return { rangeCorners, rangeVertical, rangeHorizontal };
}
