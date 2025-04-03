import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Select,
  Stack,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest, UserType } from '../types';

const RegisterPage: React.FC = () => {
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    username: '',
    password: '',
    user_type: 'user' as UserType,
    city: '',
    country: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await register(formData);
        navigate('/profile');
      } catch (err) {
        console.error('Registration error:', err);
      }
    }
  };

  const formBg = useColorModeValue('white', 'gray.700');

  return (
    <Container maxW="md" py={12}>
      <Box bg={formBg} p={8} borderRadius="lg" boxShadow="lg">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Create Account
        </Heading>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.username}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
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
            
            <FormControl isRequired>
              <FormLabel>Account Type</FormLabel>
              <Select 
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
              >
                <option value="user">Job Seeker</option>
                <option value="business">Business / Employer</option>
              </Select>
            </FormControl>
            
            <FormControl isInvalid={!!errors.city} isRequired>
              <FormLabel>City</FormLabel>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Your city"
              />
              {errors.city && <FormErrorMessage>{errors.city}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.country} isRequired>
              <FormLabel>Country</FormLabel>
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Your country"
              />
              {errors.country && <FormErrorMessage>{errors.country}</FormErrorMessage>}
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="green" 
              size="lg" 
              isLoading={isLoading}
              loadingText="Creating account"
              w="full"
              mt={4}
            >
              Create Account
            </Button>
          </Stack>
        </form>
        
        <Text mt={6} textAlign="center">
          Already have an account?{' '}
          <Text as={RouterLink} to="/login" color="blue.500" _hover={{ textDecoration: 'underline' }}>
            Log In
          </Text>
        </Text>
      </Box>
    </Container>
  );
};

export default RegisterPage; 