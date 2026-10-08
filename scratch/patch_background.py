import os
from PIL import Image, ImageFilter, ImageDraw

def reconstruct_background():
    src_path = 'public/assets/intro_background.jpg'
    img = Image.open(src_path).convert('RGB')
    w, h = img.size

    # The logo region is roughly x in [320, 704], y in [10, 225]
    # We will interpolate the sky gradient horizontally from left (x=300) to right (x=724)
    # and blend softly into the mountain ridge at the bottom of the logo (y=160..230)

    reconstructed = img.copy()
    draw = ImageDraw.Draw(reconstructed)

    # For each pixel (x, y) in the logo bounding area:
    # Blend left sky sample and right sky sample
    x_min, x_max = 330, 694
    y_min, y_max = 15, 220

    # 1. Sky reconstruction (y from 15 to 150)
    for y in range(y_min, 155):
        # Sample left and right pixels
        left_c = img.getpixel((x_min - 15, y))
        right_c = img.getpixel((x_max + 15, y))
        
        for x in range(x_min - 10, x_max + 11):
            factor = (x - (x_min - 10)) / float((x_max + 10) - (x_min - 10))
            # Smooth cubic easing
            t = factor * factor * (3 - 2 * factor)
            r = int(left_c[0] * (1 - t) + right_c[0] * t)
            g = int(left_c[1] * (1 - t) + right_c[1] * t)
            b = int(left_c[2] * (1 - t) + right_c[2] * t)
            reconstructed.putpixel((x, y), (r, g, b))

    # 2. Mountain/Hilltop Ridge & Canopy reconstruction (y from 150 to 220)
    for y in range(150, y_max + 5):
        left_c = img.getpixel((x_min - 20, y))
        right_c = img.getpixel((x_max + 20, y))
        for x in range(x_min - 15, x_max + 16):
            factor = (x - (x_min - 15)) / float((x_max + 15) - (x_min - 15))
            t = factor * factor * (3 - 2 * factor)
            r = int(left_c[0] * (1 - t) + right_c[0] * t)
            g = int(left_c[1] * (1 - t) + right_c[1] * t)
            b = int(left_c[2] * (1 - t) + right_c[2] * t)
            reconstructed.putpixel((x, y), (r, g, b))

    # 3. Create a soft feathered mask for the patched region
    mask = Image.new('L', (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    # Draw rounded ellipse covering the logo region
    mask_draw.rounded_rectangle([x_min - 8, y_min - 5, x_max + 8, y_max + 5], radius=35, fill=255)
    # Blur mask for seamless feathered edge transition
    blurred_mask = mask.filter(ImageFilter.GaussianBlur(radius=14))

    # Composite original image and reconstructed patch using the feathered mask
    final_img = Image.composite(reconstructed, img, blurred_mask)

    # Save output
    out_path = 'public/assets/intro_background_clean.jpg'
    final_img.save(out_path, quality=98)
    print(f'Saved clean background to {out_path}')

if __name__ == '__main__':
    reconstruct_background()
