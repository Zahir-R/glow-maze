import { LightSource } from './lightSource.js';
import { getOppositeDirection } from '../utils.js';
import { inventory } from '../inventory.js';

export class Flashlight extends LightSource {
    constructor(cell, grid) {
        super(cell, grid);
        this.type = 'flashlight';
        this.directions = ['right', 'bottom', 'left', 'top'];
        this.currentDirectionIndex = 0;
        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();

        this.flashlightElement = document.createElement('div');
        this.flashlightElement.classList.add('flashlight-icon');
        this.cell.element.appendChild(this.flashlightElement);

        this.updateDirectionClass();
    }

    rotateOrRemove() {
        this.clearIllumination();
        this.currentDirectionIndex++;

        const rotationAngle = this.currentDirectionIndex * 90;
        this.flashlightElement.style.transform = `rotate(${rotationAngle}deg)`;

        if (this.currentDirectionIndex >= 4) {
            this.removeCompletely();
            return;
        }

        this.direction = this.directions[this.currentDirectionIndex];
        this.updateDirectionClass();
    
        this.illuminate();
    }

    setDirection(index) {
        this.currentDirectionIndex = index;
        this.direction = this.directions[index];
        this.updateDirectionClass();

        const rotationAngle = this.currentDirectionIndex * 90;
        if (this.flashlightElement) {
            this.flashlightElement.style.transform = (`rotate(${rotationAngle}deg)`);
        }
    }

    clearIllumination() {
        this.illuminatedCells.forEach(cell => {
            cell.removeIllumination(this);
        });
        this.illuminatedCells = [];
    }

    updateDirectionClass() {
        this.cell.element.classList.remove(
            'flashlight-right',
            'flashlight-bottom',
            'flashlight-left',
            'flashlight-top'
        );
        
        this.cell.element.classList.add(`flashlight-${this.direction}`);
    }

    removeCompletely() {
        this.clearIllumination();
        this.cell.clear();
        this.cell.isLightSource = false;
        this.cell.element.classList.remove('light-source-flashlight');
        this.flashlightElement.remove();
        this.grid.lightSources.delete(this.cell.index);
        if (this.grid.interactive) inventory.returnFlashlight();
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
                nextCell.hasWall(getOppositeDirection(this.direction))) {
                break;
            }

            nextCell.illuminate(this);
            this.illuminatedCells.push(nextCell);
        }

        if (!this.cell.isLightSource) {
            this.cell.isLightSource = true;
            this.cell.element.classList.add('light-source-flashlight');
        }
    }

    clear() {
        super.clear();
        this.cell.element.classList.remove('light-source-flashlight');
    }
}