const cachingProgress = (state = 0, action) => {
    switch (action.type) {
    case 'CACHE_PROGRESS':
        return action.payload;

    default:
        return state;
    }
};

export default cachingProgress;
