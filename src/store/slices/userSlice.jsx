import { createSlice } from '@reduxjs/toolkit';

import { users } from '../../constants/data'

const initialState = {
    users: users,
    loading: false,
    error: null
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        addUser: (state, action) => {
            state.users.push(action.payload);
        },
        updateUser: (state, action) => {
            const index = state.users.findIndex(user => user.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        deleteUser: (state, action) => {
            state.users = state.users.filter(user => user.id !== action.payload);
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
    },
});

export const { addUser, updateUser, deleteUser, setUsers } = usersSlice.actions;
export default usersSlice.reducer;
