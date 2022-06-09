import { setTargetElementLocation } from './animateDrag';
import { DragProps, TargetElement, ScopeElement } from './drag.d';
import { validateInnerRangeCoordinates, getClientCoordinates } from './RangeScope';
import { snapDirection, setLocalStorage, getRangeCorners } from './Snap';
import { snapPlacement } from './drag.d';

export function drag(props: DragProps) {
  const { dragTarget, dragArea, snapPlacement, initLocation } = props;

  let targetElement: TargetElement = document.querySelector(dragTarget);
  let scopeElement: ScopeElement = typeof dragArea === 'string' ? document.querySelector(dragArea) : window;

  // Coordinates of the mouse move end
  let [offsetX, offsetY] = [0, 0];
  if (targetElement === null || scopeElement === null) return;
  setInitLocation(targetElement, scopeElement, initLocation);

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
      snapDirection(targetElement, scopeElement, snapPlacement);

      targetElement = null;
      window.removeEventListener('pointerdown', dragObject, true);
      window.removeEventListener('pointermove', dragObject, true);
    }
  });
}

function setInitLocation(targetElement: TargetElement, scopeElement: ScopeElement, initLocation: number[] | undefined) {
  if (targetElement === null || scopeElement === null) return;

  const [leftLocalStorage, topLocalStorage, scopeStorage] = [
    window.localStorage.getItem('left'),
    window.localStorage.getItem('top'),
    window.localStorage.getItem('scopeElement'),
  ];

  if (initLocation instanceof Array) {
    setTargetElementLocation(targetElement, initLocation);
    setLocalStorage(initLocation[0], initLocation[1]);
  } else if (initLocation !== undefined && snapPlacement.includes(initLocation)) {
    snapDirection(targetElement, scopeElement, initLocation, false);
  } else if (leftLocalStorage !== null && topLocalStorage !== null && scopeStorage === (<HTMLElement>scopeElement).outerHTML) {
    setTargetElementLocation(targetElement, leftLocalStorage, topLocalStorage);
  } else {
    const { rangeCorners } = getRangeCorners(targetElement, scopeElement);
    const { snapCoordinates } = rangeCorners['top-right'];

    setTargetElementLocation(targetElement, snapCoordinates[0], snapCoordinates[1]);
    setLocalStorage(snapCoordinates[0], snapCoordinates[1], 'top-right', scopeElement);
  }
}
