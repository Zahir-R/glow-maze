import { Cell } from './cell.js';
import { Bulb } from './lights/bulb.js';
import { Flashlight } from './lights/flashlight.js';
import { inventory } from './inventory.js';
import { getOppositeDirection, showMessage, loadLevel, loadLevels } from './utils.js';
import { saveGameState } from './stateManager.js';

export class Grid {
    constructor(containerId, size=10, interactive=true) {
        this.container = document.getElementById(containerId);
        this.size = size;
        this.cells = [];
        this.lightSources = new Map();
        this.selectedLightType = 'bulb';
        this.levelTransitionInProgress = false;
        this.currentLevelId = 1;
        this.interactive = interactive;
    }

    generate() {
        this.cells.forEach(cell => {
            cell.element.replaceWith(cell.element.cloneNode(true));
        });

        this.container.innerHTML = '';
        this.cells = [];

        for (let i = 0; i < this.size * this.size; i++) {
            const div = document.createElement('div');
            div.classList.add('cells');
            div.dataset.index = i;
            this.container.appendChild(div);

            const cell = new Cell(i, div);
            this.cells.push(cell);

            if (this.interactive) {
                div.addEventListener('click', () => this.illuminateFrom(cell));
            }
        }
    }

    addWall(index, direction) {
        this.cells[index].addWall(direction);
    }

    clearHighlights() {
        this.cells.forEach(cell => {
            if (cell.illuminatedBy.size > 0) {
                cell.clear();
            }
        });
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
            this.container.style.pointerEvents = 'none';
            this.loadNextLevel();
        }
    }

    clearLightSources() {
        this.lightSources.forEach(source => {
            if (source.flashlightElement) {
                source.flashlightElement.remove();
            }
            source.clear();
        });
        this.lightSources.clear();
    }

    async loadNextLevel() {
        this.levelTransitionInProgress = false;
        const nextLevelId = this.currentLevelId + 1;
        
        const levels = await loadLevels();
        const level = levels.find(l => l.id === nextLevelId);
        if (!level) {
            showMessage('Congratulations! You completed the game!');
            return;
        }
        showMessage('You win! Moving to the next level...');

        setTimeout(() => {
            this.clearLightSources();
            this.clearHighlights();

            const initialBulbs = inventory.initialBulbs || 10;
            const initialFlashlights = inventory.initialFlashlights || 5;
            const usedBulbs = initialBulbs - inventory.bulbs;
            const usedFlashlights = initialFlashlights - inventory.flashlights;

            inventory.addBulbs(Math.ceil(usedBulbs / 2) + 6);
            inventory.addFlashlights(Math.ceil(usedFlashlights / 2) + 3);
            inventory.initialBulbs = inventory.bulbs;
            inventory.initialFlashlights = inventory.flashlights;

            this.container.style.pointerEvents = 'auto';

            this.currentLevelId = nextLevelId;
            document.querySelector('span').textContent = `Level: ${this.currentLevelId}`;
            this.generate();
            loadLevel(this, this.currentLevelId);

            const saveState = () => {
                saveGameState({
                    levelId: this.currentLevelId,
                    bulbs: inventory.bulbs,
                    flashlights: inventory.flashlights,
                    selectedLightType: this.selectedLightType
                });
            };
            saveState();
        }, 5000);
    }

    illuminateFrom(cell) {
        const existing = this.lightSources.get(cell.index);

        if (existing instanceof Flashlight) {
            if (this.selectedLightType === 'flashlight') {
                existing.rotateOrRemove();
                this.checkWinCondition();
            }
            return;
        }

        if (cell.isLightSource) {
            this.removeLightSource(cell);
            return;
        }

        let source;
        if (this.selectedLightType === 'bulb') {
            if (inventory.bulbs > 0) {
                inventory.useBulb();
                source = new Bulb(cell, this);
            } else {
                showMessage('No more bulbs left!');
                return;
            }
        } else if (this.selectedLightType === 'flashlight') {
            if (inventory.flashlights > 0) {
                inventory.useFlashlight();
                source = new Flashlight(cell, this);

            } else {
                showMessage('No more flashlights left!');
                return;
            }
        }

        if (source) {
            source.illuminate();
            this.lightSources.set(cell.index, source);
            this.checkWinCondition();
        }

        inventory.checkGameOver(this);
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
            const opposite = getOppositeDirection(direction);

            if (this.cells[currentIndex].hasWall(direction) || this.cells[nextIndex].hasWall(opposite)) {
                return false;
            }

            curRow = nextRow;
            curCol = nextCol;
        }

        return true;
    }

    getDirection(dRow, dCol) {
        if (dRow === -1 && dCol === 0) return 'top';
        if (dRow === 1 && dCol === 0) return 'bottom';
        if (dRow === 0 && dCol === -1) return 'left';
        if (dRow === 0 && dCol === 1) return 'right';
    }

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

        this.clearLightSources();
        this.clearHighlights();

        this.container.style.pointerEvents = 'auto';
    }
}