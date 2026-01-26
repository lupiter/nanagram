#
# A Makefile that compiles all .c and .s files in "src" and "res" 
# subdirectories and places the output in a "obj" subdirectory
#

# If you move this project you can change the directory 
# to match your GBDK root directory (ex: GBDK_HOME = "C:/GBDK/"
ifndef GBDK_HOME
	GBDK_HOME = /opt/gbdk/
endif

LCC = $(GBDK_HOME)bin/lcc 
PNG2ASSET = $(GBDK_HOME)bin/png2asset

# GBDK_DEBUG = ON
ifdef GBDK_DEBUG
	LCCFLAGS += -debug -v
endif

# Add directory where image gets converted into (obj/)
# So they can be included with "#include <res/somefile.h>"
LCCFLAGS += -I$(OBJDIR)

# Make the ROM CGB compatible (but not exclusive)
LCCFLAGS += -Wm-yc


# You can set the name of the .gb ROM file here
PROJECTNAME = NonogramMini

SRCDIR      = src
OBJDIR      = obj
RESOBJSRC_BG   = generated/assets/background
RESOBJSRC_SPR  = generated/assets/sprite
RESDIR      = assets
RESDIR_BG   = assets/background
RESDIR_SPR  = assets/sprite
BINDIR      = bin
MKDIRS      = $(OBJDIR) $(RESOBJSRC_BG) $(RESOBJSRC_SPR) $(BINDIR)
BINS	    = $(BINDIR)/$(PROJECTNAME).gb

# For png2asset: converting source pngs -> .c -> .o
IMGPNGS_BG     = $(foreach dir,$(RESDIR_BG),$(notdir $(wildcard $(dir)/*.png)))
IMGPNGS_SPR    = $(foreach dir,$(RESDIR_SPR),$(notdir $(wildcard $(dir)/*.png)))
IMGSOURCES_BG  = $(IMGPNGS_BG:%.png=$(RESOBJSRC_BG)/%_assets.c)
IMGSOURCES_BG_FULL  = $(IMGPNGS_BG:%.png=$(RESOBJSRC_BG)/%_assets_full.c)
IMGSOURCES_SPR = $(IMGPNGS_SPR:%.png=$(RESOBJSRC_SPR)/%_assets.c)
IMGOBJS_BG     = $(IMGSOURCES_BG:$(RESOBJSRC_BG)/%.c=$(OBJDIR)/%.o)
IMGOBJS_BG_FULL = $(IMGSOURCES_BG_FULL:$(RESOBJSRC_BG)/%.c=$(OBJDIR)/%.o)
IMGOBJS_SPR    = $(IMGSOURCES_SPR:$(RESOBJSRC_SPR)/%.c=$(OBJDIR)/%.o)

# Only include .c files from src/ directory
CSOURCES    = $(foreach dir,$(SRCDIR),$(notdir $(wildcard $(dir)/*.c)))
ASMSOURCES  = $(foreach dir,$(SRCDIR),$(notdir $(wildcard $(dir)/*.s)))
SRCOBJS     = $(CSOURCES:%.c=$(OBJDIR)/%.o) $(ASMSOURCES:%.s=$(OBJDIR)/%.o)
OBJS        = $(SRCOBJS) $(IMGOBJS_BG) $(IMGOBJS_BG_FULL) $(IMGOBJS_SPR)

all: $(BINS)

compile.bat: Makefile
	@echo "REM Automatically generated from Makefile" > compile.bat
	@make -sn | sed y/\\//\\\\/ | sed s/mkdir\ -p\/mkdir\/ | grep -v make >> compile.bat

assets: $(IMGSOURCES_BG) $(IMGSOURCES_BG_FULL) $(IMGSOURCES_SPR)

# Use png2asset to convert the map png into C formatted metasprite data
# -map                    : Use "map style" output, not metasprite
# -bpp 2                  : Use 2bpp output
# -c ...                  : Set C output file
# Convert metasprite .pngs in res/ -> .c files in obj/<platform ext>/src/
$(RESOBJSRC_BG)/%_assets.c:	$(RESDIR_BG)/%.png
	$(PNG2ASSET) $< -map -bpp 2 -c $@

# Generate the maps but also without de-duplicating the tiles
$(RESOBJSRC_BG)/%_assets_full.c:	$(RESDIR_BG)/%.png
	$(PNG2ASSET) $< -map -bpp 2 -keep_duplicate_tiles -c $@

# Use png2asset to convert the spritepng into C formatted metasprite data
# -map                    : Use "map style" output, not metasprite
# -bpp 2                  : Use 2bpp output
# -c ...                  : Set C output file
# Convert metasprite .pngs in res/ -> .c files in obj/<platform ext>/src/
$(RESOBJSRC_SPR)/%_assets.c:	$(RESDIR_SPR)/%.png
	$(PNG2ASSET) $< -bpp 2 -c $@ -spr8x8

# Compile the pngs that were converted to .c files
# .c files in obj/res/ -> .o files in obj/
$(OBJDIR)/%.o:	$(RESOBJSRC_BG)/%.c
	$(LCC) $(LCCFLAGS) $(CFLAGS) -c -o $@ $<

$(OBJDIR)/%.o:	$(RESOBJSRC_SPR)/%.c
	$(LCC) $(LCCFLAGS) $(CFLAGS) -c -o $@ $<

# Compile .c files in "src/" to .o object files
$(OBJDIR)/%.o:	$(SRCDIR)/%.c
	$(LCC) $(LCCFLAGS) -c -o $@ $<

# Compile .c files in "res/" to .o object files
$(OBJDIR)/%.o:	$(RESDIR_BG)/%.c
	$(LCC) $(LCCFLAGS) -c -o $@ $<

$(OBJDIR)/%.o:	$(RESDIR_SPR)/%.c
	$(LCC) $(LCCFLAGS) -c -o $@ $<

# Compile .s assembly files in "src/" to .o object files
$(OBJDIR)/%.o:	$(SRCDIR)/%.s
	$(LCC) $(LCCFLAGS) -c -o $@ $<

# If needed, compile .c files in "src/" to .s assembly files
# (not required if .c is compiled directly to .o)
$(OBJDIR)/%.s:	$(SRCDIR)/%.c
	$(LCC) $(LCCFLAGS) -S -o $@ $<

# Convert images first so they're available when compiling the main sources
$(OBJS):	$(IMGOBJS_BG) $(IMGOBJS_SPR)

# Link the compiled object files into a .gb ROM file
$(BINS):	$(SRCOBJS) $(IMGOBJS_BG) $(IMGOBJS_SPR)
	$(LCC) $(LCCFLAGS) -o $(BINS) $(SRCOBJS) $(IMGOBJS_BG) $(IMGOBJS_SPR)

clean:
	rm -f  $(OBJDIR)/*.*
	rm -f  $(RESOBJSRC_BG)/*.*
	rm -f  $(RESOBJSRC_SPR)/*.*

# create necessary directories after Makefile is parsed but before build
# info prevents the command from being pasted into the makefile
$(info $(shell mkdir -p $(MKDIRS)))