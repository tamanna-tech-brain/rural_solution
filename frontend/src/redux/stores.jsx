import { configureStore } from '@reduxjs/toolkit'

import authReducer from './authSlice'
import equipmentReducer from './equipmentSlice'
import mandiReducer from './mandiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    equipment: equipmentReducer,
    mandi: mandiReducer,
  },
})

export default store