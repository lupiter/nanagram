#ifndef PUZZLE_H
#define PUZZLE_H

#include <gb/gb.h>

/**
 * Initializes the puzzle screen by setting up the background tiles and palettes
 */
void init_puzzle(void);

/**
 * Main puzzle screen
 */
void puzzle_loop(uint8_t selected_puzzle);

#endif /* PUZZLE_H */ 