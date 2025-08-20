export const saveGameState = (state) => {
    try {
        localStorage.setItem('gameState', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
};

export const loadGameState = () => {
    try {
        const saved = localStorage.getItem('gameState');
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading game state:', error);
        return null;
    }
};

export const clearGameState = () => {
    try {
        localStorage.removeItem('gameState');
    } catch (error) {
        console.error('Error clearing game state:', error);
    }
};