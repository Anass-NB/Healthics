import { Box, Text, Paper, Button, Stack, Center, ThemeIcon } from '@mantine/core';
import { IconFileOff, IconRefresh, IconPlus, TablerIconsProps } from '@tabler/icons-react';
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
}: EmptyStateProps) => {
  return (
    <Paper p="xl" withBorder radius="md" bg="gray.0" shadow="sm">
      <Center py="xl">
        <Stack spacing="md" align="center" style={{ maxWidth: 500 }}>
          {icon ? (
            icon
          ) : (
            <ThemeIcon size={80} radius={100} color="blue.1" variant="light">
              <IconFileOff size={40} color="var(--mantine-color-blue-6)" />
            </ThemeIcon>
          )}
          
          <Text fw={700} fz="xl" mt="md" align="center">
            {title}
          </Text>
          
          <Text c="dimmed" align="center" px="md">
            {description}
          </Text>
          
          {(primaryAction || secondaryAction) && (
            <Box mt="lg">
              {primaryAction && (
                <Button 
                  leftIcon={primaryAction.icon}
                  onClick={primaryAction.onClick}
                  mb={secondaryAction ? 'xs' : 0}
                >
                  {primaryAction.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  variant="subtle" 
                  leftIcon={secondaryAction.icon}
                  onClick={secondaryAction.onClick}
                  mt="xs"
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