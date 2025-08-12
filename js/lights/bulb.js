import { LightSource } from './lightSource.js';
import { getOppositeDirection } from '../utils.js';

export class Bulb extends LightSource {
    illuminate() {
        const radius = 2;
        const row = Math.floor(this.cell.index / this.grid.size);
        const col = this.cell.index % this.grid.size;

        const directions = ['top', 'right', 'bottom', 'left'];
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
                    this.grid.cells[nextIndex].hasWall(getOppositeDirection(dir))
                ) continue;

                queue.push({ row: nextRow, col: nextCol, depth: depth + 1 });
            }
        }

        this.cell.toggleLightSource();
        this.cell.element.classList.add('light-source-bulb');
    }

    clear() {
        super.clear();
        this.cell.element.classList.remove('light-source-bulb');
    }
}