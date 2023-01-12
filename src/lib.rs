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

    fn mandelbrot_value(&self, x0: f64, y0: f64, i: usize) -> u16 {
        // if (i == 0 || i == (self.width as usize * self.height as usize) - 1) {
        //     log!("{pixel_x} {pixel_y} {x0} {y0} {i} {x0} {y0}");
        // }

        // determine the escape time of the coordinate
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

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for y in 0..self.height {
            for x in 0..self.width {
                let idx = self.get_index(x, y);
                let cell = self.cells[idx];
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
        let cells = (0..width * height)
            .map(|i| if i % 2 == 0 || i % 7 == 0 { 1 } else { 0 })
            .collect();
        let bounds = vec![0.0f64, 0.0, 0.0, 0.0];

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
