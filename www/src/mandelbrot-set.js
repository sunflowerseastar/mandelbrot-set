import { Universe } from "wasm-mandelbrot-set";
import { memory } from "wasm-mandelbrot-set/wasm_mandelbrot_set_bg";

import { interpolateInferno, interpolateRainbow } from "d3-scale-chromatic";
import { scaleSqrt, scalePow } from "d3-scale";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.clientWidth;
const height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;

const params = new URLSearchParams(document.location.search.substring(1));
const iterationsParam = params.get("iterations");
const zoomParam = params.get("zoom");
const offsetxParam = params.get("offsetx");
const offsetyParam = params.get("offsety");
const panxParam = params.get("panx");
const panyParam = params.get("pany");

let iterations = parseInt(iterationsParam) || 255;
let zoom = parseInt(zoomParam) || 260;
let offsetx = parseInt(offsetxParam) || -height / 2;
let offsety = parseInt(offsetyParam) || -height / 2;
const basePanx = -140;
let panx = panxParam ? parseInt(panxParam) + basePanx : basePanx;
let pany = parseInt(panyParam) || 0;
// console.log("zoom, offsetx, offsety, panx, pany", zoom, offsetx, offsety, panx, pany);

const colorSqrt = scaleSqrt().domain([0, iterations]).range([0, 1]);
const colorPow = scalePow().exponent(8).domain([0, iterations]).range([0, 1]);
const colorScaleFnLookup = {
  pow: colorPow,
  sqrt: colorSqrt,
};
const colorInterpolationLookup = {
  inferno: interpolateInferno,
  rainbow: interpolateRainbow,
};
const colorScale = colorScaleFnLookup[params.get("colorscale") || "sqrt"];
const colorInterpolation =
  colorInterpolationLookup[params.get("interpolation") || "inferno"];
const areColorsReversed = params.get("reverse");

let universe;

const CELL_SIZE = 1; // px

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint16Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      const colorValue = colorScale(
        areColorsReversed ? iterations - cells[idx] : cells[idx]
      );
      ctx.fillStyle = colorInterpolation(colorValue);
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

const getMousePos = (canvas, e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(
      ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
    ),
    y: Math.round(
      ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
    ),
  };
};

const onMouseDown = (e) => {
  const pos = getMousePos(canvas, e);

  // zoom in/out with regular click & shift-click
  const isZoomingIn = !e.shiftKey;
  // pan with ctrl+click
  const factor = e.ctrlKey ? 1 : 3;

  if (isZoomingIn) {
    // Zoom in
    zoom *= factor;
    panx = factor * (pos.x + offsetx + panx);
    pany = factor * (pos.y + offsety + pany);
  } else {
    // Zoom out
    zoom /= factor;
    panx = (pos.x + offsetx + panx) / factor;
    pany = (pos.y + offsety + pany) / factor;
  }

  // console.log("zoom, offsetx, offsety, panx, pany", zoom, offsetx, offsety, panx, pany);
  universe.tick2(zoom, offsetx, offsety, panx, pany);
  drawCells();
};

const init = () => {
  universe = Universe.new(
    width,
    height,
    iterations,
    zoom,
    offsetx,
    offsety,
    panx,
    pany
  );

  canvas.addEventListener("mousedown", onMouseDown);

  universe.tick();
  drawCells();
};

init();
