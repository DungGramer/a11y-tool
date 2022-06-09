import { TargetElement } from './drag.d';
export function animateDrag(
  dragElement: HTMLElement,
  fromLeft: number,
  fromTop: number,
  toLeft: number,
  toTop: number
) {
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

export function setTargetElementLocation(
  targetElement: TargetElement,
  left: number | string | number[],
  top?: number | string
) {
  if (targetElement === null) return;

  if (left instanceof Array) {
    targetElement.style.left = typeof left[0] === 'string' ? left[0] : `${left[0]}px`;
    targetElement.style.top = typeof left[1] === 'string' ? left[1] : `${left[1]}px`;

    return;
  }

  if (top !== undefined && Number(left) === NaN && Number(top) === NaN) {
    targetElement.style.left = left.toString();
    targetElement.style.top = top.toString();
  } else {
    targetElement.style.left = `${left}px`;
    targetElement.style.top = `${top}px`;
  }
}
