import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Preloader from './Preloader';

export default function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Preloader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
