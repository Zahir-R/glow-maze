import { showMessage } from "./utils.js";

export class Inventory {
    constructor() {
        this.bulbs = 10;
        this.flashlights = 5;
        const inventoryContainer = document.getElementById('inventory');
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
        document.getElementById('bulb-count').textContent = `${this.bulbs}`;
        document.getElementById('flashlight-count').textContent = `${this.flashlights}`;
    }

    checkGameOver(grid) {
        const allCellsLit = grid.cells.every(cell => cell.isLightSource || cell.illuminatedBy.size > 0);

        if (allCellsLit) {
            grid.checkWinCondition();
            return;
        }

        if (this.bulbs === 0 && this.flashlights === 0) {
            showMessage('You are out of items! Open the ☰ menu to  restart the level or the game.');
        }
    }
}

export const inventory = new Inventory();