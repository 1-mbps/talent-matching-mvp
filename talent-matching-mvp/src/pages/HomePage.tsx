import React from 'react';
import { Box, Button, Container, Flex, Heading, Text, VStack, Image, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={10} align="center" textAlign="center">
          <Heading as="h1" size="2xl" fontWeight="bold">
            Talent Matching Platform
          </Heading>
          
          <Text fontSize="xl" maxW="800px">
            Connect the right talent with the right opportunities using our AI-powered matching platform.
            Upload your resume and let our AI match you with companies that are looking for your skills.
          </Text>
          
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            gap={8} 
            width="full" 
            justifyContent="center"
          >
            <Button 
              as={RouterLink} 
              to="/login" 
              size="lg" 
              colorScheme="blue" 
              width={{ base: 'full', md: '200px' }}
            >
              Log In
            </Button>
            
            <Button 
              as={RouterLink} 
              to="/register" 
              size="lg" 
              colorScheme="green" 
              width={{ base: 'full', md: '200px' }}
            >
              Create Account
            </Button>
          </Flex>
          
          <Box mt={16} width="full">
            <Heading as="h2" size="xl" mb={8}>
              How It Works
            </Heading>
            
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={8} 
              justifyContent="center"
            >
              {[
                { 
                  title: 'For Candidates', 
                  desc: 'Upload your resume and let our AI analyze your skills and experience to match you with the perfect opportunities.',
                  icon: '👨‍💼'
                },
                { 
                  title: 'For Businesses', 
                  desc: 'Describe your ideal candidate and our AI will find the best matches from our pool of talented candidates.',
                  icon: '🏢'
                },
              ].map((item, idx) => (
                <Box 
                  key={idx} 
                  bg={cardBgColor} 
                  p={8} 
                  borderRadius="lg" 
                  boxShadow="md"
                  flex="1"
                  maxW="400px"
                  mx="auto"
                >
                  <Text fontSize="5xl" mb={4}>{item.icon}</Text>
                  <Heading as="h3" size="lg" mb={4}>{item.title}</Heading>
                  <Text>{item.desc}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
          
          <Box mt={16} width="full">
            <Heading as="h2" size="xl" mb={8}>
              AI-Powered Matching
            </Heading>
            
            <Text fontSize="lg" maxW="800px" mx="auto">
              Our sophisticated AI algorithms analyze resumes and job descriptions to create perfect matches. 
              No more sifting through hundreds of resumes or job listings. 
              Let our technology do the work for you and connect with the right opportunities or candidates faster.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage; 