export const getOppositeDirection = (direction) => {
    const opposites = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    };
    return opposites[direction];
}

export const showMessage = (msg) => {
    const container = document.getElementById('message-container');
    container.textContent = msg;
    container.style.display = 'block';
    clearTimeout(container._timeout);
    container._timeout = setTimeout(() => {
        container.style.display = 'none'
    }, 5000);
}

export async function loadLevels() {
    try {
        const response = await fetch('./levels.json');
        if (!response.ok) throw new Error('Failed to load levels');
        return await response.json();
    } catch (error) {
        showMessage('Failed to load levels. Please refresh.');
        return [];
    }
}

export async function loadLevel(grid, levelId) {
    try {
        const levels = await loadLevels();
        const level = levels.find(l => l.id === levelId);

        if (!level) {
            showMessage('Congratulations! You completed the game!');
            return false;
        } 
        level.walls.forEach(w => grid.addWall(w.index, w.direction));
        return true;
    } catch (error) {
        showMessage('Error loading level');
        return false;
    }
}