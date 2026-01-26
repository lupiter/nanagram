from PIL import Image

def main():
    image = Image.open("../assets/background/puzzle_15.png")
    print(f"Image size: {image.size}")
    width, height = image.size
    
    # Convert image to RGB if it isn't already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Set to store unique 8x8 blocks
    unique_blocks = set()
    
    # Iterate through the image in 8x8 blocks
    for y in range(0, height - 7, 8):
        for x in range(0, width - 7, 8):
            # Get the 8x8 block
            block = image.crop((x, y, x + 8, y + 8))
            # Convert block to a tuple of pixel values for comparison
            block_data = tuple(block.getdata())
            unique_blocks.add(block_data)
    
    print(f"Number of unique 8x8 blocks: {len(unique_blocks)}")

if __name__ == "__main__":
    main()
