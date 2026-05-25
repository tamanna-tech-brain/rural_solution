import { createSlice } from '@reduxjs/toolkit'

const mandiSlice = createSlice({
  name: 'mandi',

  initialState: {
    pools: [],
  },

  reducers: {
    setPools: (state, action) => {
      state.pools = action.payload
    },
  },
})

export const { setPools } = mandiSlice.actions

export default mandiSlice.reducer