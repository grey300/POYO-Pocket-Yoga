import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Card, CardBody, Image, Stack, Heading, Text, Divider, ButtonGroup, Button, Grid, GridItem } from '@chakra-ui/react';

export default function Yogoclass() {
  const cards = [
    {
      id: 1,
      imageSrc: '/images/tree.svg',
      title: 'Tree',
      disp: 'Stand in Tadasana'
    },
    {
      id: 2,
      imageSrc: '/images/chair.svg',
      title: 'Chair',
      disp: 'Stand in Utkatasana'
    },
    {
      id: 3,
      imageSrc: '/images/cobra.svg',
      title: 'Cobra',
      disp: 'Stand in Bhujangasana'
    },
    {
      id: 4,
      imageSrc: '/images/warrior2.svg',
      title: 'Warrior II',
      disp: 'Stand in Virabhadrasana II'
    },
    {
      id: 5,
      imageSrc: '/images/dog.svg',
      title: 'Dog',
      disp: 'Stand in Tadasana'
    },
    {
      id: 6,
      imageSrc: '/images/shoulderstand.svg',
      title: 'Shoulderstand',
      disp: 'Stand in Salamba Sarvangasana'
    },
    {
      id: 7,
      imageSrc: '/images/triangle.svg',
      title: 'Triangle',
      disp: 'Stand in Adho Mukha Svanasana'
    },
    {
      id: 8,
      imageSrc: '/images/childpose.svg',
      title: 'Child’s Pose',
      disp: 'Stand in Balasana'
    }
  ];

  return (
    <div>
      <NavBar />
      <div className='py-24'>
        <img
          src='/images/yogaclass.svg'
          width={500}
          height={300}
          className='flex justify-center items-center mx-auto'
          alt='Yoga Class'
        />
        <Grid templateColumns='repeat(3, 1fr)' gap={12} m={36}>
          {cards.map((card) => (
            <GridItem key={card.id}>
              <Card maxW='sm'>
                <CardBody>
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    borderRadius='lg'
                    className='flex justify-center items-center mx-auto py-2'
                  />
                  <Stack mt='6' spacing='2' className='px-12'>
                    <Heading size='md' className='px-2'>
                      {card.title}
                    </Heading>
                    <ButtonGroup spacing='2' justifyContent='space-between' className='py-1'>
                      <Text fontSize='2xl' className='p-2'>
                        {card.disp}
                      </Text>
                      <Link to={`/yoga-pose/${card.id}`}>
                        <Button
                          className='border p-2 hover:text-black'
                          borderRadius='10'
                          borderColor='#5DA145'
                          color={'#5DA145'}
                        >
                          View Details
                        </Button>
                      </Link>
                    </ButtonGroup>
                  </Stack>
                </CardBody>
                <Divider />
              </Card>
            </GridItem>
          ))}
        </Grid>
      </div>
      <Footer />
    </div>
  );
}
