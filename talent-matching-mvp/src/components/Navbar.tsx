import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Avatar,
  Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated, logout } = useAuth();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box bg={bg} px={4} boxShadow="sm" borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold" fontSize="xl" as={RouterLink} to="/">
            TalentMatch
          </Box>
        </HStack>
        
        <Flex alignItems="center">
          <HStack
            as="nav"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {!isAuthenticated ? (
              <>
                <Button 
                  as={RouterLink} 
                  to="/login"
                  variant="ghost"
                  colorScheme="blue"
                >
                  Log In
                </Button>
                
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="blue"
                >
                  Create Account
                </Button>
              </>
            ) : (
              <Menu>
                <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
                  <Avatar size="sm" name={user?.name || ''} />
                </MenuButton>
                <MenuList>
                  <RouterLink to="/profile">
                    <MenuItem>
                      <Flex align="center" direction="column" w="full" py={2}>
                        <Avatar size="md" name={user?.name || ''} mb={2} />
                        <Text fontWeight="medium">{user?.name}</Text>
                        <Text fontSize="sm" color="gray.500">{user?.email}</Text>
                      </Flex>
                    </MenuItem>
                  </RouterLink>
                  <MenuDivider />
                  <RouterLink to="/profile">
                    <MenuItem>Profile</MenuItem>
                  </RouterLink>
                  <MenuItem onClick={logout}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 