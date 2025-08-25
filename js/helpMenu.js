import { Grid } from "./grid.js";
import { Bulb } from "./lights/bulb.js";
import { Flashlight } from "./lights/flashlight.js";
import { loadLevel } from "./utils.js";

class HelpModal {
    constructor() {
        this.modal = document.getElementById('help-modal');
        this.gridContainer = document.getElementById('help-grid-container');
        this.slideExplanation = document.getElementById('slide-explanation');
        this.prevBtn = document.querySelector('.prev-slide');
        this.nextBtn = document.querySelector('.next-slide');
        this.closeBtn = document.querySelector('.close-modal');
        this.dots = document.querySelectorAll('.dot');
    
        this.currentSlide = 0;
        this.helpGrid = null;
        this.animationTimers = [];
        this.isHelpOpen = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.prevBtn.addEventListener('click', () => {
            if (this.currentSlide === 0) {
                this.showSlide(2);
            } else {
                this.showSlide(this.currentSlide - 1);
            }
        });
        this.nextBtn.addEventListener('click', () => {
            if (this.currentSlide === 2) {
                this.showSlide(0);
            } else {
                this.showSlide(this.currentSlide + 1);
            }
        });

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.showSlide(index));
        });
    }

    open() {
        this.isHelpOpen = true;
        this.modal.style.display = 'block';
        this.showSlide(0);
    }

    close() {
        this.isHelpOpen = false;
        this.modal.style.display = 'none';
        this.clearAnimations();
        if (this.helpGrid) {
            this.helpGrid.container.innerHTML = '';
        }
    }

    showSlide(slideIndex) {
        this.clearAnimations();
        if (slideIndex < 0) slideIndex = 2;
        if (slideIndex > 2) slideIndex = 0;
        this.currentSlide = slideIndex;

        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === slideIndex);
        });
        this.gridContainer.innerHTML = '';

        if (slideIndex === 0) {
            this.slideExplanation.innerHTML = `
            <h3>Light Sources</h3>
            <p>• Bulbs illuminate all adjacent cells around them</p>
            <p>• Flashlights shine in a straight line</p>
            <p>• Click flashlights to rotate them</p>
            <p>• Tap or click on objects to remove them</p>
            `;
            this.initLightSourcesDemo();
        } else if (slideIndex === 1) {
            this.slideExplanation.innerHTML = `
            <h3>Walls & Obstacles</h3>
            <p>• Walls block light from passing through</p>
            <p>• Plan your light placement carefully</p>
            <p>• Flashlights can shine through openings</p>
            <p>• Light doesn't pass through corners</p>
            `;
            this.initWallsDemo();
        } else if (slideIndex === 2) {
            this.slideExplanation.innerHTML = `
            <h3>Items</h3>
            <p>• Every completed level will grant you 8 light bulbs and 4 flashlights</p>
            <p>• After level completion, half of the used items are returned to your inventory</p>
            <p>• Use your items wisely, as they are limited!</p>
            <p>• For example, this grid uses 9 light bulbs, and 4 flashlights, then the recovery would be: <br> 9 / 2 = 4.5 = 5 (+8 for level completion) light bulbs, and <br> 4 / 2 = 2 (+4 for level completion) flashlights</p>
            `;
            this.initItemsDemo();
        }
    }

    initLightSourcesDemo() {
        this.helpGrid = new Grid('help-grid-container', 10, false);
        this.helpGrid.generate();

        this.animationTimers.push(setTimeout(() => {
            const bulbCell = this.helpGrid.cells[55];
            const bulb = new Bulb(bulbCell, this.helpGrid);
            bulb.illuminate();
            this.helpGrid.lightSources.set(55, bulb);

            this.animationTimers.push(setTimeout(() => {
                bulb.clear();
                this.helpGrid.lightSources.delete(55);
                this.animationTimers.push(setTimeout(() => {
                    const flashlightCell = this.helpGrid.cells[45];
                    const flashlight = new Flashlight(flashlightCell, this.helpGrid);
                    flashlight.illuminate();
                    this.helpGrid.lightSources.set(45, flashlight);

                    let rotations = 0;
                    const rotateInterval = setInterval(() => {
                        flashlight.rotateOrRemove();
                        rotations++;
                        
                        if (rotations >= 4) {
                            clearInterval(rotateInterval);
                            this.animationTimers.push(setTimeout(() => {
                                this.initLightSourcesDemo();
                            }, 500));
                        }
                    }, 1000);
                    this.animationTimers.push(rotateInterval);
                }, 1000));
            }, 2000));
        }, 1000));
    }

    initWallsDemo() {
        this.helpGrid = new Grid('help-grid-container', 10, false);
        this.helpGrid.generate();
    
        loadLevel(this.helpGrid, 2).then(() => {
            const bulbCell = this.helpGrid.cells[33];
            const bulb = new Bulb(bulbCell, this.helpGrid);
            bulb.illuminate();
            this.helpGrid.lightSources.set(33, bulb);

            const flashlightCell = this.helpGrid.cells[66];
            const flashlight = new Flashlight(flashlightCell, this.helpGrid);
            flashlight.flashlightElement.style.transform = `rotate(${270}deg)`;
            flashlight.direction = 'top';
            flashlight.currentDirectionIndex = 0;
            flashlight.updateDirectionClass();
            flashlight.illuminate();
            this.helpGrid.lightSources.set(66, flashlight);
        });
    }

    initItemsDemo() {
        this.helpGrid = new Grid('help-grid-container', 10, false);
        this.helpGrid.generate();
    
        loadLevel(this.helpGrid, 1).then(() => {
            const bulbCells = [11, 14, 17, 41, 44, 47, 71, 74, 77];
            bulbCells.forEach(idx => {
                const bulbCell = this.helpGrid.cells[idx];
                const bulb = new Bulb(bulbCell, this.helpGrid);
                bulb.illuminate();
                this.helpGrid.lightSources.set(idx, bulb);
            });

            const flashlightConfigs = [
                { idx: 90, directionIndex: 0 },
                { idx: 9, directionIndex: 1 }, 
                { idx: 99, directionIndex: 2 },
                { idx: 59, directionIndex: 1 } 
            ];
            flashlightConfigs.forEach(cfg => {
                const cell = this.helpGrid.cells[cfg.idx];
                const flashlight = new Flashlight(cell, this.helpGrid);
                flashlight.currentDirectionIndex = cfg.directionIndex;
                flashlight.direction = flashlight.directions[flashlight.currentDirectionIndex];
                flashlight.flashlightElement.style.transform = `rotate(${cfg.directionIndex * 90}deg)`;
                flashlight.updateDirectionClass();
                flashlight.illuminate();
                this.helpGrid.lightSources.set(cfg.idx, flashlight);
            });
        });
    }
    clearAnimations() {
        this.animationTimers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.animationTimers = [];

        if (this.helpGrid) {
            this.helpGrid.lightSources.forEach(source => source.clear());
            this.helpGrid.lightSources.clear();
        }
    }
}

export const helpModal = new HelpModal();