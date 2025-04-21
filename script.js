class Grid {
    constructor(containerId, size = 10) {
        this.container = document.getElementById(containerId);
        this.size = size;
        this.cells = [];
        this.lightSources = new Map();
        this.selectedLightType = "bulb";
        this.levelTransitionInProgress = false;
    }

    generate() {
        this.container.innerHTML = "";
        this.cells = [];

        for (let i = 0; i < this.size * this.size; i++) {
            const div = document.createElement("div");
            div.classList.add("cells");
            div.dataset.index = i;
            this.container.appendChild(div);

            const cell = new Cell(i, div);
            this.cells.push(cell);

            div.addEventListener("click", () => this.illuminateFrom(cell));
        }
    }

    addWall(index, direction) {
        this.cells[index].addWall(direction);
    }

    clearHighlights() {
        this.cells.forEach(cell => cell.clear());
    }

    removeLightSource(cell) {
        const source = this.lightSources.get(cell.index);
        if (source) {
            if (source instanceof Bulb) {
                inventory.returnBulb();
            } else if (source instanceof Flashlight) {
                inventory.returnFlashlight();
            }
            source.clear();
            this.lightSources.delete(cell.index);
        }
    }

    checkWinCondition() {
        const allCellsLit = this.cells.every(cell => cell.isLightSource || cell.illuminatedBy.size > 0);
        if (allCellsLit && !this.levelTransitionInProgress) {
            this.levelTransitionInProgress = true;
            showMessage("You win! Moving to the next level...");
            grid.container.style.pointerEvents = "none";
            setTimeout(() => this.loadNextLevel(), 5000);
        }
    }

    clearLightSources() {
        this.lightSources.forEach(source => {
            source.clear();
        });
        this.lightSources.clear();
    }

    async loadNextLevel() {
        this.levelTransitionInProgress = false;
        const nextLevelId = this.currentLevelId + 1;
        this.currentLevelId = nextLevelId;

        this.clearLightSources();

        const initialBulbs = inventory.initialBulbs || 10; // Default to 10 for the first level
        const initialFlashlights = inventory.initialFlashlights || 5; // Default to 5 for the first level

        const usedBulbs = initialBulbs - inventory.bulbs;
        const usedFlashlights = initialFlashlights - inventory.flashlights;

        inventory.addBulbs(Math.ceil(usedBulbs / 2) + 6);
        inventory.addFlashlights(Math.ceil(usedFlashlights / 2) + 3);

        inventory.initialBulbs = inventory.bulbs; // Update for the next level
        inventory.initialFlashlights = inventory.flashlights; // Update for the next level

        grid.container.style.pointerEvents = "auto";

        await loadLevel(nextLevelId);
    }

    illuminateFrom(cell) {
        const existing = this.lightSources.get(cell.index);

        if (existing instanceof Flashlight) {
            if (this.selectedLightType === "flashlight") {
                existing.rotateOrRemove();
                setTimeout(() => this.checkWinCondition(), 0);
            }
            return;
        }

        if (cell.isLightSource) {
            this.removeLightSource(cell);
            setTimeout(() => this.checkWinCondition(), 0);
            return;
        }

        let source;
        if (this.selectedLightType === "bulb") {
            if (inventory.bulbs > 0) {
                inventory.useBulb();
                source = new Bulb(cell, this);
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

        if (source) {
            source.illuminate();
            this.lightSources.set(cell.index, source);
            setTimeout(() => this.checkWinCondition(), 0);
        }

        inventory.checkGameOver();
    }

    checkPathWithWalls(fromRow, fromCol, toRow, toCol) {
        let curRow = fromRow;
        let curCol = fromCol;

        while (curRow !== toRow || curCol !== toCol) {
            const dRow = toRow > curRow ? 1 : (toRow < curRow ? -1 : 0);
            const dCol = toCol > curCol ? 1 : (toCol < curCol ? -1 : 0);

            const nextRow = curRow + dRow;
            const nextCol = curCol + dCol;

            if (nextRow < 0 || nextRow >= this.size || nextCol < 0 || nextCol >= this.size) return false;

            const currentIndex = curRow * this.size + curCol;
            const nextIndex = nextRow * this.size + nextCol;

            const direction = this.getDirection(dRow, dCol);
            const opposite = this.getOppositeDirection(direction);

            if (this.cells[currentIndex].hasWall(direction) || this.cells[nextIndex].hasWall(opposite)) {
                return false;
            }

            curRow = nextRow;
            curCol = nextCol;
        }

        return true;
    }

    getDirection(dRow, dCol) {
        if (dRow === -1 && dCol === 0) return "top";
        if (dRow === 1 && dCol === 0) return "bottom";
        if (dRow === 0 && dCol === -1) return "left";
        if (dRow === 0 && dCol === 1) return "right";
    }

    getOppositeDirection(direction) {
        const opposites = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left"
        };
        return opposites[direction];
    }
}

class Cell {
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
        this.illuminatedBy = new Set();
    }

    illuminate(source) {
        this.illuminatedBy.add(source);
        this.element.classList.add("highlight");
    }

    removeIllumination(source) {
        this.illuminatedBy.delete(source);
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove("highlight");
        }
    }

    clear() {
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove("highlight");
        }
    }

    addWall(direction) {
        this.walls[direction] = true;
        this.element.classList.add(`wall-${direction}`);
    }

    hasWall(direction) {
        return this.walls[direction];
    }

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
    constructor(cell, grid) {
        this.cell = cell;
        this.grid = grid;
        this.illuminatedCells = [];
        this.active = true;
    }

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
    illuminate() {
        const radius = 2;
        const row = Math.floor(this.cell.index / this.grid.size);
        const col = this.cell.index % this.grid.size;

        const directions = ["top", "right", "bottom", "left"];
        const deltas = {
            top: [-1, 0],
            right: [0, 1],
            bottom: [1, 0],
            left: [0, -1]
        };

        const queue = [{ row, col, depth: 0 }];
        const visited = new Set();

        while (queue.length > 0) {
            const { row, col, depth } = queue.shift();
            const index = row * this.grid.size + col;
            const currentCell = this.grid.cells[index];

            if (visited.has(index) || depth > radius) continue;
            visited.add(index);

            currentCell.illuminate(this);
            this.illuminatedCells.push(currentCell);

            for (const dir of directions) {
                const [dRow, dCol] = deltas[dir];
                const nextRow = row + dRow;
                const nextCol = col + dCol;
                const nextIndex = nextRow * this.grid.size + nextCol;

                if (
                    nextRow < 0 || nextRow >= this.grid.size ||
                    nextCol < 0 || nextCol >= this.grid.size
                ) continue;

                if (
                    currentCell.hasWall(dir) ||
                    this.grid.cells[nextIndex].hasWall(this.grid.getOppositeDirection(dir))
                ) continue;

                queue.push({ row: nextRow, col: nextCol, depth: depth + 1 });
            }
        }

        this.cell.toggleLightSource();
        this.cell.element.classList.add("light-source-bulb");
    }

    clear() {
        super.clear();
        this.cell.element.classList.remove("light-source-bulb");
    }
}

class Flashlight extends LightSource {
    constructor(cell, grid) {
        super(cell, grid);
        this.directions = ["right", "bottom", "left", "top"];
        this.currentDirectionIndex = 0;
        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();
    }

    rotateOrRemove() {
        this.clearIllumination();

        this.currentDirectionIndex++;

        if (this.currentDirectionIndex >= 4) {
            this.removeCompletely();
            return;
        }

        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();

        if (!this.cell.isLightSource) {
            this.cell.isLightSource = true;
            this.cell.element.classList.add("light-source-flashlight");
        }

        this.illuminate();
    }

    clearIllumination() {
        this.illuminatedCells.forEach(cell => {
            cell.removeIllumination(this);
        });
        this.illuminatedCells = [];
    }

    updateDirectionClass() {
        this.cell.element.classList.remove(
            "flashlight-right",
            "flashlight-bottom",
            "flashlight-left",
            "flashlight-top"
        );
        
        this.cell.element.classList.add(`flashlight-${this.direction}`);
    }

    removeCompletely() {
        this.clearIllumination();
        this.cell.clear();
        this.cell.isLightSource = false;
        this.cell.element.classList.remove("light-source-flashlight");
        this.grid.lightSources.delete(this.cell.index);
        inventory.returnFlashlight();
    }

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
                nextCol < 0 || nextCol >= this.grid.size) break;

            const nextIndex = nextRow * this.grid.size + nextCol;
            const nextCell = this.grid.cells[nextIndex];

            if (this.cell.hasWall(this.direction) || 
                nextCell.hasWall(this.grid.getOppositeDirection(this.direction))) {
                break;
            }

            nextCell.illuminate(this);
            this.illuminatedCells.push(nextCell);
        }

        if (!this.cell.isLightSource) {
            this.cell.isLightSource = true;
            this.cell.element.classList.add("light-source-flashlight");
        }
    }

    clear() {
        super.clear();
        this.cell.element.classList.remove("light-source-flashlight");
    }
}

class Inventory {
    constructor() {
        this.bulbs = 10;
        this.flashlights = 5;

        const inventoryContainer = document.getElementById("inventory");
        if (inventoryContainer) {
            inventoryContainer.remove();
        }
    }

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

        if (allCellsLit) {
            grid.checkWinCondition();
            return;
        }

        if (this.bulbs === 0 && this.flashlights === 0) {
            const lastLightSource = Array.from(grid.lightSources.values()).pop();
            if (lastLightSource) {
                lastLightSource.illuminate();
            }

            grid.container.style.pointerEvents = "none";

            showMessage("You lost! Restarting the game...");
            setTimeout(() => location.reload(), 4000); 
        }
    }
}

const inventory = new Inventory();

async function loadLevels() {
    const response = await fetch("levels.json");
    const levels = await response.json();
    return levels;
}

async function loadLevel(levelId) {
    const levels = await loadLevels();
    const level = levels.find(l => l.id === levelId);

    if (!level) {
        showMessage("No more levels! You completed the game!");
        return;
    }

    grid.clearHighlights();
    grid.generate();

    level.walls.forEach(w => grid.addWall(w.index, w.direction));
}

const grid = new Grid("grid-container", 10);
grid.generate();

grid.currentLevelId = 1;
loadLevel(grid.currentLevelId);

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

const showMessage = (msg) => {
    const container = document.getElementById("message-container");
    container.textContent = msg;
    container.style.display = "block";

    clearTimeout(container._timeout);

    container._timeout = setTimeout(() => {
        container.style.display = "none";
    }, 5000);
}

document.getElementById("bulb-btn").addEventListener("click", () => {
    grid.selectedLightType = "bulb";
});

document.getElementById("flashlight-btn").addEventListener("click", () => {
    grid.selectedLightType = "flashlight";
});

window.addEventListener('DOMContentLoaded', () => {
    const bulbBtn = document.getElementById('bulb-btn');
    bulbBtn.classList.add('selected');
});
