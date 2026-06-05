import PIL.Image as Image

img_path = 'public/assets/bras-logo-roundel.png'
img = Image.open(img_path)
bbox = img.getbbox()
print("Original size:", img.size)
print("Bounding box:", bbox)

# Crop to bounding box
if bbox:
    cropped = img.crop(bbox)
    print("Cropped size:", cropped.size)
    
    # Make it a square by padding
    cw, ch = cropped.size
    max_dim = max(cw, ch)
    
    # Create a transparent square canvas
    square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    # Paste the cropped image into the center
    paste_x = (max_dim - cw) // 2
    paste_y = (max_dim - ch) // 2
    square_img.paste(cropped, (paste_x, paste_y))
    
    # Scale to 4000x4000
    final_img = square_img.resize((4000, 4000), Image.Resampling.LANCZOS)
    final_img.save('public/assets/bras-logo-roundel-4k.png')
    print("Saved 4K square logo")
else:
    print("Image is empty")
