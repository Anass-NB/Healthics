import { Paper, Skeleton, Group, Stack, Box, Container } from '@mantine/core';

interface PageLoadingProps {
  type?: 'document' | 'profile' | 'list';
}

/**
 * A reusable loading component that shows skeleton UI based on content type
 */
const PageLoading = ({ type = 'list' }: PageLoadingProps) => {
  
  if (type === 'document') {
    return (
      <Container>
        <Skeleton height={50} width="70%" radius="md" mb="xl" />
        
        <Paper p="md" withBorder mb="lg">
          <Skeleton height={40} width="40%" mb="xl" />
          <Group justify="space-between" mb="lg">
            <Skeleton height={36} width={120} radius="md" />
            <Group>
              <Skeleton height={36} width={100} radius="md" />
              <Skeleton height={36} width={100} radius="md" />
            </Group>
          </Group>
          
          <Group grow align="flex-start">
            <Stack>
              <Skeleton height={24} width="90%" mb="md" />
              <Skeleton height={100} width="100%" />
            </Stack>
            <Stack>
              <Skeleton height={24} width="90%" mb="md" />
              <Skeleton height={100} width="100%" />
            </Stack>
          </Group>
        </Paper>
      </Container>
    );
  }
  
  if (type === 'profile') {
    return (
      <Container>
        <Skeleton height={50} width="60%" radius="md" mb="xl" />
        
        <Paper p="xl" withBorder mb="lg">
          <Box mb="xl">
            <Skeleton height={24} circle mb="lg" />
            <Skeleton height={20} width="40%" mb="sm" />
            <Skeleton height={20} width="60%" mb="sm" />
            <Skeleton height={20} width="30%" />
          </Box>
          
          <Box mb="xl">
            <Skeleton height={20} width="40%" mb="sm" />
            <Skeleton height={20} width="70%" mb="sm" />
            <Skeleton height={20} width="50%" />
          </Box>
          
          <Skeleton height={36} width={120} radius="md" />
        </Paper>
      </Container>
    );
  }
  
  // Default list loading view
  return (
    <Container>
      <Skeleton height={50} width="50%" radius="md" mb="xl" />
      
      <Paper p="md" withBorder mb="lg">
        <Group justify="space-between" mb="xl">
          <Group>
            <Skeleton height={36} width={150} radius="md" />
            <Skeleton height={36} width={150} radius="md" />
          </Group>
          <Skeleton height={36} width={150} radius="md" />
        </Group>
        
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} mb="sm" />
        <Skeleton height={40} />
      </Paper>
    </Container>
  );
};

export default PageLoading;