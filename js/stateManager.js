export const saveGameState = (state) => {
    try {
        const lightSourcesData = Array.from(state.lightSources.entries()).map(([index, source]) => {
            const data = {
                cellIndex: index,
                type: source.type
            };

            if (source.type === 'flashlight') {
                data.directionIndex = source.currentDirectionIndex;
            }
            return data;
        });

        const stateToSave = {
            levelId: state.levelId,
            bulbs: state.bulbs,
            flashlights: state.flashlights,
            selectedLightType: state.selectedLightType,
            lightSources: lightSourcesData
        };

        localStorage.setItem('gameState', JSON.stringify(stateToSave));
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