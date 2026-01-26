#include "../generated/assets/background/puzzle_15_assets.h"
#include "graphics_util.h"
#include <gb/drawing.h>
#include <gb/gb.h>
#include <gbdk/platform.h>
#include <stdint.h>

const uint8_t ERASE_TOOL = 0;
const uint8_t FILL_TOOL = 1;
const uint8_t STAMP_TOOL = 2;

const uint8_t PUZZLE_TILE_SIZE = 6;
const uint8_t PUZZLE_TILE_START_X = 58;
const uint8_t PUZZLE_TILE_START_Y = 50;

const uint8_t OFFSET_FOR_CLUES = 8 * 4;

const uint8_t cross_stamp[5][5] = {{0, 0, 0, 0, 0},
                                   {0, 2, 0, 2, 0},
                                   {0, 0, 2, 0, 0},
                                   {0, 2, 0, 2, 0},
                                   {0, 0, 0, 0, 0}};

const uint8_t sample_puzzle_data[15][15] = {
    {0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0},
    {0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
    {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0},
    {1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1},
    {1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1},
    {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
    {1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1},
    {1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1},
    {1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1},
    {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
    {1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1},
    {1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1},
    {0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0},
    {0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0},
    {0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0}};

void init_puzzle_background(void) {
  blank_screen();

  set_bkg_data(0, puzzle_15_assets_TILE_COUNT, puzzle_15_assets_tiles);
  set_bkg_tiles(0, 0, puzzle_15_assets_WIDTH / puzzle_15_assets_TILE_W,
                puzzle_15_assets_HEIGHT / puzzle_15_assets_TILE_H,
                puzzle_15_assets_map);

  SHOW_BKG;

  // Load the palettes at the start of a new frame
  vsync();
  if (_cpu == CGB_TYPE) {
    set_bkg_palette(BKGF_CGB_PAL0, CGB_ONE_PAL, puzzle_15_assets_palettes);
  } else {
    BGP_REG = DMG_PALETTE(DMG_WHITE, DMG_LITE_GRAY, DMG_DARK_GRAY, DMG_BLACK);
  }
}

void load_puzzle(uint8_t selected_puzzle, uint8_t *puzzle_solution) {
  for (uint8_t i = 0; i < 15; i++) {
    for (uint8_t j = 0; j < 15; j++) {
      puzzle_solution[i * 15 + j] = sample_puzzle_data[i][j];
    }
  }
}

void init_puzzle(uint8_t selected_puzzle, uint8_t *puzzle_solution,
                 uint8_t *puzzle_data) {
  init_puzzle_background();

  // prepare start menu

  // load data
  load_puzzle(selected_puzzle, puzzle_solution);

  // init data
  for (uint8_t i = 0; i < 15; i++) {
    for (uint8_t j = 0; j < 15; j++) {
      puzzle_data[i * 15 + j] = 0;
    }
  }

  // load cursor sprites

  // load time sprite
}

void puzzle_coordinates_to_screen_coordinates(uint8_t x, uint8_t y,
                                              uint8_t *screen_x,
                                              uint8_t *screen_y) {
  *screen_x = PUZZLE_TILE_START_X + x * PUZZLE_TILE_SIZE;
  *screen_y = PUZZLE_TILE_START_Y + y * PUZZLE_TILE_SIZE;
}

void move_cursor_puzzle(uint8_t x, uint8_t y) {
  uint8_t screen_x, screen_y;
  puzzle_coordinates_to_screen_coordinates(x, y, &screen_x, &screen_y);
  set_sprite_tile(0, 2);

  move_sprite(0, screen_x, screen_y);
}

uint8_t puzzle_coordinates_to_memory_address(uint8_t x, uint8_t y) {
  return (y * 16 * 8) + (x * 8) + OFFSET_FOR_CLUES;
}

// tile_value: 0 - stamp, 1 - filled, 2 - erase
void update_background_tile(uint8_t x, uint8_t y, uint8_t tile_value) {
  uint8_t memory = puzzle_coordinates_to_memory_address(x, y);

  uint8_t data[5][5];
  if (tile_value == STAMP_TOOL) {
    for (uint8_t i = 0; i < 5; i++) {
      for (uint8_t j = 0; j < 5; j++) {
        data[i][j] = cross_stamp[i][j];
      }
    }
  } else if (tile_value == FILL_TOOL) {
    for (uint8_t i = 0; i < 5; i++) {
      for (uint8_t j = 0; j < 5; j++) {
        data[i][j] = 2;
      }
    }
  } else if (tile_value == ERASE_TOOL) {
    for (uint8_t i = 0; i < 5; i++) {
      for (uint8_t j = 0; j < 5; j++) {
        data[i][j] = 0;
      }
    }
  }

  for (uint8_t i = 0; i < 5; i++) {
    uint8_t offset =
        memory +
        (i * 16 * 8); // there are 16 tiles in a row in memory, each 8x8 pixels
    set_data(&offset, data[i], 5);
  }
}

void puzzle_loop(uint8_t selected_puzzle) {
  uint8_t puzzle_solution[15 * 15];
  uint8_t puzzle_data[15 * 15];
  init_puzzle(selected_puzzle, puzzle_solution, puzzle_data);
  uint8_t cursor_x = 0;
  uint8_t cursor_y = 0;
  uint8_t primary_tool = FILL_TOOL;

  while (1) {
    uint8_t joypad_state = joypad();
    if (joypad_state & J_START) {
      // show menu
    }
    if (joypad_state & J_SELECT) {
      // swap primary and secondary tool
      primary_tool = 3 - primary_tool;
    }
    uint8_t tile_changed = 0;
    if (joypad_state & J_A) {
      if (puzzle_data[cursor_y * 15 + cursor_x] == 0) {
        puzzle_data[cursor_y * 15 + cursor_x] = primary_tool;
        tile_changed = 1;
      } else if (puzzle_data[cursor_y * 15 + cursor_x] == 1) {
        puzzle_data[cursor_y * 15 + cursor_x] = 0;
        tile_changed = 1;
      }
      // if it's the secondary tool, ignore command
    }
    if (joypad_state & J_B) {
      uint8_t secondary_tool = 3 - primary_tool;
      if (puzzle_data[cursor_y * 15 + cursor_x] == 0) {
        puzzle_data[cursor_y * 15 + cursor_x] =
            secondary_tool; // secondary tool
        tile_changed = 1;
      } else if (puzzle_data[cursor_y * 15 + cursor_x] != secondary_tool) {
        puzzle_data[cursor_y * 15 + cursor_x] = 0;
        tile_changed = 1;
      }
      // if it's the primary tool, ignore command
    }

    if (tile_changed) {
      // update sprite tile
      if (puzzle_data[cursor_y * 15 + cursor_x] == 0) {
        set_sprite_tile(0, primary_tool);
      } else {
        set_sprite_tile(0, 0);
      }

      // update background tile
      update_background_tile(cursor_x, cursor_y,
                             puzzle_data[cursor_y * 15 + cursor_x]);
    }
    uint8_t moved = 0;
    if (joypad_state & J_LEFT) {
      if (cursor_x == 0) {
        cursor_x = 14;
      } else {
        cursor_x--;
      }
      moved = 1;
    }
    if (joypad_state & J_RIGHT) {
      if (cursor_x == 14) {
        cursor_x = 0;
      } else {
        cursor_x++;
      }
      moved = 1;
    }
    if (joypad_state & J_UP) {
      if (cursor_y == 0) {
        cursor_y = 14;
      } else {
        cursor_y--;
      }
      moved = 1;
    }
    if (joypad_state & J_DOWN) {
      if (cursor_y == 14) {
        cursor_y = 0;
      } else {
        cursor_y++;
      }
      moved = 1;
    }
    if (moved) {
      // update cursor sprite location
      move_cursor_puzzle(cursor_x, cursor_y);

      // update cursor sprite tile
      if (puzzle_data[cursor_y * 15 + cursor_x] == 0) {
        set_sprite_tile(0, primary_tool);
      } else {
        set_sprite_tile(0, ERASE_TOOL);
      }
    }

    vsync();
  }
}