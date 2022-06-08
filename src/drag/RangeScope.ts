import { Range, RangeScope, InnerRangeCoordinates, ClientCoordinates } from './drag.d';

export function getRangeScope(dragElement: HTMLElement, dragArea: HTMLElement | Window): RangeScope {
  let maxScopeWidth = 0;
  let maxScopeHeight = 0;
  let minScopeWidth = 0;
  let minScopeHeight = 0;
  let widthScope = 0;
  let heightScope = 0;
  let scopeX = 0;
  let scopeY = 0;
  let rangeLeft: Range = { min: 0, max: 0 };
  let rangeTop: Range = rangeLeft;
  let rangeRight: Range = rangeLeft;
  let rangeBottom: Range = rangeLeft;

  if (dragArea === window) {
    [maxScopeWidth, maxScopeHeight] = [
      document.documentElement.clientWidth - dragElement.clientWidth,
      document.documentElement.clientHeight - dragElement.clientHeight,
    ];

    [widthScope, heightScope] = [window.innerWidth, window.innerHeight];

    rangeLeft = { min: 0, max: window.innerWidth / 2 };
    rangeTop = { min: 0, max: window.innerHeight / 2 };
    rangeRight = { min: window.innerWidth / 2, max: window.innerWidth };
    rangeBottom = { min: window.innerHeight / 2, max: window.innerHeight };
  } else if (dragArea instanceof Node) {
    const scopeRect = dragArea.getBoundingClientRect();

    minScopeWidth = scopeRect.left;
    minScopeHeight = scopeRect.top;

    widthScope = scopeRect.width;
    heightScope = scopeRect.height;

    [maxScopeWidth, maxScopeHeight] = [
      minScopeWidth + widthScope - dragElement.clientWidth,
      minScopeHeight + heightScope - dragElement.clientHeight,
    ];

    scopeX = scopeRect.left;
    scopeY = scopeRect.top;

    rangeLeft = { min: scopeX, max: scopeX + widthScope / 2 };
    rangeTop = { min: scopeY, max: scopeY + heightScope / 2 };
    rangeRight = { min: scopeX + widthScope / 2, max: scopeX + widthScope };
    rangeBottom = {
      min: scopeY + heightScope / 2,
      max: scopeY + heightScope,
    };
  }

  return {
    minScopeWidth,
    maxScopeWidth,
    minScopeHeight,
    maxScopeHeight,
    widthScope,
    heightScope,
    scopeX,
    scopeY,
    rangeLeft,
    rangeTop,
    rangeRight,
    rangeBottom,
  };
}

//  If the drag element is out of the scope, return the max or min coordinates of the scope
export function validateInnerRangeCoordinates(
  left: number,
  top: number,
  dragElement: HTMLElement,
  dragArea: HTMLElement | Window
): InnerRangeCoordinates {
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight } = getRangeScope(dragElement, dragArea);

  let [safeInnerRangeX, safeInnerRangeY] = [left, top];

  if (left < minScopeWidth) {
    safeInnerRangeX = minScopeWidth;
  } else if (left > maxScopeWidth) {
    safeInnerRangeX = maxScopeWidth;
  }

  if (top < minScopeHeight) {
    safeInnerRangeY = minScopeHeight;
  } else if (top > maxScopeHeight) {
    safeInnerRangeY = maxScopeHeight;
  }

  return { safeInnerRangeX, safeInnerRangeY };
}

// Get coordinates mouse when user click
export function getClientCoordinates(event: PointerEvent): ClientCoordinates {
  const clientCoordinates: ClientCoordinates = { clientX: 0, clientY: 0, typeListener: 'pointermove' };

  if (!['pointerdown', 'pointermove'].includes(event.type)) {
    return clientCoordinates;
  }

  return Object.assign(clientCoordinates, {
    clientX: event.clientX,
    clientY: event.clientY,
  });
}