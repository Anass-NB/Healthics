import { NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IconHome, 
  IconUser, 
  IconFileText, 
  IconUpload, 
  IconDashboard, 
  IconUsers, 
  IconFileAnalytics,
  IconStethoscope,
  IconChartBar
} from '@tabler/icons-react';

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
        leftSection={<IconHome size={20} />}
        active={location.pathname === '/'}
      />
      
      {/* Patient-only links */}
      {!isAdmin() && (
        <>
          <NavLink
            component={Link}
            to="/profile"
            label="My Profile"
            leftSection={<IconUser size={20} />}
            active={location.pathname === '/profile'}
          />
          
          <NavLink
            component={Link}
            to="/documents"
            label="My Documents"
            leftSection={<IconFileText size={20} />}
            active={location.pathname === '/documents'}
          />
            <NavLink
            component={Link}
            to="/documents/upload"
            label="Upload Document"
            leftSection={<IconUpload size={20} />}
            active={location.pathname === '/documents/upload'}
          />
          
          <NavLink
            component={Link}
            to="/health-advisor"
            label="Health Advisor"
            leftSection={<IconStethoscope size={20} />}
            active={location.pathname === '/health-advisor'}
          />
        </>
      )}
      
      {/* Admin-only links */}
      {isAdmin() && (
        <>
          <NavLink
            component={Link}
            to="/admin/dashboard"
            label="Dashboard"
            leftSection={<IconDashboard size={20} />}
            active={location.pathname === '/admin/dashboard'}
            fw={700}
            c="blue"
          />
          
          <NavLink
            component={Link}
            to="/admin/patients"
            label="Patient Management"
            leftSection={<IconUsers size={20} />}
            active={location.pathname === '/admin/patients'}
          />
            <NavLink
            component={Link}
            to="/admin/documents"
            label="All Documents"
            leftSection={<IconFileAnalytics size={20} />}
            active={location.pathname === '/admin/documents'}
          />
          
          <NavLink
            component={Link}
            to="/admin/analytics"
            label="Big Data Analytics"
            leftSection={<IconChartBar size={20} />}
            active={location.pathname === '/admin/analytics'}
          />
          
          
          {/* <NavLink
            component={Link}
            to="/documents"
            label="Admin Documents"
            leftSection={<IconFileText size={20} />}
            active={location.pathname === '/documents'}
          /> */}
        </>
      )}
    </>
  );
};

export default NavbarContent;