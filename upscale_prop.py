import PIL.Image as Image
import sys

def upscale_proportional():
    img_path = 'public/assets/bras-logo-roundel.png'
    try:
        img = Image.open(img_path)
        orig_w, orig_h = img.size
        
        target_h = 4000
        target_w = int(orig_w * (target_h / orig_h))
        
        new_img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        new_img.save('public/assets/bras-logo-roundel-4k.png')
        print(f"Upscaled successfully to {target_w}x{target_h}")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    upscale_proportional()
