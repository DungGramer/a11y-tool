export function drag(dragTarget, dragHandle = dragTarget) {
  let dragElement = null;
  let xOffset = 0;
  let yOffset = 0;

  const dragHandleSelector = document.querySelector(dragHandle);

  dragHandleSelector.addEventListener("mousedown", startDrag, true);
  dragHandleSelector.addEventListener("touchstart", startDrag, true);

  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    dragElement = document.querySelector(dragTarget);
    const { left, top } = dragElement.getBoundingClientRect();

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

    if (dragElement === null) return;

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

    let [safeX, safeY] = safeMoveInnerView(left, top, dragElement);

    dragElement.style.left = `${safeX}px`;
    dragElement.style.top = `${safeY}px`;
  }

  document.addEventListener("mouseup", () => {
    if (dragElement) {
      snapCorner(dragElement);
      dragElement = null;
      window.removeEventListener("mousemove", dragObject, true);
      window.removeEventListener("touchmove", dragObject, true);
    }
  });
}

function snapCorner(dragElement) {
  if (dragElement === null) return;

  let { left, top } = dragElement.getBoundingClientRect();

  let [safeX, safeY] = [left, top];
  const [maxWindowWidth, maxWindowHeight] = [
    window.innerWidth - dragElement.clientWidth,
    window.innerHeight - dragElement.clientHeight,
  ];

  //  [  X - Y ]
  // [[left-top], [right-top], [left-bottom], [right-bottom]]
  const rangeCorners = [
    [
      { min: 0, max: maxWindowWidth / 2 },
      { min: 0, max: maxWindowHeight / 2 },
    ],
    [
      { min: maxWindowWidth / 2, max: maxWindowWidth },
      { min: 0, max: maxWindowHeight / 2 },
    ],
    [
      { min: 0, max: maxWindowWidth / 2 },
      { min: maxWindowHeight / 2, max: maxWindowHeight },
    ],
    [
      { min: maxWindowWidth / 2, max: maxWindowWidth },
      { min: maxWindowHeight / 2, max: maxWindowHeight },
    ],
  ];
  const snapCorners = [
    [0, 0],
    [maxWindowWidth, 0],
    [0, maxWindowHeight],
    [maxWindowWidth, maxWindowHeight],
  ];

  for (let i = 0; i < rangeCorners.length; i++) {
    const [rangeCorner, snapCorner] = [rangeCorners[i], snapCorners[i]];

    if (
      left >= rangeCorner[0].min &&
      left <= rangeCorner[0].max &&
      top >= rangeCorner[1].min &&
      top <= rangeCorner[1].max
    ) {
      [safeX, safeY] = snapCorner;
      break;
    }
  }


  dragElement.animate([
    { left: `${left}px`, top: `${top}px`},
    { left: `${safeX}px`, top: `${safeY}px`},
  ], {
    duration: 200,
    fillMode: 'forwards',
    timingFunction: 'ease-out'
  });
  dragElement.style.top = `${safeY}px`;
  dragElement.style.left = `${safeX}px`;

}

function safeMoveInnerView(left, top, dragElement, snapCorner) {
  if (dragElement === null) return;

  let [safeX, safeY] = [left, top];
  const [maxWindowWidth, maxWindowHeight] = [
    window.innerWidth - dragElement.clientWidth,
    window.innerHeight - dragElement.clientHeight,
  ];
  if (left < 0) {
    safeX = 0;
  } else if (left > maxWindowWidth) {
    safeX = maxWindowWidth;
  }

  if (top < 0) {
    safeY = 0;
  } else if (top > maxWindowHeight) {
    safeY = maxWindowHeight;
  }

  return [safeX, safeY];
}
