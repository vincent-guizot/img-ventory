import { createSlice } from '@reduxjs/toolkit';

import { images } from '../../constants/data'

const initialState = {
    images: images,
    loading: false,
    error: null
};

const imagesSlice = createSlice({
    name: 'images',
    initialState,
    reducers: {
        addImage: (state, action) => {
            state.images.push(action.payload);
        },
        updateImage: (state, action) => {
            const index = state.images.findIndex(img => img.id === action.payload.id);
            if (index !== -1) {
                state.images[index] = action.payload;
            }
        },
        deleteImage: (state, action) => {
            state.images = state.images.filter(img => img.id !== action.payload);
        },
        setImages: (state, action) => {
            state.images = action.payload;
        },
    },
});

export const { addImage, updateImage, deleteImage, setImages } = imagesSlice.actions;
export default imagesSlice.reducer;
