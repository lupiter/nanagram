#ifndef GRAPHICS_UTIL_H
#define GRAPHICS_UTIL_H

#include <gb/gb.h>

#define CGB_BKG_PAL_0 0u
#define CGB_ONE_PAL   1u

/**
 * Blanks the screen by setting all palette colors to black
 * Handles both CGB and DMG GameBoy types
 */
void blank_screen(void);

#endif /* GRAPHICS_UTIL_H */
