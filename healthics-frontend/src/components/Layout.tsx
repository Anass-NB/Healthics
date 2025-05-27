import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Text, UnstyledButton, Menu, Avatar, Divider, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavbarContent from './NavbarContent';
import BreadcrumbNav from './BreadcrumbNav';

const Layout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };
  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />            <Text size="xl" fw={800} 
              style={{
                background: 'linear-gradient(45deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Healthics
            </Text>
          </Group>
          
          {user && (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar radius="xl" size="sm" color={isAdmin() ? "red" : "blue"}>
                      {getInitials(user.username)}
                    </Avatar>
                    <Text>
                      {user.username} 
                      {isAdmin() && <Text span c="red" fw={700} ml={5}>(Admin)</Text>}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                {!isAdmin() && (
                  <>
                    <Menu.Label>Patient</Menu.Label>
                    <Menu.Item onClick={() => navigate('/profile')}>
                      My Profile
                    </Menu.Item>
                    <Menu.Item onClick={() => navigate('/documents')}>
                      My Documents
                    </Menu.Item>
                    <Menu.Item onClick={() => navigate('/documents/upload')}>
                      Upload Document
                    </Menu.Item>
                  </>
                )}
                
                {isAdmin() && (
                  <>
                    <Menu.Label>Admin</Menu.Label>
                    <Menu.Item onClick={() => navigate('/admin/dashboard')}>
                      Admin Dashboard
                    </Menu.Item>
                    <Menu.Item onClick={() => navigate('/documents')}>
                      View Documents
                    </Menu.Item>
                  </>
                )}
                
                <Divider />
                <Menu.Item color="red" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </AppShell.Header>      <AppShell.Navbar 
        p="md" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <NavbarContent />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'transparent' }}>
        <Box ml={10} mr={10} mt={10}>
          <BreadcrumbNav />
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;