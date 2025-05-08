import { NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavbarContent = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <>
      <NavLink
        component={Link}
        to="/"
        label="Home"
        active={location.pathname === '/'}
      />
      
      {/* Patient-only links */}
      {!isAdmin() && (
        <>
         
          <NavLink
            component={Link}
            to="/profile"
            label="My Profile"
            active={location.pathname === '/profile'}
          />
          
          <NavLink
            component={Link}
            to="/documents"
            label="My Documents"
            active={location.pathname.startsWith('/documents')}
          />
        </>
      )}
      
      {/* Admin-only links */}
      {isAdmin() && (
        <>
          <NavLink
            component={Link}
            to="/admin/dashboard"
            label="Admin Dashboard"
            active={location.pathname.startsWith('/admin')}
            fw={700}
            c="blue"
          />
          
          <NavLink
            component={Link}
            to="/documents"
            label="View Documents"
            active={location.pathname === '/documents'}
          />
        </>
      )}
    </>
  );
};

export default NavbarContent;