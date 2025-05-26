import { Breadcrumbs, Anchor, Group, Text } from '@mantine/core';
import { useLocation, Link } from 'react-router-dom';
import { IconHome, IconChevronRight } from '@tabler/icons-react';

interface BreadcrumbItem {
  title: string;
  path: string;
  isActive?: boolean;
}

// Maps route paths to readable titles
const routeMap: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/patients': 'Patients',
  '/admin/documents': 'All Documents',
  '/documents': 'My Documents',
  '/documents/upload': 'Upload Document',
  '/profile': 'Profile',
};

const BreadcrumbNav = () => {
  const location = useLocation();
  const { pathname } = location;
  
  // Build breadcrumb items based on the current path
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { title: 'Home', path: '/' }
    ];
    
    let currentPath = '';
    
    // Build path segments
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      
      // Special case for patient documents
      if (pathSegments[i-1] === 'patients' && !isNaN(Number(pathSegments[i])) && pathSegments[i+1] === 'documents') {
        items.push({ 
          title: 'Patients', 
          path: '/admin/patients'
        });
        items.push({ 
          title: `Patient ${pathSegments[i]}`, 
          path: `/admin/patients/${pathSegments[i]}`
        });
        continue;
      }
      
      // Special case for document detail/edit
      if (pathSegments[i-1] === 'documents' && !isNaN(Number(pathSegments[i]))) {
        if (pathSegments[i+1] === 'edit') {
          items.push({ 
            title: 'Documents', 
            path: `/${pathSegments[i-2]}/documents`
          });
          items.push({ 
            title: `Document ${pathSegments[i]}`, 
            path: `/${pathSegments[i-2]}/documents/${pathSegments[i]}`
          });
          continue;
        } else {
          items.push({ 
            title: 'Documents', 
            path: `/${pathSegments[i-2]}/documents`
          });
        }
      }
      
      // Check if we have a custom title for this path
      const title = routeMap[currentPath] || pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);
      
      items.push({
        title,
        path: currentPath,
        isActive: i === pathSegments.length - 1
      });
    }
    
    return items;
  };
  
  const items = getBreadcrumbItems();
  
  // If only home, don't show breadcrumbs
  if (items.length <= 1) {
    return null;
  }
  
  return (
    <Group mb="md">
      <Breadcrumbs separator={<IconChevronRight size={16} />}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast ? (
            <Text key={item.path} size="sm" fw={500}>
              {item.title}
            </Text>
          ) : (
            <Anchor 
              key={item.path} 
              component={Link} 
              to={item.path}
              size="sm"
              underline="never"
            >
              {index === 0 ? <IconHome size={16} /> : item.title}
            </Anchor>
          );
        })}
      </Breadcrumbs>
    </Group>
  );
};

export default BreadcrumbNav;