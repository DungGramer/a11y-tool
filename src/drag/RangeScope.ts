import { Range, RangeScope, InnerRangeCoordinates, ClientCoordinates } from './drag.d';

export function getRangeScope(dragElement: HTMLElement, dragArea: HTMLElement | Window): RangeScope {
  let scopeMaxWidth = 0;
  let scopeMaxHeight = 0;
  let scopeMinWidth = 0;
  let scopeMinHeight = 0;
  let scopeWidth = 0;
  let scopeHeight = 0;
  let scopeX = 0;
  let scopeY = 0;
  let rangeLeft: Range = { min: 0, max: 0 };
  let rangeTop: Range = rangeLeft;
  let rangeRight: Range = rangeLeft;
  let rangeBottom: Range = rangeLeft;

  if (dragArea === window) {
    [scopeWidth, scopeHeight] = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    [scopeMaxWidth, scopeMaxHeight] = [scopeWidth - dragElement.clientWidth, scopeHeight - dragElement.clientHeight];

    rangeLeft = { min: 0, max: window.innerWidth / 2 };
    rangeTop = { min: 0, max: window.innerHeight / 2 };
    rangeRight = { min: window.innerWidth / 2, max: window.innerWidth };
    rangeBottom = { min: window.innerHeight / 2, max: window.innerHeight };
    
  } else if (dragArea instanceof Node) {
    const scopeRect = dragArea.getBoundingClientRect();

    scopeWidth = scopeRect.width;
    scopeHeight = scopeRect.height;

    scopeMinWidth = scopeRect.left;
    scopeMinHeight = scopeRect.top;

    [scopeMaxWidth, scopeMaxHeight] = [
      scopeMinWidth + scopeWidth - dragElement.offsetWidth,
      scopeMinHeight + scopeHeight - dragElement.offsetHeight,
    ];

    scopeX = scopeRect.left;
    scopeY = scopeRect.top;

    rangeLeft = { min: scopeX, max: scopeX + scopeWidth / 2 };
    rangeTop = { min: scopeY, max: scopeY + scopeHeight / 2 };
    rangeRight = { min: scopeX + scopeWidth / 2, max: scopeX + scopeWidth };
    rangeBottom = {
      min: scopeY + scopeHeight / 2,
      max: scopeY + scopeHeight,
    };
  }

  return {
    scopeMinWidth,
    scopeMaxWidth,
    scopeMinHeight,
    scopeMaxHeight,
    scopeWidth,
    scopeHeight,
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
  const { scopeMinWidth, scopeMaxWidth, scopeMinHeight, scopeMaxHeight } = getRangeScope(dragElement, dragArea);

  let [safeInnerRangeX, safeInnerRangeY] = [left, top];

  if (left < scopeMinWidth) {
    safeInnerRangeX = scopeMinWidth;
  } else if (left > scopeMaxWidth) {
    safeInnerRangeX = scopeMaxWidth;
  }

  if (top < scopeMinHeight) {
    safeInnerRangeY = scopeMinHeight;
  } else if (top > scopeMaxHeight) {
    safeInnerRangeY = scopeMaxHeight;
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
