import { animateDrag, setTargetElementLocation } from './animateDrag';
import { RangeHorizontal, RangeVertical, RangeCorners, SnapPlacement } from './drag.d';
import { getRangeScope } from './RangeScope';

export function snapDirection(
  dragElement: HTMLElement | null,
  dragArea: HTMLElement | Window,
  snapPlacement: SnapPlacement | undefined,
  hasAnimate = true
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

      for (const key in rangeCorners) {
        const corner = rangeCorners[key as keyof RangeCorners];
        if (snapPlacement === key || snapPlacement === key.split('-').reverse().join('-')) {
          [safeInnerRangeX, safeInnerRangeY] = corner.snapCoordinates;
          setLocalStorage(safeInnerRangeX, safeInnerRangeY, key);
          break;
        }
      }
      break;
  }
  if (hasAnimate === true) {
    animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
  } else {
    setTargetElementLocation(dragElement, safeInnerRangeX, safeInnerRangeY);
  }
}

export function setLocalStorage(left: number, top: number, cornerName?: string, scopeElement?: Window | HTMLElement) {
  window.localStorage.setItem('left', left.toString());
  window.localStorage.setItem('top', top.toString());

  cornerName && window.localStorage.setItem('corner', cornerName);
  scopeElement &&
    window.localStorage.setItem(
      'scopeElement',
      scopeElement === window ? 'window' : (<HTMLElement>scopeElement).outerHTML
    );
}

// Snap to the corner of the scope
export function snapCorner(dragElement: HTMLElement, dragArea: HTMLElement | Window) {
  if (dragElement === null || dragArea === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeInnerRangeX, safeInnerRangeY] = [0, 0];
  const { rangeCorners } = getRangeCorners(dragElement, dragArea);

  for (const key in rangeCorners) {
    const corner = rangeCorners[key as keyof RangeCorners];
    if (
      centerX >= corner.rangeWidth.min &&
      centerX <= corner.rangeWidth.max &&
      centerY >= corner.rangeHeight.min &&
      centerY <= corner.rangeHeight.max
    ) {
      [safeInnerRangeX, safeInnerRangeY] = corner.snapCoordinates;
      setLocalStorage(safeInnerRangeX, safeInnerRangeY, key);
      break;
    }
  }

  animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
}

export function getRangeCorners(
  dragElement: HTMLElement,
  dragArea: HTMLElement | Window
): { rangeCorners: RangeCorners; rangeVertical: RangeVertical[]; rangeHorizontal: RangeHorizontal[] } {
  const { scopeMinWidth, scopeMaxWidth, scopeMinHeight, scopeMaxHeight, rangeLeft, rangeTop, rangeRight, rangeBottom } =
    getRangeScope(dragElement, dragArea);
  let { left, top } = dragElement.getBoundingClientRect();

  const rangeCorners = {
    'top-left': {
      rangeWidth: rangeLeft,
      rangeHeight: rangeTop,
      snapCoordinates: [scopeMinWidth, scopeMinHeight],
    },
    'top-right': {
      rangeWidth: rangeRight,
      rangeHeight: rangeTop,
      snapCoordinates: [scopeMaxWidth, scopeMinHeight],
    },
    'bottom-left': {
      rangeWidth: rangeLeft,
      rangeHeight: rangeBottom,
      snapCoordinates: [scopeMinWidth, scopeMaxHeight],
    },
    'bottom-right': {
      rangeWidth: rangeRight,
      rangeHeight: rangeBottom,
      snapCoordinates: [scopeMaxWidth, scopeMaxHeight],
    },
  };

  const rangeVertical = [
    {
      rangeWidth: rangeLeft,
      snapCoordinates: [scopeMinWidth, top],
    },
    {
      rangeWidth: rangeRight,
      snapCoordinates: [scopeMaxWidth, top],
    },
  ];

  const rangeHorizontal = [
    {
      rangeHeight: rangeTop,
      snapCoordinates: [left, scopeMinHeight],
    },
    {
      rangeHeight: rangeBottom,
      snapCoordinates: [left, scopeMaxHeight],
    },
  ];

  return { rangeCorners, rangeVertical, rangeHorizontal };
}
