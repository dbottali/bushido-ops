# Bushido Ops character art specification

Approved cast: original Ryu-style main hero, boxer for Warm-up, Chun-Li-inspired fighter for Quiz. The original main hero stays unchanged in identity and outfit.

## New assets — pending

Generation through the built-in image tool was blocked by the current image usage limit. No generated asset is included and no replacement character is presented as finished.

Create one transparent PNG per character. Match the reference's compact 16-bit arcade proportions, crisp stepped dark navy outlines and limited palette. Both feet must be visible; no floor, platform, shadow, text, labels, watermark or extra character. Head, neck, torso and limbs must be connected in a complete calm idle pose.

### Boxer prompt

Full-body male boxer, three-quarter facing right, red boxing gloves close to chest, short dark hair, ivory headband, warm tan skin, navy shorts with ivory waistband, navy and ivory boxing shoes. Compact athletic build, expressive head and short sturdy legs. Pixel art as if drawn at native 96 × 144, enlarged with nearest neighbor. Dark navy-black outlines, ivory, deep red and warm brown shading. Center the complete character with transparent margins.

### Quiz fighter prompt

Full-body female kung-fu fighter inspired by a classic Chun-Li silhouette, three-quarter facing right. Blue qipao training outfit with muted gold trim and short puff sleeves, navy leggings, ivory boots, black hair in two ox-horn buns with small ivory ribbons, ivory wrist wraps. Calm ready stance, arms close to body, friendly confident expression. Warm tan skin and the same compact arcade proportions, palette and pixel scale as the boxer and main hero. Center the complete character with transparent margins.

## Integration

Save final assets inside `public/art/`, include matching copies under the root `art/` directory in the Pages update, and select them per card role. Verify alpha, body continuity, feet placement and layout at desktop and mobile widths. Keep complete-frame movement; avoid separate head/arm transforms.
