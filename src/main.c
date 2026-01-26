#include <gb/gb.h>
#include <stdint.h>
#include <gbdk/platform.h>
#include <gb/drawing.h>

#include "title.h"
#include "menu.h"
#include "puzzle.h"
void main(void)
{
	title_loop();
    uint8_t selected_puzzle = menu_loop();
    puzzle_loop(selected_puzzle);

    // Loop forever
    while(1) {


		// Game main loop processing goes here


		// Done processing, yield CPU and wait for start of next frame
        vsync();
    }
}
