import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import equipmentReducer from './equipmentSlice';  // ✅ Fixed: was equipmentSlices
import mandiReducer from './mandiSlice';            // ✅ Fixed: was mandiSlices

const store = configureStore({
  reducer: {
    auth: authReducer,
    equipment: equipmentReducer,
    mandi: mandiReducer,
  },
});

export default store;