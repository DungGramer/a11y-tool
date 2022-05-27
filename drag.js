export function drag(dragTarget, dragScope) {
  let targetElement = document.querySelector(dragTarget);
  let scopeElement = document.querySelector(dragScope);
  let xOffset = 0;
  let yOffset = 0;

  targetElement.addEventListener("mousedown", startDrag, true);
  targetElement.addEventListener("touchstart", startDrag, true);

  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    targetElement = document.querySelector(dragTarget);
    scopeElement = document.querySelector(dragScope);
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

  let leftScope = dragScope.getBoundingClientRect().left;
  let topScope = dragScope.getBoundingClientRect().top;
  let widthScope = dragScope.getBoundingClientRect().width;
  let heightScope = dragScope.getBoundingClientRect().height;

  let [centerX, centerY] = [left + width / 2, top + height / 2];
  
  let [safeX, safeY] = [left, top];
  const { minWindowWidth, maxWindowWidth, minWindowHeight, maxWindowHeight } = getRangeScope(
    dragElement,
    dragScope
    );
  // console.log(`📕 centerX: ${centerX} centerY: ${centerY}`);
  // console.log(minWindowWidth, maxWindowWidth / 2, minWindowHeight, maxWindowHeight / 2);
  // console.log(`📕 minWindowWidth, maxWindowWidth, minWindowHeight, maxWindowHeight - 87:drag.js \n`, minWindowWidth, maxWindowWidth, minWindowHeight, maxWindowHeight);

  //  [  X - Y ]
  // [[left-top], [right-top], [left-bottom], [right-bottom]]
  const rangeCorners = [
    [
      { min: leftScope, max: leftScope + widthScope / 2 },
      { min: topScope, max: topScope + heightScope / 2 },
    ],
    [
      { min: leftScope + widthScope / 2, max: leftScope + widthScope },
      { min: topScope, max: topScope + heightScope / 2 },
    ],
    [
      { min: leftScope, max: leftScope + widthScope / 2 },
      { min: topScope + heightScope / 2, max: topScope + heightScope },
    ],
    [
      { min: leftScope + widthScope / 2, max: leftScope + widthScope },
      { min: topScope + heightScope / 2, max: topScope + heightScope },
    ],
  ];
  const snapCorners = [
    [minWindowWidth, minWindowHeight],
    [maxWindowWidth, minWindowHeight],
    [minWindowWidth, maxWindowHeight],
    [maxWindowWidth, maxWindowHeight],
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

  const { minWindowWidth, maxWindowWidth, minWindowHeight, maxWindowHeight } =
    getRangeScope(dragElement, dragScope);

  let [safeX, safeY] = [left, top];

  if (left < minWindowWidth) {
    safeX = minWindowWidth;
  } else if (left > maxWindowWidth) {
    safeX = maxWindowWidth;
  }

  if (top < minWindowHeight) {
    safeY = minWindowHeight;
  } else if (top > maxWindowHeight) {
    safeY = maxWindowHeight;
  }

  return [safeX, safeY];
}

function getRangeScope(dragElement, dragScope = window) {
  let maxWindowWidth, maxWindowHeight, minWindowWidth, minWindowHeight;

  if (dragScope === window) {
    [maxWindowWidth, maxWindowHeight] = [
      window.innerWidth - dragElement.clientWidth,
      window.innerHeight - dragElement.clientHeight,
    ];
    [minWindowWidth, minWindowHeight] = [0, 0];
  } else if (dragScope instanceof Node) {
    minWindowWidth = dragScope.getBoundingClientRect().left;
    minWindowHeight = dragScope.getBoundingClientRect().top;
    [maxWindowWidth, maxWindowHeight] = [
      minWindowWidth + dragScope.clientWidth - dragElement.clientWidth,
      minWindowHeight + dragScope.clientHeight - dragElement.clientHeight,
    ];
  }

  return { minWindowWidth, maxWindowWidth, minWindowHeight, maxWindowHeight };
}
