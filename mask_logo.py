import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import numpy as np

img_path = 'public/assets/bras-logo-roundel-4k.png'
img = Image.open(img_path).convert("RGBA")

# Create a mask
mask = Image.new('L', img.size, 0)
draw = ImageDraw.Draw(mask)
# Draw a white circle
width, height = img.size
draw.ellipse((0, 0, width, height), fill=255)

# Convert image to numpy array
img_arr = np.array(img)
mask_arr = np.array(mask)

# Apply mask to alpha channel
img_arr[:, :, 3] = np.minimum(img_arr[:, :, 3], mask_arr)

# The generated logo might have a white border. Let's make anything outside the circle transparent.
# The ellipse already does that by masking everything outside the perfect circle.

result = Image.fromarray(img_arr)
result.save('public/assets/bras-logo-roundel-4k.png')
print("Applied circular mask to logo.")
