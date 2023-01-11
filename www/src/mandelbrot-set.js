import { Universe } from "wasm-mandelbrot-set";
import { memory } from "wasm-mandelbrot-set/wasm_mandelbrot_set_bg";

import { interpolateInferno } from "d3-scale-chromatic";
import { scaleLog, scaleLinear, scaleSqrt, scalePow } from "d3-scale";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.clientWidth;
const height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;

const boundingBox1 = [
  [-2.0, -1.12],
  [0.47, 1.12],
];
const boundingBox2 = [
  [-0.87, 0.0],
  [-0.67, 0.205],
];
const [[bxMin, byMin], [bxMax, byMax]] = boundingBox1;
// const [[bxMin, byMin], [bxMax, byMax]] = boundingBox2;
const areColorsReversed = false;
const iterations = 500;

const universe = Universe.new(
  width,
  height,
  iterations,
  bxMin,
  byMin,
  bxMax,
  byMax
);

const CELL_SIZE = 1; // px

const getIndex = (row, column) => {
  return row * width + column;
};

const color = scaleLinear().domain([0, 500]).range([0, 1]);
console.log("color(0)", color(0));
console.log("color(200)", color(200));
console.log("color(400)", color(400));

const colorSqrt = scaleSqrt().domain([0, iterations]).range([0, 1]);
console.log("colorSqrt(0)", colorSqrt(0));
console.log("colorSqrt(200)", colorSqrt(200));
console.log("colorSqrt(400)", colorSqrt(400));

const colorLog = scaleLog().base(2).domain([0, iterations]);
console.log("colorLog(0)", colorLog(0));
console.log("colorLog(200)", colorLog(200));
console.log("colorLog(400)", colorLog(400));

const colorPow = scalePow().exponent(8).domain([0, iterations]).range([0, 1]);
console.log("colorPow(0)", colorPow(0));
console.log("colorPow(200)", colorPow(200));
console.log("colorPow(400)", colorPow(400));

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint16Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      // console.log(cells[idx]);

      // ctx.fillStyle = `rgba(0, 0, 0, ${cells[idx] / 255})`;
      // ctx.fillStyle = interpolateCubehelixDefault(cells[idx] / iterations)

      // ctx.fillStyle = interpolateBlues(colorLog(cells[idx]));
      // ctx.fillStyle = interpolateCubehelixDefault(colorLog(cells[idx]));
      // ctx.fillStyle = interpolateCubehelixDefault(colorSqrt(cells[idx]));
      // ctx.fillStyle = interpolateRainbow(colorSqrt(cells[idx]));
      // ctx.fillStyle = interpolateRainbow(colorSqrt(iterations - cells[idx]));
      // ctx.fillStyle = interpolateCubehelixDefault(colorPow(cells[idx]));
      // ctx.fillStyle = interpolateRainbow(colorPow(iterations - cells[idx]));

      // ctx.fillStyle = interpolateInferno(
      //   colorPow(areColorsReversed ? iterations - cells[idx] : cells[idx])
      // );

      ctx.fillStyle = interpolateInferno(colorSqrt(cells[idx]));

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
};

const renderLoop = () => {
  universe.tick();
  drawCells();
  requestAnimationFrame(renderLoop);
};

universe.tick();
drawCells();

// requestAnimationFrame(renderLoop);
