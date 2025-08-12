export class Cell {
    constructor(index, element) {
        this.index = index;
        this.element = element;
        this.walls = {
            top: false,
            right: false,
            bottom: false,
            left: false
        };
        this.isLightSource = false;
        this.illuminatedBy = new Set();
    }

    illuminate(source) {
        this.illuminatedBy.add(source);
        this.element.classList.add('highlight');
    }

    removeIllumination(source) {
        this.illuminatedBy.delete(source);
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove('highlight');
        }
    }

    clear() {
        if (this.illuminatedBy.size === 0) {
            this.element.classList.remove('highlight');
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
            this.element.classList.add('light-source');
        } else {
            this.element.classList.remove('light-source');
        }
    }
}