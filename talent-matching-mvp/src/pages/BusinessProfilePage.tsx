import React, { useState, useEffect } from 'react';
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
  Card,
  CardBody,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { businessAPI } from '../api/api';
import { Job, CandidateMatch } from '../types';

const BusinessProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.700');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '' });
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localWeightChanges, setLocalWeightChanges] = useState<Record<string, Record<string, number>>>({});
  const [matches, setMatches] = useState<Record<string, CandidateMatch[]>>({});
  const [isCalculatingMatches, setIsCalculatingMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'business') {
      loadJobs();
      loadAllMatches();
    }
  }, [isAuthenticated, user]);

  const loadJobs = async () => {
    try {
      const jobsData = await businessAPI.getJobs();
      setJobs(jobsData);
    } catch (error) {
      toast({
        title: 'Error loading jobs',
        description: 'There was an error loading your jobs.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadAllMatches = async () => {
    try {
      const jobsData = await businessAPI.getJobs();
      const matchesData: Record<string, CandidateMatch[]> = {};
      
      for (const job of jobsData) {
        try {
          const jobMatches = await businessAPI.getMatches(job.job_id);
          matchesData[job.job_id] = jobMatches;
        } catch (error) {
          console.error(`Error loading matches for job ${job.job_id}:`, error);
          matchesData[job.job_id] = [];
        }
      }
      
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: 'Error loading matches',
        description: 'There was an error loading the matches.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!newJob.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!newJob.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsCreatingJob(true);
      await businessAPI.createJob(newJob.description, newJob.title);
      setNewJob({ title: '', description: '' });
      loadJobs();
      toast({
        title: 'Job created',
        description: 'Your job has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating job',
        description: 'There was an error creating your job.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleEditJob = async (jobId: string, updatedData: {
    title?: string;
    description?: string;
    schema?: string;
    weights?: string;
  }) => {
    try {
      if (updatedData.schema) {
        try {
          JSON.parse(updatedData.schema);
        } catch (e) {
          toast({
            title: 'Invalid JSON',
            description: 'The rating schema must be valid JSON.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
      }

      await businessAPI.editJob(
        jobId,
        updatedData.title,
        updatedData.description,
        updatedData.schema,
        updatedData.weights
      );
      
      loadJobs();
      setEditingJobId(null);
      setLocalWeightChanges(prev => ({ ...prev, [jobId]: {} }));
      toast({
        title: 'Job updated',
        description: 'Your job has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating job',
        description: 'There was an error updating your job.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCalculateMatches = async (jobId: string) => {
    try {
      setIsCalculatingMatches(prev => ({ ...prev, [jobId]: true }));
      const newMatches = await businessAPI.calculateMatches(jobId);
      setMatches(prev => ({ ...prev, [jobId]: newMatches }));
      toast({
        title: 'Matches calculated',
        description: 'The matches have been successfully calculated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error calculating matches',
        description: 'There was an error calculating the matches.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCalculatingMatches(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Redirect if not authenticated or not a business user
  if (!isLoading && (!isAuthenticated || user?.user_type !== 'business')) {
    return <Navigate to="/login" />;
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

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl">
              Business Profile
            </Heading>
            <Button colorScheme="red" onClick={logout}>
              Sign Out
            </Button>
          </Flex>

          {/* Profile Information */}
          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md" overflow="hidden">
            <CardBody>
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Avatar size="2xl" name={user.name} bg="purple.500" />
                <VStack align="stretch" flex={1} spacing={3}>
                  <Heading as="h2" size="lg">{user.name}</Heading>
                  <Badge colorScheme="purple" fontSize="md" px={2} py={1} width="fit-content">
                    Business / Employer
                  </Badge>
                  <Text><strong>Email:</strong> {user.email}</Text>
                  <Text><strong>Location:</strong> {user.city}, {user.country}</Text>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Create Job Form */}
          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading as="h3" size="md">Create New Job</Heading>
                <form onSubmit={handleCreateJob}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.title} isRequired>
                      <FormLabel>Job Title</FormLabel>
                      <Input
                        value={newJob.title}
                        onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter job title"
                      />
                      {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
                    </FormControl>

                    <FormControl isInvalid={!!errors.description} isRequired>
                      <FormLabel>Job Description</FormLabel>
                      <Textarea
                        value={newJob.description}
                        onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter detailed job description"
                        rows={4}
                      />
                      {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={isCreatingJob}
                      width="full"
                    >
                      Create Job
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>

          {/* Jobs List */}
          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading as="h3" size="md">Your Jobs</Heading>
                <Accordion allowMultiple>
                  {jobs.map((job) => (
                    <AccordionItem key={job.job_id}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex='1' textAlign='left'>
                            {job.job_title}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {editingJobId === job.job_id ? (
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Job Title</FormLabel>
                              <Input
                                defaultValue={job.job_title}
                                onBlur={(e) => handleEditJob(job.job_id, { title: e.target.value })}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Job Description</FormLabel>
                              <Textarea
                                defaultValue={job.job_desc}
                                onBlur={(e) => handleEditJob(job.job_id, { description: e.target.value })}
                                rows={4}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Rating Schema (JSON)</FormLabel>
                              <Textarea
                                defaultValue={JSON.stringify(job.rating_schema, null, 2)}
                                onBlur={(e) => handleEditJob(job.job_id, { schema: e.target.value })}
                                rows={6}
                                fontFamily="monospace"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Rating Schema Weights</FormLabel>
                              <VStack align="stretch">
                                {Object.entries(job.rating_schema_weights || {}).map(([key, value]) => (
                                  <HStack key={key}>
                                    <Text flex="1">{key}:</Text>
                                    <NumberInput
                                      defaultValue={localWeightChanges[job.job_id]?.[key] ?? value}
                                      min={0}
                                      max={1}
                                      step={0.1}
                                      onChange={(valueString) => {
                                        setLocalWeightChanges(prev => ({
                                          ...prev,
                                          [job.job_id]: {
                                            ...prev[job.job_id],
                                            [key]: parseFloat(valueString)
                                          }
                                        }));
                                      }}
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                  </HStack>
                                ))}
                              </VStack>
                            </FormControl>

                            <Button
                              colorScheme="blue"
                              onClick={() => {
                                if (localWeightChanges[job.job_id]) {
                                  handleEditJob(job.job_id, {
                                    weights: JSON.stringify(localWeightChanges[job.job_id])
                                  });
                                } else {
                                  setEditingJobId(null);
                                }
                              }}
                            >
                              Done Editing
                            </Button>
                          </VStack>
                        ) : (
                          <VStack align="stretch" spacing={4}>
                            <Text><strong>Description:</strong> {job.job_desc}</Text>
                            <Text><strong>Rating Schema:</strong></Text>
                            <Box
                              bg="gray.50"
                              p={2}
                              borderRadius="md"
                              fontFamily="monospace"
                              whiteSpace="pre-wrap"
                            >
                              {JSON.stringify(job.rating_schema, null, 2)}
                            </Box>
                            <Text><strong>Rating Schema Weights:</strong></Text>
                            <VStack align="stretch">
                              {Object.entries(job.rating_schema_weights || {}).map(([key, value]) => (
                                <Text key={key}>
                                  {key}: {value}
                                </Text>
                              ))}
                            </VStack>
                            <Button
                              colorScheme="blue"
                              onClick={() => setEditingJobId(job.job_id)}
                            >
                              Edit Job
                            </Button>
                          </VStack>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </VStack>
            </CardBody>
          </Card>

          {/* Matches Section */}
          <Card bg={cardBgColor} borderRadius="lg" boxShadow="md">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading as="h3" size="md">Matches</Heading>
                <Accordion allowMultiple>
                  {jobs.map((job) => (
                    <AccordionItem key={`matches-${job.job_id}`}>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex='1' textAlign='left'>
                            {job.job_title}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={4}>
                          <Button
                            colorScheme="blue"
                            onClick={() => handleCalculateMatches(job.job_id)}
                            isLoading={isCalculatingMatches[job.job_id]}
                          >
                            {matches[job.job_id]?.length ? 'Recalculate Matches' : 'Calculate Matches'}
                          </Button>
                          
                          {matches[job.job_id]?.map((match, index) => (
                            <Card key={index} variant="outline">
                              <CardBody>
                                <VStack align="stretch" spacing={2}>
                                  <Text><strong>Name:</strong> {match.name}</Text>
                                  <Text><strong>Score:</strong> {match.score.toFixed(2)}</Text>
                                  <Text><strong>Resume:</strong> {match.resume}</Text>
                                  <Text><strong>Ratings:</strong></Text>
                                  <VStack align="stretch" pl={4}>
                                    {Object.entries(match.ratings).map(([key, value]) => (
                                      <Text key={key}>{key}: {value.toFixed(2)}</Text>
                                    ))}
                                  </VStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default BusinessProfilePage;
