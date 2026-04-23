# NES Platformer Project

## Project Structure
- `nes-platformer.html` - Complete single-file game (HTML5 Canvas + Vanilla JS)

## Development Commands
- **Test**: Open `nes-platformer.html` in any modern browser
- **Debug**: Use browser dev tools; debug info displayed in top-left corner
- **No build step**: Pure HTML/JS, edit and refresh

## Technical Details
- **Resolution**: 256x240 (NES standard)
- **Physics**: 
  - Gravity: -0.7 px/frame²
  - Jump: 4.0 px/frame initial velocity
  - Max speed: 2.5 px/frame
  - Acceleration: 0.09 px/frame²
  - Variable jump: Release early cuts velocity by 40%
- **Controls**: Arrow keys (move), Z (jump)
- **Collision**: AABB with 16x16 tile grid

## Level Data
- Arrays in JS: `level[y][x]` where 1=solid, 0=empty
- Modify directly in source to edit level
- Ground starts at y=13 (208px from top)

## Sprite Rendering
- Player: 16x32 red rectangle (placeholder)
- Blocks: 16x16 brown rectangles
- All rendered via Canvas API, no external assets

## Notes
- No dependencies, works offline
- Mobile touch controls not implemented
- Audio not implemented
- For educational purposes only - original artwork