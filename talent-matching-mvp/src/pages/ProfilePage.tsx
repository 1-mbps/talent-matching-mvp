import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Card,
  CardBody,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { userAPI } from '../api/api';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.700');

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect business users to business profile
  if (!isLoading && user?.user_type === 'business') {
    return <Navigate to="/business-profile" />;
  }

  // Show loading state
  if (isLoading || !user) {
    return (
      <Container maxW="container.md" py={10}>
        <Box textAlign="center">
          <Text>Loading profile...</Text>
        </Box>
      </Container>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a PDF file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsUploading(true);
      await userAPI.uploadResume(file);
      
      toast({
        title: 'Resume uploaded',
        description: 'Your resume has been successfully uploaded',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your resume',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Resume upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl">
              My Profile
            </Heading>
            <Button colorScheme="red" onClick={logout}>
              Sign Out
            </Button>
          </Flex>

          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md" overflow="hidden">
            <CardBody>
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Avatar 
                  size="2xl" 
                  name={user.name} 
                  bg="blue.500"
                />
                
                <VStack align="stretch" flex={1} spacing={3}>
                  <Heading as="h2" size="lg">
                    {user.name}
                  </Heading>
                  
                  <HStack>
                    <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                      Job Seeker
                    </Badge>
                  </HStack>
                  
                  <Text>
                    <strong>Email:</strong> {user.email}
                  </Text>
                  
                  <Text>
                    <strong>Location:</strong> {user.city}, {user.country}
                  </Text>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading as="h3" size="md">
                  Resume Management
                </Heading>
                
                <Divider />
                
                <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align="center">
                  <Button
                    as="label"
                    htmlFor="resume-upload"
                    colorScheme="blue"
                    isLoading={isUploading}
                    loadingText="Uploading..."
                    cursor="pointer"
                  >
                    Upload Resume (PDF)
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </Button>
                  
                  <Text fontSize="sm" color="gray.500">
                    Upload your resume to be matched with potential employers
                  </Text>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProfilePage; 