const isReplaying = (state = false, action) => {
    switch (action.type) {
    case 'IS_REPLAYING':
        return action.payload;

    default:
        return state;
    }
};

export default isReplaying;
