import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

cutouts_dir = 'scripts/person_cutouts'
enh_cutouts_dir = 'scripts/person_cutouts_enhanced'
os.makedirs(enh_cutouts_dir, exist_ok=True)

artifact_dir = r'C:\Users\harry\.gemini\antigravity\brain\9754c3ba-cb4b-4ac1-8811-aa749badacb5\committee_cards'
os.makedirs(artifact_dir, exist_ok=True)

bg_path = 'scripts/generic_backgrounds/bg_heritage_tavern.png'
bg_img = Image.open(bg_path).convert('RGBA')
target_size = (1200, 1200)

try:
    font_title = ImageFont.truetype('arialbd.ttf', 52)
    font_sub = ImageFont.truetype('arial.ttf', 34)
    font_era = ImageFont.truetype('arial.ttf', 26)
except:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_era = ImageFont.load_default()

def enhance_cutout(in_filename, out_filename):
    in_path = os.path.join(cutouts_dir, in_filename)
    out_path = os.path.join(enh_cutouts_dir, out_filename)
    if not os.path.exists(in_path):
        print(f"Skipping {in_filename}, not found.")
        return False
        
    rgba = Image.open(in_path).convert('RGBA')
    arr = np.array(rgba)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    
    h, w = rgb.shape[:2]
    # 2x super-sampling with Lanczos
    up_rgb = cv2.resize(rgb, (w * 2, h * 2), interpolation=cv2.INTER_LANCZOS4)
    up_alpha = cv2.resize(alpha, (w * 2, h * 2), interpolation=cv2.INTER_LANCZOS4)
    
    # Edge-preserving filter removes social media / compression blocking
    denoised = cv2.edgePreservingFilter(up_rgb, flags=cv2.RECURS_FILTER, sigma_s=35, sigma_r=0.28)
    
    # Detail enhancement to sharpen hair, eyes, clothes
    detail = cv2.detailEnhance(denoised, sigma_s=10, sigma_r=0.12)
    
    # Subtle unsharp masking for clarity
    blurred = cv2.GaussianBlur(detail, (0, 0), 1.2)
    sharpened = cv2.addWeighted(detail, 1.30, blurred, -0.30, 0)
    
    up_alpha = np.clip(up_alpha, 0, 255).astype(np.uint8)
    out = np.dstack((sharpened, up_alpha))
    Image.fromarray(out).save(out_path)
    print(f"Enhanced {in_filename} -> {out_filename} ({w*2}x{h*2})")
    return True

# Members configuration for Heritage Tavern
members_config = [
    # 1. Takara (Primary)
    {
        'id': 'takara_president',
        'raw_cutout': 'Takara_unbarred_cutout.png',
        'enh_cutout': 'Takara_unbarred_enh.png',
        'name': 'Takara Webster',
        'role': 'Society President',
        'era': '2026–Present',
        'target_h': 920,
        'y_pos': 120
    },
    # 2. Takara (Alt Fur Hat)
    {
        'id': 'takara_furhat',
        'raw_cutout': 'Takara_furhat_cutout.png',
        'enh_cutout': 'Takara_furhat_enh.png',
        'name': 'Takara Webster (Alt)',
        'role': 'Society President',
        'era': '2026–Present',
        'target_h': 920,
        'y_pos': 120
    },
    # 3. Harrison (Suit & Pint Inspector Award)
    {
        'id': 'harrison_suit',
        'raw_cutout': 'Harrison_suit_clean_cutout.png',
        'enh_cutout': 'Harrison_suit_enh.png',
        'name': 'Harrison Emrys-Jones',
        'role': 'Finance Director',
        'era': '2026–Present',
        'target_h': 860,
        'y_pos': 180
    },
    # 4. Harrison (Pub Portrait)
    {
        'id': 'harrison_pub',
        'raw_cutout': 'Harrison_meet_team_cutout.png',
        'enh_cutout': 'Harrison_pub_enh.png',
        'name': 'Harrison Emrys-Jones (Pub)',
        'role': 'Finance Director',
        'era': '2026–Present',
        'target_h': 880,
        'y_pos': 160
    },
    # 5. Rico (Harvey's Pint Portrait - Best!)
    {
        'id': 'rico_harveys',
        'raw_cutout': 'Rico_harveys_natural_cutout.png',
        'enh_cutout': 'Rico_harveys_enh.png',
        'name': 'Rico Chadwick Gugolz',
        'role': 'VP Social',
        'era': '2026–Present',
        'target_h': 880,
        'y_pos': 160
    },
    # 6. Rico (Goggles)
    {
        'id': 'rico_goggles',
        'raw_cutout': 'Rico_goggles_cutout.png',
        'enh_cutout': 'Rico_goggles_enh.png',
        'name': 'Rico Chadwick Gugolz (Goggles)',
        'role': 'VP Social',
        'era': '2026–Present',
        'target_h': 880,
        'y_pos': 150
    },
    # 7. Albie Gullis
    {
        'id': 'albie_gullis',
        'raw_cutout': 'Albie_cutout.png',
        'enh_cutout': 'Albie_enh.png',
        'name': 'Albie Gullis',
        'role': 'Society President',
        'era': '2025–2026',
        'target_h': 900,
        'y_pos': 140
    },
    # 8. Harry
    {
        'id': 'harry',
        'raw_cutout': 'Harry_cutout.png',
        'enh_cutout': 'Harry_enh.png',
        'name': 'Harry Rogers',
        'role': 'Vice President & IT Officer',
        'era': '2025–2026',
        'target_h': 870,
        'y_pos': 170
    },
    # 9. Max
    {
        'id': 'max',
        'raw_cutout': 'Max_cutout.png',
        'enh_cutout': 'Max_enh.png',
        'name': 'Max Emery',
        'role': 'Socials & Media Officer',
        'era': '2024–2026',
        'target_h': 890,
        'y_pos': 150
    },
    # 10. Sidney
    {
        'id': 'sidney',
        'raw_cutout': 'Sidney_cutout.png',
        'enh_cutout': 'Sidney_enh.png',
        'name': 'Sidney',
        'role': 'Finance Officer',
        'era': '2024–2025',
        'target_h': 880,
        'y_pos': 160
    },
    # 11. James Graham
    {
        'id': 'james_graham',
        'raw_cutout': 'James_cutout.png',
        'enh_cutout': 'James_enh.png',
        'name': 'James Graham',
        'role': 'Founding President',
        'era': '2023–2025',
        'target_h': 880,
        'y_pos': 150
    }
]

print("Starting Enhancement and Card Rendering Pipeline...")
for m in members_config:
    # 1. Enhance
    enhance_cutout(m['raw_cutout'], m['enh_cutout'])
    
    # 2. Render Card
    enh_path = os.path.join(enh_cutouts_dir, m['enh_cutout'])
    if not os.path.exists(enh_path):
        continue
        
    person = Image.open(enh_path).convert('RGBA')
    scale = m['target_h'] / float(person.height)
    new_w = int(person.width * scale)
    new_h = int(person.height * scale)
    person_scaled = person.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    x_pos = (target_size[0] - new_w) // 2
    offset = (x_pos, m['y_pos'])
    
    # Ambient shadow
    shadow = Image.new('RGBA', target_size, (0, 0, 0, 0))
    alpha_mask = person_scaled.split()[3]
    shadow_layer = Image.new('RGBA', (new_w, new_h), (0, 0, 0, 220))
    shadow_layer.putalpha(alpha_mask)
    shadow.paste(shadow_layer, (offset[0] + 4, offset[1] + 10), shadow_layer)
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    
    card = bg_img.copy()
    card.alpha_composite(shadow)
    card.paste(person_scaled, offset, person_scaled)
    
    # Bottom vignette for crisp textplate
    vignette = Image.new('RGBA', target_size, (0, 0, 0, 0))
    draw_vig = ImageDraw.Draw(vignette)
    for y in range(750, 1200):
        a = int(245 * ((y - 750) / 450.0) ** 1.3)
        draw_vig.line([(0, y), (1200, y)], fill=(12, 8, 6, a))
    card.alpha_composite(vignette)
    
    # Typography
    draw = ImageDraw.Draw(card)
    name_text = m['name']
    name_bbox = draw.textbbox((0, 0), name_text, font=font_title)
    name_w = name_bbox[2] - name_bbox[0]
    name_x = (target_size[0] - name_w) // 2
    name_y = 1010
    
    role_text = m['role']
    role_bbox = draw.textbbox((0, 0), role_text, font=font_sub)
    role_w = role_bbox[2] - role_bbox[0]
    role_x = (target_size[0] - role_w) // 2
    role_y = 1075
    
    era_text = f"Committee • {m['era']}"
    era_bbox = draw.textbbox((0, 0), era_text, font=font_era)
    era_w = era_bbox[2] - era_bbox[0]
    era_x = (target_size[0] - era_w) // 2
    era_y = 1125
    
    draw.text((name_x + 2, name_y + 2), name_text, font=font_title, fill=(0, 0, 0, 240))
    draw.text((name_x, name_y), name_text, font=font_title, fill=(255, 255, 255, 255))
    
    draw.text((role_x + 1, role_y + 1), role_text, font=font_sub, fill=(0, 0, 0, 200))
    draw.text((role_x, role_y), role_text, font=font_sub, fill=(230, 149, 0, 255))
    
    draw.text((era_x + 1, era_y + 1), era_text, font=font_era, fill=(0, 0, 0, 200))
    draw.text((era_x, era_y), era_text, font=font_era, fill=(205, 205, 205, 220))
    
    draw.rectangle([(0, 0), (target_size[0] - 1, target_size[1] - 1)], outline=(230, 149, 0, 120), width=4)
    
    out_file = f"{m['id']}.png"
    out_path = os.path.join(artifact_dir, out_file)
    card.convert('RGB').save(out_path, quality=95)
    print(f"Generated card: {out_file}")

print("All enhanced cards successfully produced!")
