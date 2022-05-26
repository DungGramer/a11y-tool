import { drag } from "./drag";
import "./styles.css";

function render() {
  const container = document.createElement("article");
  container.className = "a11y-tool";
  container.draggable = true;

  document.body.appendChild(container);
}

function location() {}



export function a11y() {
  render();
  drag(".a11y-tool");
}
