# Glow Maze 🧩💡

A captivating puzzle game where you strategically place light sources to illuminate an entire grid. Use bulbs and flashlights wisely to solve increasingly challenging levels!

## How to Play

- **Objective**: Illuminate every cell on the grid to complete each level
- **Light Sources**:
  - **Bulbs**: Illuminate all adjacent cells
  - **Flashlights**: Shine light in a straight line (can be rotated)
- **Controls**:
  - Click/Tap to place selected light source
  - Click/Tap on existing light sources to remove them
  - Click on flashlights to rotate them 90 degrees
- **Resources**: Manage your limited supply of bulbs and flashlights efficiently

## Features

- 🧠 10 challenging levels
- 💾 Auto-save game progress
- 📱 Responsive design
- ❓ Tutorial and help system
- ⚡ Smart inventory management with item recovery system

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Storage**: Local Storage for game state persistence
- **Design**: Custom CSS with CSS variables for theming
- **Architecture**: Modular JavaScript with ES6 modules

## Getting Started

### Prerequisites

A modern web browser with JavaScript support:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Open `index.html` in your web browser

### Playing Online

Alternatively, you can play the game online at: [Glow Maze](https://zahir-r.github.io/glow-maze/)

## Game Mechanics

### Light Propagation

- **Bulbs**: Illuminate all adjacent cells (up to 2 cells away)
- **Flashlights**: Shine light in a straight line (up to 5 cells)
- **Walls**: Block light from passing through
- **Rotation**: Flashlights can be rotated to change direction

### Inventory System

- Start with 10 bulbs and 5 flashlights
- Complete levels to earn more items:
  - 6 new bulbs + half of used bulbs returned
  - 3 new flashlights + half of used flashlights returned
- Strategic use of items is essential for progression

## Project Structure

```
glow-maze/
├── index.html          # Main HTML file
├── styles.css          # All game styles
├── js/                 # JavaScript modules
│   ├── main.js         # Game initialization
│   ├── grid.js         # Grid management
│   ├── cell.js         # Cell class definition
│   ├── lights/         # Light source classes
│   │   ├── bulb.js
│   │   ├── flashlight.js
│   │   └── lightSource.js
│   ├── inventory.js    # Inventory management
│   ├── stateManager.js # Game state persistence
│   ├── utils.js        # Utility functions
│   ├── helpMenu.js     # Tutorial system
├── levels.json         # Level definitions
└── images/             # Game assets
    ├── bulb.png
    ├── bulb-accent.png
    └── flashlight.png
```

## Browser Compatibility

This game works best on modern browsers that support:
- ES6 Modules
- CSS Grid
- CSS Variables
- Flexbox
- Local Storage API

## Contributing

We welcome contributions! Please feel free to:
1. Fork the project
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Enjoy the game! For questions or feedback, please open an issue in this repository.
