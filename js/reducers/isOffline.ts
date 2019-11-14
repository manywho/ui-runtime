const isOffline = (state = false, action) => {
    switch (action.type) {
    case 'is_OFFLINE':
        return action.payload;

    default:
        return state;
    }
};

export default isOffline;
