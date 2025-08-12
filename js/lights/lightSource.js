export class LightSource {
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