import {
  ClientCoordinates,
  InnerRangeCoordinates,
  RangeScope,
  RangeVertical,
  RangeHorizontal,
  DragProps,
  Range,
} from './drag.d';
export function drag(props: DragProps) {
  const { dragTarget, dragArea, snapsVertical, snapsHorizontal } = props;

  const snapsCorner: boolean = props.snapsCorner || (snapsHorizontal === true && snapsVertical === true);
  let targetElement: HTMLElement | null = document.querySelector(dragTarget);

  let scopeElement: HTMLElement | Window | null = typeof dragArea === 'string' ? document.querySelector(dragArea) : window;

  // Coordinates of the mouse move end
  let [offsetX, offsetY] = [0, 0];
  if (targetElement === null || scopeElement === null) return;

  targetElement.addEventListener('pointerdown', startDrag, true);

  // Event Listener when user click down
  function startDrag(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    targetElement = document.querySelector(dragTarget);
    scopeElement = typeof dragArea === 'string' ? document.querySelector(dragArea) : window;

    if (targetElement === null || scopeElement === null) return;

    const { left, top } = targetElement.getBoundingClientRect();

    let { clientX, clientY, typeListener } = getClientCoordinates(e);

    // clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'
    offsetX = clientX - left;
    offsetY = clientY - top;

    // Add event to window because we can handle drag outside of the targetElement
    window.addEventListener(typeListener, dragObject, true);
  }

  // Event Listener when user press and move mouse
  function dragObject(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (targetElement === null || scopeElement === null) return;

    let { clientX, clientY } = getClientCoordinates(e);

    const left = clientX - offsetX;
    const top = clientY - offsetY;

    let { safeInnerRangeX, safeInnerRangeY } = validateInnerRangeCoordinates(left, top, targetElement, scopeElement);

    targetElement.style.left = `${safeInnerRangeX}px`;
    targetElement.style.top = `${safeInnerRangeY}px`;
  }

  document.addEventListener('pointerup', () => {
    if (targetElement && scopeElement) {
      if (snapsCorner === true) {
        snapCorner(targetElement, scopeElement);
      } else {
        snapDirection(targetElement, scopeElement, snapsCorner, snapsHorizontal, snapsVertical);
      }

      targetElement = null;
      window.removeEventListener('pointerdown', dragObject, true);
      window.removeEventListener('pointermove', dragObject, true);
    }
  });
}

// Get coordinates mouse when user click
function getClientCoordinates(event: PointerEvent): ClientCoordinates {
  const clientCoordinates: ClientCoordinates = { clientX: 0, clientY: 0, typeListener: 'pointermove' };

  if (!['pointerdown', 'pointermove'].includes(event.type)) {
    return clientCoordinates;
  }

  return Object.assign(clientCoordinates, {
    clientX: event.clientX,
    clientY: event.clientY,
  });
}

function snapDirection(
  dragElement: HTMLElement | null,
  dragArea: HTMLElement | Window,
  snapsCorner: boolean | undefined,
  snapsHorizontal: boolean | undefined,
  snapsVertical: boolean | undefined
) {
  if (dragElement === null || dragArea === null) return;
  if ((snapsVertical === undefined && snapsHorizontal === undefined) || snapsCorner === undefined) return;

  let direction;
  if (snapsHorizontal === true) direction = 'horizontal';
  if (snapsVertical === true) direction = 'vertical';
  if (snapsCorner === true) direction = 'both';

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeInnerRangeX, safeInnerRangeY] = [0, 0];
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, rangeLeft, rangeTop, rangeRight, rangeBottom } =
    getRangeScope(dragElement, dragArea);

  switch (direction) {
    case 'both':
      snapCorner(dragElement, dragArea);
      return;
    case 'horizontal':
      const rangeHorizontal: Array<RangeHorizontal> = [
        {
          rangeHeight: rangeTop,
          snapCoordinates: [left, minScopeHeight],
        },
        {
          rangeHeight: rangeBottom,
          snapCoordinates: [left, maxScopeHeight],
        },
      ];

      for (const horizontal of rangeHorizontal) {
        if (centerY <= horizontal.rangeHeight.max) {
          [safeInnerRangeX, safeInnerRangeY] = horizontal.snapCoordinates;
          break;
        }
      }
      break;
    case 'vertical':
      const rangeVertical: Array<RangeVertical> = [
        {
          rangeWidth: rangeLeft,
          snapCoordinates: [minScopeWidth, top],
        },
        {
          rangeWidth: rangeRight,
          snapCoordinates: [maxScopeWidth, top],
        },
      ];

      for (const vertical of rangeVertical) {
        if (centerX <= vertical.rangeWidth.max) {
          [safeInnerRangeX, safeInnerRangeY] = vertical.snapCoordinates;
          break;
        }
      }
      break;
  }

  animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
}

// Snap to the corner of the scope
function snapCorner(dragElement: HTMLElement, dragArea: HTMLElement | Window) {
  if (dragElement === null || dragArea === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeInnerRangeX, safeInnerRangeY] = [0, 0];
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, rangeLeft, rangeTop, rangeRight, rangeBottom } =
    getRangeScope(dragElement, dragArea);

  const rangeCorners = [
    {
      cornerName: 'left-top',
      rangeWidth: rangeLeft,
      rangeHeight: rangeTop,
      snapCoordinates: [minScopeWidth, minScopeHeight],
    },
    {
      cornerName: 'right-top',
      rangeWidth: rangeRight,
      rangeHeight: rangeTop,
      snapCoordinates: [maxScopeWidth, minScopeHeight],
    },
    {
      cornerName: 'left-bottom',
      rangeWidth: rangeLeft,
      rangeHeight: rangeBottom,
      snapCoordinates: [minScopeWidth, maxScopeHeight],
    },
    {
      cornerName: 'right-bottom',
      rangeWidth: rangeRight,
      rangeHeight: rangeBottom,
      snapCoordinates: [maxScopeWidth, maxScopeHeight],
    },
  ];

  for (const corner of rangeCorners) {
    if (
      centerX >= corner.rangeWidth.min &&
      centerX <= corner.rangeWidth.max &&
      centerY >= corner.rangeHeight.min &&
      centerY <= corner.rangeHeight.max
    ) {
      [safeInnerRangeX, safeInnerRangeY] = corner.snapCoordinates;
      break;
    }
  }

  animateDrag(dragElement, left, top, safeInnerRangeX, safeInnerRangeY);
}

function animateDrag(dragElement: HTMLElement, fromLeft: number, fromTop: number, toLeft: number, toTop: number) {
  dragElement.animate(
    [
      { left: `${fromLeft}px`, top: `${fromTop}px` },
      { left: `${toLeft}px`, top: `${toTop}px` },
    ],
    {
      duration: 250,
      easing: 'ease-out',
    }
  );
  dragElement.style.left = `${toLeft}px`;
  dragElement.style.top = `${toTop}px`;
}

//  If the drag element is out of the scope, return the max or min coordinates of the scope
function validateInnerRangeCoordinates(
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

function getRangeScope(dragElement: HTMLElement, dragArea: HTMLElement | Window): RangeScope {
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
      window.innerWidth - dragElement.clientWidth,
      window.innerHeight - dragElement.clientHeight,
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