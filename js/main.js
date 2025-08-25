import { Grid } from './grid.js';
import { inventory } from './inventory.js';
import { loadLevel } from './utils.js';
import { helpModal } from './helpMenu.js';
import { saveGameState, loadGameState, clearGameState, buildGameState } from './stateManager.js';

window.addEventListener('DOMContentLoaded', () => {
    const savedState = loadGameState();
    const grid = new Grid('grid-container', 10);

    grid.currentLevelId = savedState ? savedState.levelId : 1;

    if (savedState) {
        inventory.bulbs = savedState.bulbs;
        inventory.flashlights = savedState.flashlights;
        grid.selectedLightType = savedState.selectedLightType;
    }
    grid.generate();
    loadLevel(grid, grid.currentLevelId).then(() => {
        if (savedState && savedState.lightSources) {
            grid.loadLightSources(savedState.lightSources);
            grid.checkWinCondition();
        }
    });

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

    inventory.updateUI();

    const bulbBtn = document.getElementById('bulb-btn');
    const flashlightBtn = document.getElementById('flashlight-btn');
    if (grid.selectedLightType === 'flashlight') {
        flashlightBtn.classList.add('selected');
        bulbBtn.classList.remove('selected');
    } else {
        bulbBtn.classList.add('selected');
        flashlightBtn.classList.remove('selected');
    }

    const saveState = () => {
        saveGameState(grid.getCurrentState());
    };

    document.getElementById('options-menu').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'block';
        document.querySelector('.modal-content').style.display = 'block';
    });

    document.getElementById('restart-level').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';
        grid.cancelLevelTransition();
        grid.reloadLevel();
        saveGameState(grid.getCurrentState());
    });

    document.getElementById('restart-game').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';

        grid.cancelLevelTransition();

        grid.currentLevelId = 1;
        grid.clearLightSources();
        grid.clearHighlights();

        inventory.initialBulbs = 10;
        inventory.initialFlashlights = 5;
        inventory.bulbs = 10;
        inventory.flashlights = 5;
        inventory.updateUI();

        grid.generate();
        loadLevel(grid, grid.currentLevelId); 

        levelCounter.querySelector('span').textContent = `Level: ${grid.currentLevelId}`;
        clearGameState();
        grid.container.style.pointerEvents = 'auto';
        saveGameState(grid.getCurrentState());
    });

    document.getElementById('close-menu').addEventListener('click', () => {
        document.querySelector('.modal-overlay').style.display = 'none';
        document.querySelector('.modal-content').style.display = 'none';
    });

    document.getElementById('help-menu').addEventListener('click', () => {
        helpModal.open();
    });

    bulbBtn.addEventListener('click', () => {
        bulbBtn.classList.add('selected');
        flashlightBtn.classList.remove('selected');
        grid.selectedLightType = 'bulb';
        saveState();
    });

    flashlightBtn.addEventListener('click', () => {
        flashlightBtn.classList.add('selected');
        bulbBtn.classList.remove('selected');
        grid.selectedLightType = 'flashlight';
        saveState();
    });

    const originalUpdateUI = inventory.updateUI;
    inventory.updateUI = function() {
        originalUpdateUI.call(this);
        saveState();
    }
});
