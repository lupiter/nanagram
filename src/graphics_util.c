#include <gb/gb.h>
#include <gbdk/platform.h>
#include <gb/drawing.h>
#include "graphics_util.h"

static const palette_color_t cgb_pal_black[] = {RGB_BLACK, RGB_BLACK, RGB_BLACK, RGB_BLACK};
static const uint8_t dmg_pal_black[] = {0, 0, 0, 0};

void blank_screen(void) {
    if (_cpu == CGB_TYPE) {
        set_bkg_palette(BKGF_CGB_PAL0, CGB_ONE_PAL, cgb_pal_black);
    } else {
        BGP_REG = DMG_PALETTE(DMG_BLACK, DMG_BLACK, DMG_BLACK, DMG_BLACK);
    }
}