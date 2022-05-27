export function drag(dragTarget, dragScope) {
  let targetElement = document.querySelector(dragTarget);
  let scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);
  let xOffset = 0;
  let yOffset = 0;

  targetElement.addEventListener("mousedown", startDrag, true);
  targetElement.addEventListener("touchstart", startDrag, true);

  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    targetElement = document.querySelector(dragTarget);
    scopeElement = dragScope === undefined ? window : document.querySelector(dragScope);
    const { left, top } = targetElement.getBoundingClientRect();

    let clientX, clientY, typeListener;

    switch (e.type) {
      case "mousedown":
        clientX = e.clientX;
        clientY = e.clientY;
        typeListener = "mousemove";
        break;
      case "touchstart":
        clientX = e.targetTouches[0].clientX;
        clientY = e.targetTouches[0].clientY;
        typeListener = "touchmove";
        break;
    }

    xOffset = clientX - left; //clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'
    yOffset = clientY - top;
    window.addEventListener(typeListener, dragObject, true);
  }

  function dragObject(e) {
    e.preventDefault();
    e.stopPropagation();

    if (targetElement === null) return;

    let clientX, clientY;

    switch (e.type) {
      case "mousemove":
        clientX = e.clientX;
        clientY = e.clientY;
        break;
      case "touchmove":
        clientX = e.targetTouches[0].clientX;
        clientY = e.targetTouches[0].clientY;
        break;
    }

    const left = clientX - xOffset;
    const top = clientY - yOffset;

    let [safeX, safeY] = safeMoveInnerView(
      left,
      top,
      targetElement,
      scopeElement
    );

    targetElement.style.left = `${safeX}px`;
    targetElement.style.top = `${safeY}px`;
  }

  document.addEventListener("mouseup", () => {
    if (targetElement) {
      snapCorner(targetElement, scopeElement);
      targetElement = null;
      window.removeEventListener("mousemove", dragObject, true);
      window.removeEventListener("touchmove", dragObject, true);
    }
  });
}

function snapCorner(dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  let { left, top, width, height } = dragElement.getBoundingClientRect();


  let [centerX, centerY] = [left + width / 2, top + height / 2];
  
  let [safeX, safeY] = [left, top];
  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, widthScope, heightScope, xScope, yScope } = getRangeScope(
    dragElement,
    dragScope
    );
  // console.log(`📕 centerX: ${centerX} centerY: ${centerY}`);
  // console.log(minScopeWidth, maxScopeWidth / 2, minScopeHeight, maxScopeHeight / 2);
  // console.log(`📕 minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight - 87:drag.js \n`, minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight);

  //  [  X - Y ]
  // [[left-top], [right-top], [left-bottom], [right-bottom]]
  const rangeCorners = [
    [
      { min: xScope, max: xScope + widthScope / 2 },
      { min: yScope, max: yScope + heightScope / 2 },
    ],
    [
      { min: xScope + widthScope / 2, max: xScope + widthScope },
      { min: yScope, max: yScope + heightScope / 2 },
    ],
    [
      { min: xScope, max: xScope + widthScope / 2 },
      { min: yScope + heightScope / 2, max: yScope + heightScope },
    ],
    [
      { min: xScope + widthScope / 2, max: xScope + widthScope },
      { min: yScope + heightScope / 2, max: yScope + heightScope },
    ],
  ];
  const snapCorners = [
    [minScopeWidth, minScopeHeight],
    [maxScopeWidth, minScopeHeight],
    [minScopeWidth, maxScopeHeight],
    [maxScopeWidth, maxScopeHeight],
  ];

  for (let i = 0; i < rangeCorners.length; i++) {
    const [rangeCorner, snapCorner] = [rangeCorners[i], snapCorners[i]];

    if (
      centerX >= rangeCorner[0].min &&
      centerX <= rangeCorner[0].max &&
      centerY >= rangeCorner[1].min &&
      centerY <= rangeCorner[1].max
    ) {
      [safeX, safeY] = snapCorner;
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
      fillMode: "forwards",
      timingFunction: "ease-out",
    }
  );
  dragElement.style.top = `${safeY}px`;
  dragElement.style.left = `${safeX}px`;
}

function safeMoveInnerView(left, top, dragElement, dragScope) {
  if (dragElement === null || dragScope === null) return;

  const { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight } =
    getRangeScope(dragElement, dragScope);

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

function getRangeScope(dragElement, dragScope = window) {
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

  return { minScopeWidth, maxScopeWidth, minScopeHeight, maxScopeHeight, widthScope, heightScope, xScope, yScope};
}
