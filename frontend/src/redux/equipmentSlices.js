import { createSlice } from '@reduxjs/toolkit'

const equipmentSlice = createSlice({
  name: 'equipment',

  initialState: {
    equipments: [],
  },

  reducers: {
    setEquipments: (state, action) => {
      state.equipments = action.payload
    },
  },
})

export const { setEquipments } = equipmentSlice.actions

export default equipmentSlice.reducer