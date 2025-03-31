import React, { useState } from 'react';
import { Box, Input, Select, Button, Text, Heading, SimpleGrid } from '@chakra-ui/react';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Footer';
import OpenAI from 'openai';
const APIKEY = "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"
const openai = new OpenAI({ apiKey: APIKEY, dangerouslyAllowBrowser: true });

export default function YogaPlanner() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [experience, setExperience] = useState('beginner');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateYogaPlan = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);

        if (!APIKEY) {
            setError("API key is missing. Please check your .env file.");
            setLoading(false);
            return;
        }

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant designed to create personalized yoga plans.",
                    },
                    {
                        role: "user",
                        content: `Generate a personalized yoga plan for a ${age}-year-old person with a weight of ${weight}kg and a height of ${height}cm. They have ${experience} experience level in yoga. only use Tree,Chair, Cobra, Warrior, Dog, Shoulderstand pose`,
                    },
                ],
                model: "gpt-3.5-turbo-0125",
                max_tokens: 200,
                temperature: 0.7
            });

            setPlan(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <Box p={8} pt={12} className='py-58' textAlign="center" style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '5cm' }}>
                <Heading as="h1" mb={4} style={{ color: '#333' }}>AI Yoga Planner</Heading>
                <Box mb={4} style={{ padding: '16px' }}>
                    <Text mb={2} style={{ fontSize: '18px', color: '#666' }}>Enter your details to generate a personalized yoga plan:</Text>
                    <SimpleGrid columns={2} gap={4} justifyContent="center" style={{ padding: '2cm' }}>
                        <Input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <Input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <Input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <Select value={experience} onChange={(e) => setExperience(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="beginner" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '50px' }}>Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </Select>
                    </SimpleGrid>
                </Box>
                <Button colorScheme="blue" onClick={generateYogaPlan} isLoading={loading} loadingText="Generating..." mt={4} style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #ccc' }}>Generate Plan</Button>
                {error && (
                    <Box mt={4} color="red.500">
                        <Text>{error}</Text>
                    </Box>
                )}
                {plan && (
                    <Box mt={4}>
                        <Heading as="h2" size="md" mb={2}>Your Yoga Plan:</Heading>
                        <Text>{plan}</Text>
                    </Box>
                )}
            </Box>


            <Footer />
        </>
    );
}
