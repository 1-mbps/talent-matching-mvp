import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types';

const LoginPage: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.username = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(formData);
        navigate('/profile');
      } catch (err) {
        console.error('Login error:', err);
      }
    }
  };
  
  const formBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="md" py={12}>
      <Box bg={formBg} p={8} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Log In
        </Heading>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.username} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="username"
                type="email"
                value={formData.username}
                onChange={handleChange}
                placeholder="your.username@example.com"
              />
              {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="******"
              />
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              loadingText="Logging in"
              w="full"
              mt={4}
            >
              Log In
            </Button>
          </Stack>
        </form>
        
        <Text mt={6} textAlign="center">
          Don't have an account?{' '}
          <Text as={RouterLink} to="/register" color="blue.500" _hover={{ textDecoration: 'underline' }}>
            Create Account
          </Text>
        </Text>
      </Box>
    </Container>
  );
};

export default LoginPage;