import { Grid } from './grid.js';
import { inventory } from './inventory.js';
import { loadLevel } from './utils.js';
import { helpModal } from './helpMenu.js';

window.addEventListener('DOMContentLoaded', () => {
    const grid = new Grid('grid-container', 10);
    grid.generate();

    const levelCounter = document.getElementById('level-counter');
    levelCounter.innerHTML = `
        <span>Level: ${grid.currentLevelId}</span>
        <div id="options-menu" class="options-menu">
            <div class="top-row"></div>
            <div class="middle-row"></div>
            <div class="bottom-row"></div>
            <div class="menu-label">Menu</div>
        </div>
        <div id="help-menu" class="help-menu">
            <p>?</p>
            <div class="help-label">Help</div>    
        </div>
    `;

    loadLevel(grid, grid.currentLevelId);

    document.getElementById('options-menu').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'block';
        document.querySelector('.modal-content').style.display = 'block';
    });

    document.getElementById('restart-level').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';
        grid.reloadLevel();
    });

    document.getElementById('restart-game').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';

        inventory.bulbs = 10;
        inventory.flashlights = 5;
        inventory.updateUI();

        grid.currentLevelId = 1;
        grid.clearLightSources();
        grid.clearHighlights();
        grid.generate();
        loadLevel(grid, grid.currentLevelId); 

        levelCounter.querySelector('span').textContent = `Level: ${grid.currentLevelId}`;
    });

    document.getElementById('close-menu').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';
    });

    document.getElementById('help-menu').addEventListener('click', () => {
        helpModal.open();
    });

    const bulbBtn = document.getElementById('bulb-btn');
    const flashlightBtn = document.getElementById('flashlight-btn');

    bulbBtn.addEventListener('click', () => {
        bulbBtn.classList.add('selected');
        flashlightBtn.classList.remove('selected');
        grid.selectedLightType = 'bulb';
    });

    flashlightBtn.addEventListener('click', () => {
        flashlightBtn.classList.add('selected');
        bulbBtn.classList.remove('selected');
        grid.selectedLightType = 'flashlight';
    });

    bulbBtn.classList.add('selected');
});