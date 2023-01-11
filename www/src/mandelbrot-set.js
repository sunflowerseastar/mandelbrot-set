import { Universe } from "wasm-mandelbrot-set";
import { memory } from "wasm-mandelbrot-set/wasm_mandelbrot_set_bg";

const CELL_SIZE = 1; // px

// Construct the universe, and get its width and height.

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.clientWidth;
const height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;

const universe = Universe.new(width, height);

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = `rgba(0, 0, 0, ${cells[idx] / 128})`;

      ctx.fillRect(
        col * CELL_SIZE + 1,
        row * CELL_SIZE + 1,
        CELL_SIZE,
        CELL_SIZE
      );
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
