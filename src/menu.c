
#include <gbdk/platform.h>
#include <gb/drawing.h>
#include <gb/gb.h>
#include <stdint.h>
#include <gb/metasprites.h>

#include "../generated/assets/background/menu_assets.h"
#include "../generated/assets/sprite/menu_cursor_assets.h"
#include "graphics_util.h"

void init_menu(void)
{
    blank_screen();

    set_bkg_data(0, menu_assets_TILE_COUNT, menu_assets_tiles);
    set_bkg_tiles(0, 0, menu_assets_WIDTH / menu_assets_TILE_W, menu_assets_HEIGHT / menu_assets_TILE_H, menu_assets_map);

    SHOW_BKG;

    // Load the palettes at the start of a new frame
    vsync();
    if (_cpu == CGB_TYPE)
    {
        set_bkg_palette(BKGF_CGB_PAL0, CGB_ONE_PAL, menu_assets_palettes);;
    }
    else
    {
        BGP_REG = DMG_PALETTE(DMG_WHITE, DMG_LITE_GRAY, DMG_DARK_GRAY, DMG_BLACK);
    }
}

size_t num_tiles;

void load_sprites(void)
{
    size_t i;
    num_tiles = sizeof(menu_cursor_assets_tiles) >> 4;
    for (i = 0; i < num_tiles; i++)
    {
        set_sprite_data(i, 1, menu_cursor_assets_tiles + (i << 4));
    }

    if (_cpu == CGB_TYPE)
    {
        set_sprite_palette(0, 1, menu_cursor_assets_palettes);
    } else {
        OBP0_REG = DMG_PALETTE(DMG_WHITE, DMG_LITE_GRAY, DMG_DARK_GRAY, DMG_BLACK);
    }

}

void init_cursor(void)
{
    set_sprite_data(0, menu_cursor_assets_TILE_COUNT, menu_cursor_assets_tiles);
    set_sprite_tile(0, 0);

    load_sprites();

// Check what size hardware sprite the metasprite is using (from sprite.h)
#if sprite_TILE_H == 16
    SPRITES_8x16;
#else
    SPRITES_8x8;
#endif

    SHOW_SPRITES;
}

void move_cursor(int x, int y)
{
    move_metasprite_ex(menu_cursor_assets_metasprites[0], 0, 0, 0,
                       DEVICE_SPRITE_PX_OFFSET_X + (x),
                       DEVICE_SPRITE_PX_OFFSET_Y + (y));
}

#define min_cursor_x 16
#define cursor_x_step 32
#define max_cursor_x min_cursor_x + cursor_x_step * 3
#define min_cursor_y 20
#define cursor_y_step 16
#define max_cursor_y min_cursor_y + cursor_y_step * 6

uint8_t wrap_cursor(uint8_t value, uint8_t min, uint8_t max)
{
    if (value < min)
    {
        return max;
    }
    if (value > max)
    {
        return min;
    }
    return value;
}

static const uint8_t menu_options[7][4] = {
    {0, 7, 14, 21},
    {1, 8, 15, 22},
    {2, 9, 16, 23},
    {3, 10, 17, 24},
    {4, 11, 18, 25},
    {5, 12, 19, 26},
    {6, 13, 20, 27},
};


uint8_t menu_loop(void)
{
    init_menu();
    init_cursor();
    uint8_t cursor_y = min_cursor_y;
    uint8_t cursor_x = min_cursor_x;
    move_cursor(cursor_x, cursor_y);
    uint8_t last_joypad_state = 0;

    while (1)
    {
        uint8_t joypad_state = joypad();
        uint8_t changed = 0;

        if (joypad_state != last_joypad_state)
        {
            if (joypad_state & J_A)
            {
                uint8_t selected_option_y = (cursor_y - min_cursor_y) / cursor_y_step;
                uint8_t selected_option_x = (cursor_x - min_cursor_x) / cursor_x_step;
                return menu_options[selected_option_y][selected_option_x];
            }
            else if (joypad_state & J_UP)
            {
                cursor_y -= cursor_y_step;
                changed = 1;
            }
            else if (joypad_state & J_DOWN)
            {
                cursor_y += cursor_y_step;
                changed = 1;
            }
            else if (joypad_state & J_LEFT)
            {
                cursor_x -= cursor_x_step;
                changed = 1;
            }
            else if (joypad_state & J_RIGHT)
            {
                cursor_x += cursor_x_step;
                changed = 1;
            }

            // todo: work out how to skip the two empty spots below Z

            cursor_x = wrap_cursor(cursor_x, min_cursor_x, max_cursor_x);
            cursor_y = wrap_cursor(cursor_y, min_cursor_y, max_cursor_y);

            if (changed)
            {
                move_cursor(cursor_x, cursor_y);
            }
        }
        last_joypad_state = joypad_state;

        vsync();
    }
}