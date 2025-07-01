import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser: (state, action) => {
      return action.payload;
    },
    removeUser: (state, action) => {
      return null;
    },
  },
});

export const { setUser, removeUser } = authSlice.actions;
export default authSlice.reducer;
