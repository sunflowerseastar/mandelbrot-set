import { Universe } from "wasm-mandelbrot-set";
import { memory } from "wasm-mandelbrot-set/wasm_mandelbrot_set_bg";

import { interpolateInferno } from "d3-scale-chromatic";
import { scaleSqrt, scalePow } from "d3-scale";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.clientWidth;
const height = canvas.clientHeight;
// const width = 10;
// const height = 10;
canvas.width = width;
canvas.height = height;

// const boundingBox1 = [[-2.0, -1.12], [0.47, 1.12],];
// const boundingBox2 = [[-0.87, 0.0], [-0.67, 0.205],];
// const [[bxMin, byMin], [bxMax, byMax]] = boundingBox1;
// const [[bxMin, byMin], [bxMax, byMax]] = boundingBox2;

// const areColorsReversed = false;
const iterations = 255;

let params = new URLSearchParams(document.location.search.substring(1));
let zoomParam = params.get("zoom");
let offsetxParam = params.get("offsetx");
let offsetyParam = params.get("offsety");
let panxParam = params.get("panx");
let panyParam = params.get("pany");
console.log(
  "zoomParam, offsetxParam, offsetyParam, panxParam, panyParam",
  zoomParam,
  offsetxParam,
  offsetyParam,
  panxParam,
  panyParam
);

let zoom = parseInt(zoomParam) || 260;
let offsetx = offsetxParam || -height / 2;
let offsety = offsetyParam || -height / 2;
const basePanx = -140;
let panx = panxParam ? parseInt(panxParam) + basePanx : basePanx;
let pany = parseInt(panyParam) || 0;
console.log(
  "zoom, offsetx, offsety, panx, pany",
  zoom,
  offsetx,
  offsety,
  panx,
  pany
);

const universe = Universe.new(
  width,
  height,
  iterations,
  zoom,
  offsetx,
  offsety,
  panx,
  pany
);

const CELL_SIZE = 1; // px

const getIndex = (row, column) => {
  return row * width + column;
};

const colorSqrt = scaleSqrt().domain([0, iterations]).range([0, 1]);
// const colorPow = scalePow().exponent(8).domain([0, iterations]).range([0, 1]);

const drawCells = () => {
  const cellsPtr = universe.cells();
  // console.log("before cells", memory.buffer);
  const cells = new Uint16Array(memory.buffer, cellsPtr, width * height);
  // console.log("cells", cells);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      // ctx.fillStyle = interpolateInferno(
      //   colorPow(areColorsReversed ? iterations - cells[idx] : cells[idx])
      // );
      ctx.fillStyle = interpolateInferno(colorSqrt(cells[idx]));

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

const zoomFractal = (x, y, factor, zoomin) => {
  if (zoomin) {
    // Zoom in
    zoom *= factor;
    panx = factor * (x + offsetx + panx);
    pany = factor * (y + offsety + pany);
  } else {
    // Zoom out
    zoom /= factor;
    panx = (x + offsetx + panx) / factor;
    pany = (y + offsety + pany) / factor;
  }
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

  // Zoom out with Control
  const zoomin = true;
  if (e.ctrlKey) {
    zoomin = false;
  }

  // Pan with Shift
  const zoomfactor = 2;
  if (e.shiftKey) {
    zoomfactor = 1;
  }

  console.log("pos.x, pos.y ", pos.x, pos.y);

  zoomFractal(pos.x, pos.y, zoomfactor, zoomin);

  //   universe.generate(
  //   iterations,
  //   zoom,
  //   offsetx,
  //   offsety,
  //   panx,
  //   pany,
  // )

  universe.tick();
  drawCells();
};

const init = () => {
  canvas.addEventListener("mousedown", onMouseDown);

  universe.tick();
  drawCells();

  // const renderLoop = () => {
  //   universe.tick();
  //   drawCells();
  //   requestAnimationFrame(renderLoop);
  // };
  // requestAnimationFrame(renderLoop);
};

init();
