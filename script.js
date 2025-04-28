class Grid {
    // Constructor to initialize the grid with a container ID and size
    // Default light source is "bulb", and transition false
    constructor(containerId, size = 10) {
        this.container = document.getElementById(containerId);
        this.size = size;
        this.cells = [];
        this.lightSources = new Map(); // Map to store light sources
        this.selectedLightType = "bulb";
        this.levelTransitionInProgress = false;
    }

    generate() {
        // Clear the container and cells array
        this.container.innerHTML = "";
        this.cells = [];

        // Create the grid cells with class "cells" and index = current i (for loop)
        for (let i = 0; i < this.size * this.size; i++) {
            const div = document.createElement("div");
            div.classList.add("cells");
            div.dataset.index = i;
            this.container.appendChild(div);

            // Set the cell's index and add a click event listener to illuminate from that cell
            const cell = new Cell(i, div);
            this.cells.push(cell);

            div.addEventListener("click", () => this.illuminateFrom(cell));
        }
    }

    // Add a wall to a cell in the grid
    // The index is the cell's index in the cells array, and direction is the wall direction (top, right, bottom, left)
    addWall(index, direction) {
        // The index is the cell's index from the generate() method
        this.cells[index].addWall(direction);
    }

    // Clear the highlight class from all cells
    clearHighlights() {
        this.cells.forEach(cell => cell.clear());
    }

    removeLightSource(cell) {
        // The source is the light source at the cell's index in the LightSources map
        const source = this.lightSources.get(cell.index);
        if (source) {
            if (source instanceof Bulb) {
                inventory.returnBulb(); // Return the bulb to inventory
            } else if (source instanceof Flashlight) {
                inventory.returnFlashlight(); // Return the flashlight to inventory
            }
            source.clear(); // Clear the cell's illumination
            this.lightSources.delete(cell.index); // Deletes from the LightSources map
        }
    }

    checkWinCondition() {
        // Check if all cells are lit or are light sources
        // When cell.illuminatedBy.size > 0, it means the cell is illuminated by a light source
        const allCellsLit = this.cells.every(cell => cell.isLightSource || cell.illuminatedBy.size > 0);
        if (allCellsLit && !this.levelTransitionInProgress) {
            this.levelTransitionInProgress = true;
            showMessage("You win! Moving to the next level...");
            grid.container.style.pointerEvents = "none";
            setTimeout(() => this.loadNextLevel(), 5000);
        }
    }

    // Clear all light sources from the grid
    // This is called when the level is loaded or when the player wins
    clearLightSources() {
        this.lightSources.forEach(source => {
            source.clear();
        });
        this.lightSources.clear();
    }

    async loadNextLevel() {
        this.levelTransitionInProgress = false;
        const nextLevelId = this.currentLevelId + 1; // Increment the level ID
        this.currentLevelId = nextLevelId; // Update the current level ID
        
        // Update level counter
        levelCounter.querySelector('span').textContent = `Level: ${grid.currentLevelId}`;

        this.clearLightSources();

        const initialBulbs = inventory.initialBulbs || 10; // Default to 10 for the first level
        const initialFlashlights = inventory.initialFlashlights || 5; // Default to 5 for the first level

        const usedBulbs = initialBulbs - inventory.bulbs;
        const usedFlashlights = initialFlashlights - inventory.flashlights;

        inventory.addBulbs(Math.ceil(usedBulbs / 2) + 6); // Add 6 bulbs for the next level and half of the used bulbs
        inventory.addFlashlights(Math.ceil(usedFlashlights / 2) + 3); // Add 3 flashlights for the next level and half of the used flashlights

        inventory.initialBulbs = inventory.bulbs; // Update for the next level
        inventory.initialFlashlights = inventory.flashlights; // Update for the next level

        grid.container.style.pointerEvents = "auto"; // Enable pointer events for the grid

        await loadLevel(nextLevelId);
    }

    illuminateFrom(cell) {
        const existing = this.lightSources.get(cell.index); // Get the existing light source at the cell's index (Map lightSources)

        // If the source is a flashlight, rotate it or remove it and check wind condition
        if (existing instanceof Flashlight) {
            if (this.selectedLightType === "flashlight") {
                existing.rotateOrRemove();
                setTimeout(() => this.checkWinCondition(), 0);
            }
            return;
        }

        // If the cell is already a light source, remove it
        if (cell.isLightSource) {
            this.removeLightSource(cell);
            return;
        }

        let source;
        // If the selected light type is a bulb or flashlight, check if there are any available in the inventory
        if (this.selectedLightType === "bulb") {
            if (inventory.bulbs > 0) {
                inventory.useBulb();
                source = new Bulb(cell, this); // Create a new light source with the cell and grid, the .this refers to the grid instance
            } else {
                showMessage("No more bulbs left!");
                return;
            }
        } else if (this.selectedLightType === "flashlight") {
            if (inventory.flashlights > 0) {
                inventory.useFlashlight();
                source = new Flashlight(cell, this);

            } else {
                showMessage("No more flashlights left!");
                return;
            }
        }

        // If the source is a bulb or flashlight, illuminate the cell and check win condition
        if (source) {
            source.illuminate();
            this.lightSources.set(cell.index, source); // Add the light source to the Map lightSources (cell index and Bulb/Flashlight)
            setTimeout(() => this.checkWinCondition(), 0);
        }

        inventory.checkGameOver(); // Check if the game is over
    }

    checkPathWithWalls(fromRow, fromCol, toRow, toCol) {
        let curRow = fromRow;
        let curCol = fromCol;

        // Check if the starting and ending points are the same
        while (curRow !== toRow || curCol !== toCol) {
            const dRow = toRow > curRow ? 1 : (toRow < curRow ? -1 : 0);  // Determine the direction of the row
            const dCol = toCol > curCol ? 1 : (toCol < curCol ? -1 : 0); // Determine the direction of the column

            const nextRow = curRow + dRow;
            const nextCol = curCol + dCol;

            // Checks if the next row and column are within the grid bounds, if not return false
            if (nextRow < 0 || nextRow >= this.size || nextCol < 0 || nextCol >= this.size) return false;

            // Calculate the current and next cell indices
            // The index is the row * size + column (0-indexed)
            const currentIndex = curRow * this.size + curCol;
            const nextIndex = nextRow * this.size + nextCol;

            // Get the direction and opposite direction based on the row and column differences
            const direction = this.getDirection(dRow, dCol);
            const opposite = this.getOppositeDirection(direction);

            // If the path encounters a wall in the current or next cell, return false
            if (this.cells[currentIndex].hasWall(direction) || this.cells[nextIndex].hasWall(opposite)) {
                return false;
            }

            // Update the current row and column to the next row and column
            curRow = nextRow;
            curCol = nextCol;
        }

        return true; // No walls encountered, return true
    }

    // Get the direction based on the row and column differences
    getDirection(dRow, dCol) {
        if (dRow === -1 && dCol === 0) return "top";
        if (dRow === 1 && dCol === 0) return "bottom";
        if (dRow === 0 && dCol === -1) return "left";
        if (dRow === 0 && dCol === 1) return "right";
    }

    // Get the opposite direction based on the current direction
    // The direction is based on the getDirection() method
    getOppositeDirection(direction) {
        const opposites = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left"
        };
        return opposites[direction];
    }

    // Iterate through every light source, if a bulb is encountered, return it, if a flashlight is encountered, return it
    reloadLevel() {
        this.lightSources.forEach(source => {
            if (source instanceof Bulb) {
                inventory.returnBulb();
            } else if (source instanceof Flashlight) {
                inventory.returnFlashlight();
                if (source.flashlightElement) {
                    source.flashlightElement.remove();
                }
            }
        });

        // Clears the grid
        this.clearLightSources();
        this.clearHighlights();

        // Sets the event listeners
        grid.container.style.pointerEvents = 'auto';
    }
}

class Cell {
    // Constructor to initialize the cell with an index and element
    // The walls are initialized to false (no walls) and isLightSource is false (not a light source)
    constructor(index, element) {
        this.index = index;
        this.element = element;
        this.walls = {
            top: false,
            right: false,
            bottom: false,
            left: false,
        };
        this.isLightSource = false;
        this.illuminatedBy = new Set();  // Set to store the light sources illuminating this cell
    }

    // Add class "highlight" to the cell element when illuminated by a light source
    illuminate(source) {
        this.illuminatedBy.add(source);
        this.element.classList.add("highlight");
    }

    // When the light source is removed, remove the "highlight" class from the cell element and set its size to 0 (no light source)
    removeIllumination(source) {
        this.illuminatedBy.delete(source);
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove("highlight");
        }
    }

    // Removes class "highlight" when there is no light source illuminating the cell
    clear() {
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove("highlight");
        }
    }

    // Add a wall to the cell in the specified direction (top, right, bottom, left)
    addWall(direction) {
        this.walls[direction] = true;
        this.element.classList.add(`wall-${direction}`);
    }

    // Check if the cell has a wall in the specified direction
    hasWall(direction) {
        return this.walls[direction];
    }

    // Flag the cell as a light source
    // It works like a switch to toggle the light source on and off
    toggleLightSource() {
        this.isLightSource = !this.isLightSource;
        if (this.isLightSource) {
            this.element.classList.add("light-source");
        } else {
            this.element.classList.remove("light-source");
        }
    }
}

class LightSource {
    // Constructor to initialize the light source with a cell and grid
    // The illuminatedCells array stores the cells illuminated by this light source
    constructor(cell, grid) {
        this.cell = cell;
        this.grid = grid;
        this.illuminatedCells = [];
        this.active = true; // Flag to indicate if the light source is active
    }

    // Clear the light source and remove the illumination from all illuminated cells
    clear() {
        this.illuminatedCells.forEach(c => {
            c.removeIllumination(this);
        });
        this.illuminatedCells = [];
        this.cell.toggleLightSource();
        this.active = false;
    }
}

class Bulb extends LightSource {
    // Inherits from LightSource class
    illuminate() {
        const radius = 2; // Two cells for each direction
        const row = Math.floor(this.cell.index / this.grid.size); // Calculate the row index based on the cell's index
        const col = this.cell.index % this.grid.size; // Calculate the column index based on the cell's index

        const directions = ["top", "right", "bottom", "left"];
        // Deltas for each direction (top, right, bottom, left)
        // The deltas are used to calculate the next cell's row and column based on the current cell's row and column
        const deltas = {
            top: [-1, 0],
            right: [0, 1],
            bottom: [1, 0],
            left: [0, -1]
        };

        // BFS queue to explore the grid
        // The queue stores the current cell's row, column, and depth (distance from the light source)
        const queue = [{ row, col, depth: 0 }];
        // Set to keep track of visited cells to avoid revisiting them
        const visited = new Set();

        while (queue.length > 0) {
            const { row, col, depth } = queue.shift(); // Dequeue the first element
            // Calculate the index of the current cell based on its row and column
            const index = row * this.grid.size + col;
            const currentCell = this.grid.cells[index];

            // Check if the current cell is out of bounds or already visited
            if (visited.has(index) || depth > radius) continue;
            visited.add(index);

            currentCell.illuminate(this);  // Iluminate the current cell
            this.illuminatedCells.push(currentCell); // The current cell is added to the illuminatedCells array

            for (const dir of directions) {
                const [dRow, dCol] = deltas[dir]; // Converts the 2D direction to 1D deltas
                const nextRow = row + dRow; // Logic to calculate the next row based on the current row and direction
                const nextCol = col + dCol;
                const nextIndex = nextRow * this.grid.size + nextCol;

                // Check if the next cell is out of bounds
                // If the next cell is out of bounds, continue to the next iteration
                if (
                    nextRow < 0 || nextRow >= this.grid.size ||
                    nextCol < 0 || nextCol >= this.grid.size
                ) continue;

                // Check if the next cell has a wall
                // If there is a wall, continue to the next iteration
                if (
                    currentCell.hasWall(dir) ||
                    this.grid.cells[nextIndex].hasWall(this.grid.getOppositeDirection(dir))
                ) continue;

                // If the next cell is not out of bounds and does not have a wall, add it to the queue
                // The depth is incremented by 1 to indicate the distance from the light source
                queue.push({ row: nextRow, col: nextCol, depth: depth + 1 });
            }
        }

        // Adds the light source class to the cell
        this.cell.toggleLightSource();
        this.cell.element.classList.add("light-source-bulb");
    }

    clear() {
        // Calls clear from LightSource class to remove the illumination from all illuminated cells
        super.clear();
        this.cell.element.classList.remove("light-source-bulb");
    }
}

class Flashlight extends LightSource {
    constructor(cell, grid) {
        super(cell, grid);
        this.directions = ["right", "bottom", "left", "top"];
        this.currentDirectionIndex = 0; // Points to the right initially
        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();

        // Create a child element for the flashlight
        this.flashlightElement = document.createElement("div");
        this.flashlightElement.classList.add("flashlight-icon");
        this.cell.element.appendChild(this.flashlightElement);

        this.updateDirectionClass();
    }

    rotateOrRemove() {
        // Clears the current illumination and rotates the flashlight to the next direction
        this.clearIllumination();

        // Switches to the next direction
        this.currentDirectionIndex++;

        // Rotate the flashlight image by 90 degrees
        const rotationAngle = this.currentDirectionIndex * 90;
        this.flashlightElement.style.transform = `rotate(${rotationAngle}deg)`;

        // When the flashlight reaches the end of the directions array, it removes it
        if (this.currentDirectionIndex >= 4) {
            this.removeCompletely();
            return;
        }

        // Updates the direction to face the current direction of the flashlight
        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();
    
        this.illuminate();
    }

    clearIllumination() {
        // Clears the illumination from all illuminated cells
        this.illuminatedCells.forEach(cell => {
            cell.removeIllumination(this);
        });
        this.illuminatedCells = [];
    }

    // Updates the direction class of the cell and removes the previous direction class
    updateDirectionClass() {
        this.cell.element.classList.remove(
            "flashlight-right",
            "flashlight-bottom",
            "flashlight-left",
            "flashlight-top"
        );
        
        this.cell.element.classList.add(`flashlight-${this.direction}`);
    }

    // Removes the flashlight and clears the illumination from all cells.
    removeCompletely() {
        this.clearIllumination();
        this.cell.clear();
        this.cell.isLightSource = false;
        this.cell.element.classList.remove("light-source-flashlight");
        this.flashlightElement.remove();
        this.grid.lightSources.delete(this.cell.index);
        inventory.returnFlashlight();
    }

    // The illuminate method is similar to the bulb's illuminate method, but it only illuminates in the current direction of the flashlight
    illuminate() {
        const range = 5;
        const deltas = {
            top: [-1, 0],
            right: [0, 1],
            bottom: [1, 0],
            left: [0, -1]
        };

        let row = Math.floor(this.cell.index / this.grid.size);
        let col = this.cell.index % this.grid.size;
        const [dRow, dCol] = deltas[this.direction];

        for (let i = 1; i <= range; i++) {
            const nextRow = row + dRow * i;
            const nextCol = col + dCol * i;

            if (nextRow < 0 || nextRow >= this.grid.size || 
                nextCol < 0 || nextCol >= this.grid.size) break; // If the next cell is out of bounds, break the loop

            const nextIndex = nextRow * this.grid.size + nextCol;
            const nextCell = this.grid.cells[nextIndex];  // Gets the next cell based on the next index

            // If the next cell has a wall in the current direction, break the loop
            if (this.cell.hasWall(this.direction) || 
                nextCell.hasWall(this.grid.getOppositeDirection(this.direction))) {
                break;
            }

            nextCell.illuminate(this);
            this.illuminatedCells.push(nextCell);  // Adds the next cell to the illuminatedCells array
        }

        // Checks if the cell is not a light source, if true, it adds the class "light-source-flashlight" to the cell
        if (!this.cell.isLightSource) {
            this.cell.isLightSource = true;
            this.cell.element.classList.add("light-source-flashlight");
        }
    }

    // Clears the flashlight and removes the illumination from all illuminated cells
    clear() {
        super.clear();
        this.cell.element.classList.remove("light-source-flashlight");
    }
}

class Inventory {
    constructor() {
        this.bulbs = 10;  // Default bulbs
        this.flashlights = 5;  // Default flashlights

        const inventoryContainer = document.getElementById("inventory");
        // If inventoryContainer is true, it means the inventory is already created, so it removes it
        if (inventoryContainer) {
            inventoryContainer.remove();
        }
    }

    // When the user uses a bulb or flashlight, it decrements the count and updates the UI
    useBulb() {
        if (this.bulbs > 0) {
            this.bulbs--;
            this.updateUI();
        } 
    }

    useFlashlight() {
        if (this.flashlights > 0) {
            this.flashlights--;
            this.updateUI();
        }
    }

    // When the user gets a bulb or flashlight, it increments the count and updates the UI
    addBulbs(amount) {
        this.bulbs += amount;
        this.updateUI();
    }

    addFlashlights(amount) {
        this.flashlights += amount;
        this.updateUI();
    }

    returnBulb() {
        this.bulbs++;
        this.updateUI();
    }

    returnFlashlight() {
        this.flashlights++;
        this.updateUI();
    }

    updateUI() {
        document.getElementById("bulb-count").textContent = `${this.bulbs}`;
        document.getElementById("flashlight-count").textContent = `${this.flashlights}`;
    }

    checkGameOver() {
        const allCellsLit = grid.cells.every(cell => cell.isLightSource || cell.illuminatedBy.size > 0);

        // Check if all cells are lit or are light sources
        if (allCellsLit) {
            grid.checkWinCondition();
            return;
        }

        // Check if the player has no bulbs or flashlights left
        if (this.bulbs === 0 && this.flashlights === 0) {
            showMessage("You are out of items! Open the ☰ menu to  restart the level or the game.");
        }
    }
}

const inventory = new Inventory();

async function loadLevels() {
    // Awaits the fetch request to get the levels.json file
    const response = await fetch("levels.json");
    const levels = await response.json();
    return levels;
}

async function loadLevel(levelId) {
    // Loads the levels from the JSON file
    const levels = await loadLevels();
    const level = levels.find(l => l.id === levelId);   // Finds the level with the specified ID

    // If no level is found
    if (!level) {
        showMessage("No more levels! You completed the game!");
        return;
    }

    grid.clearHighlights();
    grid.generate();

    // Add walls to the grid based on the level data
    level.walls.forEach(w => grid.addWall(w.index, w.direction));
}

const grid = new Grid("grid-container", 10);
grid.generate();

grid.currentLevelId = 1;

const levelCounter = document.getElementById('level-counter');
levelCounter.innerHTML = `
    <span>Level: ${grid.currentLevelId}</span>
    <div id="options-menu" class="options-menu">
        <div class="top-row"></div>
        <div class="middle-row"></div>
        <div class="bottom-row"></div>
    </div>
    <div class="help-menu"><p>?</p></div>
`;

loadLevel(grid.currentLevelId);

document.getElementById('options-menu').addEventListener('click', () => {
    document.getElementById('alpha').style = 'block';
    document.getElementById('menu').style = 'block';
});

document.getElementById('restart-level').addEventListener('click', () => {
    document.getElementById('alpha').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
    grid.reloadLevel();
});

document.getElementById('restart-game').addEventListener('click', () => {
    document.getElementById('alpha').style.display = 'none';
    document.getElementById('menu').style.display = 'none';

    inventory.bulbs = 10;
    inventory.flashlights = 5;
    inventory.updateUI();

    grid.currentLevelId = 1;
    grid.clearLightSources();
    grid.clearHighlights();
    grid.generate();
    loadLevel(grid.currentLevelId); 

    // Reset the level counter without overwriting the menu
    const levelCounter = document.getElementById('level-counter');
    levelCounter.querySelector('span').textContent = `Level: ${grid.currentLevelId}`;
});

document.getElementById('close-menu').addEventListener('click', () => {
    document.getElementById('alpha').style.display = 'none';
    document.getElementById('menu').style.display = 'none';
});

// Add event listeners to the bulb and flashlight buttons
const bulbBtn = document.getElementById('bulb-btn');
const flashlightBtn = document.getElementById('flashlight-btn');

bulbBtn.addEventListener('click', () => {
    bulbBtn.classList.add('selected');
    flashlightBtn.classList.remove('selected');
});

flashlightBtn.addEventListener('click', () => {
    flashlightBtn.classList.add('selected');
    bulbBtn.classList.remove('selected');
});

// Show message function to display messages to the user
const showMessage = (msg) => {
    const container = document.getElementById("message-container");
    container.textContent = msg;
    container.style.display = "block";

    clearTimeout(container._timeout);

    container._timeout = setTimeout(() => {
        container.style.display = "none";
    }, 5000);
}

// When the user clicks on the bulb button, it sets the selected light type to "bulb"
document.getElementById("bulb-btn").addEventListener("click", () => {
    grid.selectedLightType = "bulb";
});

// When the user clicks on the flashlight button, it sets the selected light type to "flashlight"
document.getElementById("flashlight-btn").addEventListener("click", () => {
    grid.selectedLightType = "flashlight";
});

// When the page loads, it sets the selected light type to "bulb" by default
window.addEventListener('DOMContentLoaded', () => {
    const bulbBtn = document.getElementById('bulb-btn');
    bulbBtn.classList.add('selected');
});
