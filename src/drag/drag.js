export function drag(dragTarget, dragScope, hasSnapCorner) {
  let targetElement = document.querySelector(dragTarget);
  let scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);

  // Coordinates of the mouse move end
  let [offsetX, offsetY] = [0, 0];

  targetElement.addEventListener('pointerdown', startDrag, true);

  // Event Listener when user click down
  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    targetElement = document.querySelector(dragTarget);
    scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);
    const { left, top } = targetElement.getBoundingClientRect();

    let { clientX, clientY, typeListener } = getClientCoordinates(e);

    // clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'

    offsetX = clientX - left;
    offsetY = clientY - top;
    window.addEventListener(typeListener, dragObject, true);
  }

  // Event Listener when user press and move mouse
  function dragObject(e) {
    e.preventDefault();
    e.stopPropagation();

    if (targetElement === null) return;

    let { clientX, clientY } = getClientCoordinates(e);

    const left = clientX - offsetX;
    const top = clientY - offsetY;

    let [safeX, safeY] = validateInnerRangeCoordinates(left, top, targetElement, scopeElement);

    targetElement.style.left = `${safeX}px`;
    targetElement.style.top = `${safeY}px`;
  }

  document.addEventListener('pointerup', () => {
    if (targetElement) {
      if (hasSnapCorner === true) snapCorner(targetElement, scopeElement);

      targetElement = null;
      window.removeEventListener('pointerdown', dragObject, true);
      window.removeEventListener('pointermove', dragObject, true);
    }
  });
}

// Get client coordinates
function getClientCoordinates(event) {
  // Get coordinates mouse when user click
  if (['pointerdown', 'pointermove'].includes(event.type)) {
    return { clientX: event.clientX, clientY: event.clientY, typeListener: 'pointermove' };
  }
}

// Snap to the corner of the scope
function snapCorner(dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeX, safeY] = [0, 0];
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, widthScope, heightScope, scopeX, scopeY } =
    getScopeRange(dragElement, dragScope);

  //  [  X - Y ]
  // [[left-top], [right-top], [left-bottom], [right-bottom]]
  const rangeLeft = { min: scopeX, max: scopeX + widthScope / 2 };
  const rangeTop = { min: scopeY, max: scopeY + heightScope / 2 };
  const rangeRight = { min: scopeX + widthScope / 2, max: scopeX + widthScope };
  const rangeBottom = {
    min: scopeY + heightScope / 2,
    max: scopeY + heightScope,
  };
  const rangeCorners = [
    {
      cornerName: 'left-top',
      rangeWidth: rangeLeft,
      rangeHeight: rangeTop,
      snapLocation: [minScopeWidth, minScopeHeight],
    },
    {
      cornerName: 'right-top',
      rangeWidth: rangeRight,
      rangeHeight: rangeTop,
      snapLocation: [maxScopeWidth, minScopeHeight],
    },
    {
      cornerName: 'left-bottom',
      rangeWidth: rangeLeft,
      rangeHeight: rangeBottom,
      snapLocation: [minScopeWidth, maxScopeHeight],
    },
    {
      cornerName: 'right-bottom',
      rangeWidth: rangeRight,
      rangeHeight: rangeBottom,
      snapLocation: [maxScopeWidth, maxScopeHeight],
    },
  ];

  for (const corner of rangeCorners) {
    if (
      centerX >= corner.rangeWidth.min &&
      centerX <= corner.rangeWidth.max &&
      centerY >= corner.rangeHeight.min &&
      centerY <= corner.rangeHeight.max
    ) {
      [safeX, safeY] = corner.snapLocation;
      break;
    }
  }

  animateDrag(dragElement, left, top, safeX, safeY);
}

function animateDrag(dragElement, fromLeft, fromTop, toLeft, toTop) {
  dragElement.animate(
    [
      { left: `${fromLeft}px`, top: `${fromTop}px` },
      { left: `${toLeft}px`, top: `${toTop}px` },
    ],
    {
      duration: 250,
      fillMode: 'forwards',
      timingFunction: 'ease-out',
    }
  );
  dragElement.style.left = `${toLeft}px`;
  dragElement.style.top = `${toTop}px`;
}

// If the drag element is out of the scope, return the max or min coordinates of the scope
function validateInnerRangeCoordinates(left, top, dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight } = getScopeRange(dragElement, dragScope);

  let [safeX, safeY] = [left, top];

  if (left < minScopeWidth) {
    safeX = minScopeWidth;
  } else if (left > maxScopeWidth) {
    safeX = maxScopeWidth;
  }

  if (top < minScopeHeight) {
    safeY = minScopeHeight;
  } else if (top > maxScopeHeight) {
    safeY = maxScopeHeight;
  }

  return [safeX, safeY];
}

function getScopeRange(dragElement, dragScope) {
  let maxScopeWidth, maxScopeHeight, minScopeWidth, minScopeHeight, widthScope, heightScope, scopeX, scopeY;

  if (dragScope === window) {
    [minScopeWidth, minScopeHeight] = [0, 0];
    [maxScopeWidth, maxScopeHeight] = [
      window.innerWidth - dragElement.clientWidth,
      window.innerHeight - dragElement.clientHeight,
    ];

    [widthScope, heightScope] = [window.innerWidth, window.innerHeight];

    [scopeX, scopeY] = [0, 0];
  } else if (dragScope instanceof Node) {
    const scopeRect = dragScope.getBoundingClientRect();

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
  };
}
