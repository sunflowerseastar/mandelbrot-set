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
    offsetx: i32,
    offsety: i32,
    panx: i32,
    pany: i32,
    zoom: f64,
}

#[wasm_bindgen]
impl Universe {
    fn get_index(&self, x: u32, y: u32) -> usize {
        (y * self.width + x) as usize
    }

    fn scale_xy(&self, pixel_x: u32, pixel_y: u32, i: usize) -> (f64, f64) {
        // scaled x coordinate, x0
        let pixel_x_i32 = pixel_x as i32;
        let x0_0 = pixel_x_i32 + self.offsetx + self.panx + 1;
        let x0_1 = x0_0 as f64;
        let x0 = x0_1 / self.zoom;
        // scaled y coordinate, y0
        let pixel_y_i32 = pixel_y as i32;
        let y0_0 = pixel_y_i32 + self.offsety + self.pany + 1;
        let y0_1 = y0_0 as f64;
        let y0 = y0_1 / self.zoom;

        (x0, y0)
    }

    fn index_to_xy(&self, width: u32, height: u32, idx: u16) -> (u32, u32) {
        let idx_u32 = idx as u32;
        let size = width * height;
        let x = idx_u32 % width;
        let y = idx_u32 / width;
        log!("{width} {height} {idx} {x} {y}");
        (x, y)
    }

    // https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set#Optimized_escape_time_algorithms
    fn mandelbrot_value(&self, x0: f64, y0: f64, i: usize) -> u16 {
        let mut iteration = 0;
        let mut x = 0.0;
        let mut y = 0.0;
        let mut x2 = 0.0;
        let mut y2 = 0.0;
        while (iteration < self.iterations) && (x2 + y2 <= 4.0) {
            y = ((x + x) * y) + y0;
            x = x2 - y2 + x0;
            x2 = x * x;
            y2 = y * y;
            iteration += 1;
        }

        iteration
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for y in 0..self.height {
            for x in 0..self.width {
                let idx = self.get_index(x, y);
                // let cell = self.cells[idx];
                let scaled_xy = self.scale_xy(x, y, idx);
                let next_cell = self.mandelbrot_value(scaled_xy.0, scaled_xy.1, idx);
                // log!("{next_cell}");
                next[idx] = next_cell;
            }
        }
        // log!("len {}", next.len());
        // log!("{next.0}")
        self.cells = next;
    }

    pub fn tick2(&mut self, zoom: f64, offsetx: i32, offsety: i32, panx: i32, pany: i32) {
        self.zoom = zoom;
        self.offsetx = offsetx;
        self.offsety = offsety;
        self.panx = panx;
        self.pany = pany;

        self.tick();
    }

    pub fn new(
        width: u32,
        height: u32,
        iterations: u16,
        zoom: f64,
        offsetx: i32,
        offsety: i32,
        panx: i32,
        pany: i32,
    ) -> Universe {
        let cells = (0..width * height).map(|_| 0).collect();

        Universe {
            width,
            height,
            iterations,
            zoom,
            cells,
            offsetx,
            offsety,
            panx,
            pany,
        }
    }

    pub fn cells(&self) -> *const u16 {
        self.cells.as_ptr()
    }
}
