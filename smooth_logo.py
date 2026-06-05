import PIL.Image as Image
import PIL.ImageFilter as ImageFilter

img_path = 'public/assets/bras-logo-roundel.png'
img = Image.open(img_path)
bbox = img.getbbox()

if bbox:
    cropped = img.crop(bbox)
    
    # Make it a perfect square without resizing
    cw, ch = cropped.size
    max_dim = max(cw, ch)
    
    square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    paste_x = (max_dim - cw) // 2
    paste_y = (max_dim - ch) // 2
    square_img.paste(cropped, (paste_x, paste_y))
    
    # Save the native resolution image (no mathematical upscaling artifacts)
    # We apply a very subtle smoothing filter to fix any jagged edges from the original
    smooth_img = square_img.filter(ImageFilter.SMOOTH)
    smooth_img.save('public/assets/bras-logo-roundel-4k.png')
    
    print(f"Saved smoothed, native resolution logo at {max_dim}x{max_dim}")
else:
    print("Image is empty")
