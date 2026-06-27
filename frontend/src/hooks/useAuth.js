import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout, updateUser } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const login = (userData, authToken) => {
    dispatch(setUser({ user: userData, token: authToken }));
  };

  const logoutUser = () => {
    dispatch(logout());
    navigate('/user');
  };

  const updateProfile = (data) => {
    dispatch(updateUser(data));
  };

  return { user, token, isAuthenticated, login, logoutUser, updateProfile };
};

export default useAuth;
