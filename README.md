# Glow Maze

**Glow Maze** is a browser-based puzzle game where players illuminate every corner of a grid using a limited supply of light sources (bulbs and flashlights). Test your logic and strategy by placing and rotating lights to overcome walls and dark spaces.



## Features

- **Grid-based puzzles**: 10×10 grid with walls that block light.
- **Two light types**:
  - **Bulb**: Illuminates in all directions up to a fixed radius.
  - **Flashlight**: Projects a cone-shaped beam that can be rotated.
- **Multiple levels** defined in `levels.json`.
- **Inventory limits**: Finite bulbs and flashlights per level.
- **Responsive design**: Works on desktop and mobile browsers.
- **Win/Lose conditions**: Progress to next level on win; restart on loss.



## Demo

View the live game here!

- GitHub Pages: `https://zahir-r.github.io/glow-maze/`



## Technologies

- HTML5
- CSS3 (Flexbox & Grid)
- JavaScript (ES6 Classes, Fetch API)
- JSON for level data



## Usage

1. Select a light source using the bulb or flashlight buttons.
2. Click on an empty cell to place the light:
   - **Bulb** illuminates all directions up to a radius of 2.
   - **Flashlight** illuminates in a 90° cone up to 5 cells; click again to rotate or remove.
3. Illuminate all cells to win and advance to the next level.
4. If you run out of lights before illuminating every cell, the game resets.



## Project Structure

```
glow-maze/
├── index.html       # Main HTML file
├── styles.css       # Game styling
├── script.js        # Game logic and rendering
├── levels.json      # Level definitions and walls
└── images/          # Light source icons
    ├── bulb.webp
    └── flashlight.webp
```

---

## © Copyright

© 2025 Zahir R. All rights reserved.

