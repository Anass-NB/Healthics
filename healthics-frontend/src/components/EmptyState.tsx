import { Box, Text, Paper, Button, Stack, Center, ThemeIcon } from '@mantine/core';
import { IconFileOff } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

/**
 * A reusable empty state component for when no data is available
 */
const EmptyState = ({ 
  title, 
  description, 
  icon, 
  primaryAction, 
  secondaryAction 
}: EmptyStateProps) => {  return (
    <Paper p="xl" withBorder radius="xl" 
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
      shadow="lg"
    >      <Center py="xl">
        <Stack gap="md" align="center" style={{ maxWidth: 500 }}>
          {icon ? (
            icon          ) : (
            <ThemeIcon size={80} radius={100} color="medicalBlue.1" variant="light">
              <IconFileOff size={40} color="var(--mantine-color-medicalBlue-6)" />
            </ThemeIcon>
          )}
          
          <Text fw={700} fz="xl" mt="md" ta="center">
            {title}
          </Text>
          
          <Text c="dimmed" ta="center" px="md">
            {description}
          </Text>
          
          {(primaryAction || secondaryAction) && (
            <Box mt="lg">
              {primaryAction && (
                <Button 
                  leftSection={primaryAction.icon}
                  onClick={primaryAction.onClick}
                  mb={secondaryAction ? 'xs' : 0}
                  radius="lg"
                >
                  {primaryAction.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  variant="subtle" 
                  leftSection={secondaryAction.icon}
                  onClick={secondaryAction.onClick}
                  mt="xs"
                  radius="lg"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Box>
          )}
        </Stack>
      </Center>
    </Paper>
  );
};

export default EmptyState;