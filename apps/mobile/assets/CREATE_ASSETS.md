# Creating Assets for LiftGraph

This guide will help you create the required image assets for the LiftGraph app.

## Required Assets

You need to create 4 image files in this directory:

### 1. icon.png
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Purpose:** App icon shown on home screen
- **Requirements:** 
  - Square image
  - No transparency
  - Should represent the app brand

### 2. splash.png
- **Size:** 1284x2778 pixels (iPhone 14 Pro Max size)
- **Format:** PNG
- **Purpose:** Splash screen shown when app launches
- **Requirements:**
  - Can have transparency
  - Should match app theme
  - Keep important content in center

### 3. adaptive-icon.png
- **Size:** 512x512 pixels
- **Format:** PNG
- **Purpose:** Android adaptive icon foreground
- **Requirements:**
  - Must have transparent background
  - Keep icon within center 66x66% safe area
  - Outer edges may be cropped

### 4. favicon.png
- **Size:** 48x48 pixels (minimum)
- **Format:** PNG
- **Purpose:** Web favicon
- **Requirements:**
  - Simple, recognizable at small size
  - Usually a simplified version of main icon

## Quick Creation Methods

### Option 1: Design Tools (Recommended)
Use tools like:
- **Figma** (free, web-based)
- **Canva** (free, templates available)
- **Adobe Illustrator** (professional)
- **Sketch** (Mac only)

### Option 2: Online Generators
1. **Icon Kitchen** (https://icon.kitchen/)
   - Upload a simple image
   - Automatically generates all sizes

2. **App Icon Generator** (https://www.appicon.co/)
   - Upload one image
   - Downloads all required sizes

### Option 3: Placeholder Images
For quick testing, create simple colored squares with text:

**Using ImageMagick (if installed):**
```bash
# Icon (1024x1024)
convert -size 1024x1024 xc:'#FF5722' \
  -gravity center -pointsize 200 -fill white \
  -annotate +0+0 'LG' icon.png

# Splash (1284x2778)
convert -size 1284x2778 xc:'#FFFFFF' \
  -gravity center -pointsize 300 -fill '#FF5722' \
  -annotate +0+0 'LiftGraph' splash.png

# Adaptive Icon (512x512)
convert -size 512x512 xc:none \
  -gravity center -pointsize 120 -fill '#FF5722' \
  -annotate +0+0 'LG' adaptive-icon.png

# Favicon (48x48)
convert -size 48x48 xc:'#FF5722' \
  -gravity center -pointsize 32 -fill white \
  -annotate +0+0 'L' favicon.png
```

**Using Python with PIL (if installed):**
```python
from PIL import Image, ImageDraw, ImageFont

# Icon
img = Image.new('RGB', (1024, 1024), color='#FF5722')
draw = ImageDraw.Draw(img)
# Add text/graphics here
img.save('icon.png')
```

### Option 4: Use Expo Default Assets
For development only, you can temporarily skip creating assets. The app might show warnings but will still run.

## Design Suggestions for LiftGraph

### Color Scheme
- **Primary:** #FF5722 (Deep Orange - represents strength/energy)
- **Background:** #FFFFFF (White - clean, professional)
- **Accent:** Black or dark gray for text

### Icon Ideas
1. **Barbell Icon**
   - Simple barbell silhouette
   - Olympic weightlifting bar
   - Minimalist design

2. **Graph with Weights**
   - Upward trending graph
   - Combined with dumbbell or barbell
   - Shows "progress" concept

3. **Letter LG**
   - Stylized initials
   - Bold, strong typography
   - Simple and recognizable

4. **Minimalist**
   - Single weight plate
   - Simple geometric shapes
   - Professional and clean

### Example Specs
```
Icon: White barbell on orange (#FF5722) background
Splash: White background, orange "LiftGraph" text, small barbell graphic
Adaptive Icon: Orange "LG" on transparent background
Favicon: Simplified version of main icon
```

## Verification

After creating assets, verify:
1. ✓ All files are in `/apps/mobile/assets/` directory
2. ✓ Correct file names (exact match required)
3. ✓ Correct dimensions
4. ✓ PNG format
5. ✓ Not corrupted (can open in image viewer)

## Testing

After adding assets:
```bash
# Clear cache and restart
cd liftGraph
yarn mobile:start --clear
```

The app should now:
- Show your icon in Expo Go
- Display custom splash screen on launch
- Use your favicon for web builds

## Resources

- [Expo Icon Requirements](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screen](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [Material Design Icons](https://material.io/design/iconography)
- [Flaticon](https://www.flaticon.com/) - Free icon resources

## Need Help?

If you're stuck:
1. Use an online generator (easiest)
2. Ask a designer friend
3. Use simple placeholder colors for now
4. The app works without perfect assets during development!

---

**Pro Tip:** Start with simple placeholders to test the app, then refine your assets as the app develops. Perfect icons can come later!

