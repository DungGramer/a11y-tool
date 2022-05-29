export function drag(dragTarget, dragScope, hasSnapCorner) {
  let targetElement = document.querySelector(dragTarget);
  let scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);
  let [xOffset, yOffset] = [0, 0];

  targetElement.addEventListener('mousedown', startDrag, true);
  targetElement.addEventListener('touchstart', startDrag, true);

  // Event Listener when user click down
  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    targetElement = document.querySelector(dragTarget);
    scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);
    const { left, top } = targetElement.getBoundingClientRect();

    let { clientX, clientY, typeListener } = getClientCoordinates(e);

    // clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'

    xOffset = clientX - left;
    yOffset = clientY - top;
    console.log(`📕 clientX, clientY - 35:drag.js \n`, clientX, clientY);
    console.log(`📕 left, top - 37:drag.js \n`, left, top);
    console.log(`📕 xOffset - 34:drag.js \n`, xOffset, yOffset);
    window.addEventListener(typeListener, dragObject, true);
  }

  // Event Listener when user press and move mouse
  function dragObject(e) {
    e.preventDefault();
    e.stopPropagation();

    if (targetElement === null) return;

    let { clientX, clientY } = getClientCoordinates(e);

    const left = clientX - xOffset;
    const top = clientY - yOffset;

    let [safeX, safeY] = validateInnerRangeCoordinates(left, top, targetElement, scopeElement);

    targetElement.style.left = `${safeX}px`;
    targetElement.style.top = `${safeY}px`;
  }

  document.addEventListener('mouseup', () => {
    if (targetElement) {
      if (hasSnapCorner === true) snapCorner(targetElement, scopeElement);

      targetElement = null;
      window.removeEventListener('mousemove', dragObject, true);
      window.removeEventListener('touchmove', dragObject, true);
    }
  });
}

// Get client coordinates
function getClientCoordinates(event) {
  let clientX, clientY, typeListener;

  // Get coordinates mouse when user click
  switch (event.type) {
    case 'mousedown':
    case 'mousemove':
      clientX = event.clientX;
      clientY = event.clientY;
      typeListener = 'mousemove';
      break;
    case 'touchstart':
    case 'touchmove':
      clientX = event.targetTouches[0].clientX;
      clientY = event.targetTouches[0].clientY;
      typeListener = 'touchmove';
      break;
  }

  return { clientX, clientY, typeListener };
}

// Snap to the corner of the scope
function snapCorner(dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();

  let [centerX, centerY] = [left + width / 2, top + height / 2];

  let [safeX, safeY] = [0, 0];
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, widthScope, heightScope, xScope, yScope } =
    getRangeScope(dragElement, dragScope);

  //  [  X - Y ]
  // [[left-top], [right-top], [left-bottom], [right-bottom]]
  const rangeLeft = { min: xScope, max: xScope + widthScope / 2 };
  const rangeTop = { min: yScope, max: yScope + heightScope / 2 };
  const rangeRight = { min: xScope + widthScope / 2, max: xScope + widthScope };
  const rangeBottom = {
    min: yScope + heightScope / 2,
    max: yScope + heightScope,
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

  dragElement.animate(
    [
      { left: `${left}px`, top: `${top}px` },
      { left: `${safeX}px`, top: `${safeY}px` },
    ],
    {
      duration: 250,
      fillMode: 'forwards',
      timingFunction: 'ease-out',
    }
  );
  dragElement.style.left = `${safeX}px`;
  dragElement.style.top = `${safeY}px`;
}

// If the drag element is out of the scope, return the max or min coordinates of the scope
function validateInnerRangeCoordinates(left, top, dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight } = getRangeScope(dragElement, dragScope);

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

function getRangeScope(dragElement, dragScope) {
  let maxScopeWidth, maxScopeHeight, minScopeWidth, minScopeHeight, widthScope, heightScope, xScope, yScope;

  if (dragScope === window) {
    [minScopeWidth, minScopeHeight] = [0, 0];
    [maxScopeWidth, maxScopeHeight] = [
      window.innerWidth - dragElement.clientWidth,
      window.innerHeight - dragElement.clientHeight,
    ];

    [widthScope, heightScope] = [window.innerWidth, window.innerHeight];

    [xScope, yScope] = [0, 0];
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

    xScope = scopeRect.left;
    yScope = scopeRect.top;
  }

  return {
    minScopeWidth,
    maxScopeWidth,
    minScopeHeight,
    maxScopeHeight,
    widthScope,
    heightScope,
    xScope,
    yScope,
  };
}
