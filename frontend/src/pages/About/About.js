import React, { useState } from 'react';
import {
    Box, Input, Select, Button, Text, Heading, SimpleGrid,
    Container, VStack, FormControl, FormLabel, Spinner, useToast
} from '@chakra-ui/react';
import axios from 'axios';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { API_BASE } from '../../utils/api';

export default function YogaPlanner() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [experience, setExperience] = useState('beginner');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const generateYogaPlan = async () => {
        if (!age || !weight || !height) {
            toast({
                title: 'Missing details',
                description: 'Please enter your age, weight, and height.',
                status: 'warning',
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        setPlan(null);

        try {
            const { data } = await axios.post(`${API_BASE}/api/generate-plan`, {
                age, weight, height, experience,
            });
            setPlan(data.plan);
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast({
                title: 'Could not generate plan',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <Box bg="#F4F6F1" minH="80vh" py={16} px={4}>
                <Container maxW="2xl">
                    <VStack spacing={2} mb={8} textAlign="center">
                        <Heading as="h1" size="xl" color="#3A5A40">
                            AI Yoga Planner
                        </Heading>
                        <Text color="gray.600" fontSize="lg">
                            Enter your details to generate a personalized yoga plan.
                        </Text>
                    </VStack>

                    <Box
                        bg="white"
                        borderRadius="xl"
                        boxShadow="lg"
                        p={{ base: 6, md: 10 }}
                    >
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                            <FormControl>
                                <FormLabel color="gray.700">Weight (kg)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="e.g. 65"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    focusBorderColor="#3A5A40"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.700">Height (cm)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="e.g. 170"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    focusBorderColor="#3A5A40"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.700">Age</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="e.g. 28"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    focusBorderColor="#3A5A40"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.700">Experience</FormLabel>
                                <Select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    focusBorderColor="#3A5A40"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        <Button
                            w="full"
                            mt={8}
                            size="lg"
                            bg="#3A5A40"
                            color="white"
                            _hover={{ bg: '#242F2A' }}
                            onClick={generateYogaPlan}
                            isLoading={loading}
                            loadingText="Generating..."
                        >
                            Generate Plan
                        </Button>
                    </Box>

                    {loading && (
                        <VStack mt={8} spacing={3}>
                            <Spinner color="#3A5A40" size="lg" thickness="3px" />
                            <Text color="gray.500">Crafting your plan…</Text>
                        </VStack>
                    )}

                    {plan && !loading && (
                        <Box
                            mt={8}
                            bg="white"
                            borderRadius="xl"
                            boxShadow="md"
                            borderLeft="6px solid #3A5A40"
                            p={{ base: 6, md: 8 }}
                        >
                            <Heading as="h2" size="md" mb={4} color="#3A5A40">
                                Your Yoga Plan
                            </Heading>
                            <Text whiteSpace="pre-wrap" color="gray.700" lineHeight="tall">
                                {plan}
                            </Text>
                        </Box>
                    )}
                </Container>
            </Box>
            <Footer />
        </>
    );
}
