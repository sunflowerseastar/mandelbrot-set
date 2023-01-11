mod utils;

use wasm_bindgen::prelude::*;

extern crate web_sys;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    iterations: u16,
    cells: Vec<u16>,
    bx_min: f64,
    by_min: f64,
    bx_max: f64,
    by_max: f64,
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];

                let next_cell = self.mandelbrot_value(row, col);

                next[idx] = next_cell;
            }
        }

        self.cells = next;
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn scale_to_bounds(&self, y: u32, x: u32) -> (f64, f64) {
        let bx_span = self.bx_max - self.bx_min;
        let by_span = self.by_max - self.by_min;

        let bx_min_abs = self.bx_min.abs();
        let xf = x as f64;
        let cwf = self.width as f64;
        let x01 = xf / cwf;
        let xx1 = bx_span * x01;
        let xx = xx1 - bx_min_abs;

        let by_min_abs = self.by_min.abs();
        let yf = y as f64;
        let chf = self.height as f64;
        let y01 = yf / chf;
        let yy1 = by_span * y01;
        let yy = yy1 - by_min_abs;

        (xx, yy)
    }

    fn mandelbrot_value(&self, row: u32, column: u32) -> u16 {
        let scaled_row_column = self.scale_to_bounds(row, column);
        let x0 = scaled_row_column.0;
        let y0 = scaled_row_column.1;

        let mut iteration = 0;
        let mut x = 0.0;
        let mut y = 0.0;
        while (iteration < self.iterations) && (x * x + y * y <= 4.0) {
            let xtemp = (x * x) - (y * y) + x0;
            y = (2.0 * x * y) + y0;
            x = xtemp;
            iteration += 1;
        }

        iteration
    }

    pub fn new(
        width: u32,
        height: u32,
        iterations: u16,
        bx_min: f64,
        by_min: f64,
        bx_max: f64,
        by_max: f64,
    ) -> Universe {
        let cells = (0..width * height)
            .map(|i| if i % 2 == 0 || i % 7 == 0 { 1 } else { 0 })
            .collect();

        Universe {
            width,
            height,
            iterations,
            cells,
            bx_min,
            by_min,
            bx_max,
            by_max,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u16 {
        self.cells.as_ptr()
    }
}
