import PIL.Image as Image
import sys

def upscale():
    img_path = 'public/assets/bras-logo-roundel.png'
    try:
        img = Image.open(img_path)
        # upscale to 4000x4000
        new_img = img.resize((4000, 4000), Image.Resampling.LANCZOS)
        new_img.save('public/assets/bras-logo-roundel-4k.png')
        print("Upscaled successfully to 4000x4000")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    upscale()
