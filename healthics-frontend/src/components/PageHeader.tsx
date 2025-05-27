import { Title, Group, ActionIcon, Text, Box, Flex, Paper } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
}

/**
 * A consistent page header component with optional back button
 */
const PageHeader = ({ title, subtitle, showBackButton = true, action }: PageHeaderProps) => {
  const navigate = useNavigate();
    return (
    <Paper 
      shadow="sm" 
      p="lg" 
      mb="lg" 
      withBorder
      radius="xl"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Flex justify="space-between" align="center">
        <Group>
          {showBackButton && (
            <ActionIcon size="lg" variant="subtle" onClick={() => navigate(-1)}>
              <IconArrowLeft />
            </ActionIcon>
          )}
          
          <Box>
            <Title order={1} size="h2">{title}</Title>
            {subtitle && (
              <Text c="dimmed" size="sm">
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        
        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Flex>
    </Paper>
  );
};

export default PageHeader;