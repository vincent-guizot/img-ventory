import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/userSlice';
import imagesReducer from './slices/imageSlice';

const store = configureStore({
    reducer: {
        users: usersReducer,
        images: imagesReducer,
    },
});

export default store;
