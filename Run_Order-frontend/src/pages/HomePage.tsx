import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardBody,
    Button,
    Icon,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiGrid, FiMonitor } from 'react-icons/fi';
import GlobalHeader from '../components/GlobalHeader';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage = () => {
    const { locale } = useLanguage();

    const menuItems = [
        {
            title: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard',
            description: locale === 'ar' ? 'إدارة الأقسام والأصناف' : 'Manage Categories & Items',
            icon: FiGrid,
            path: '/dashboard/categories',
            color: 'blue',
        },
        {
            title: locale === 'ar' ? 'نقطة البيع' : 'POS',
            description: locale === 'ar' ? 'نظام البيع والطلبات' : 'Sales & Orders System',
            icon: FiShoppingBag,
            path: '/pos',
            color: 'green',
        },
        {
            title: locale === 'ar' ? 'شاشة المطبخ' : 'Kitchen Display',
            description: locale === 'ar' ? 'عرض الطلبات للمطبخ' : 'Display Orders for Kitchen',
            icon: FiMonitor,
            path: '/kds',
            color: 'orange',
        },
    ];

    return (
        <>
            <GlobalHeader />
            <Box minH="100vh" bgGradient="linear(to-br, gray.50, gray.100)" _dark={{ bgGradient: 'linear(to-br, gray.900, gray.800)' }} py={20}>
                <Container maxW="6xl">
                    <VStack spacing={12} align="stretch">
                        {/* Header */}
                        <VStack spacing={4} textAlign="center">
                            <Box
                                fontSize={{ base: '5xl', md: '7xl' }}
                                fontWeight="bold"
                                bgGradient="linear(to-r, blue.500, purple.600)"
                                bgClip="text"
                                mb={4}
                            >
                                ⚡ Run Order
                            </Box>
                            <Heading
                                fontSize={{ base: '2xl', md: '3xl' }}
                                fontWeight="semibold"
                                color="gray.700"
                                _dark={{ color: 'gray.200' }}
                            >
                                {locale === 'ar' ? 'نظام إدارة المطاعم الذكي' : 'Smart Restaurant Management System'}
                            </Heading>
                            <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }} maxW="2xl">
                                {locale === 'ar'
                                    ? 'إدارة شاملة للطلبات، القوائم، المطبخ والطاولات - حلول احترافية لمطعمك'
                                    : 'Comprehensive management for orders, menus, kitchen and tables - Professional solutions for your restaurant'
                                }
                            </Text>
                        </VStack>

                        {/* Menu Cards */}
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                            {menuItems.map((item) => (
                                <Card
                                    key={item.path}
                                    _hover={{
                                        transform: 'translateY(-4px)',
                                        boxShadow: 'xl',
                                    }}
                                    transition="all 0.3s"
                                    cursor="pointer"
                                    as={Link}
                                    to={item.path}
                                    textDecoration="none"
                                >
                                    <CardBody>
                                        <VStack spacing={4} align="center">
                                            <Box
                                                p={4}
                                                borderRadius="full"
                                                bg={`${item.color}.100`}
                                                color={`${item.color}.600`}
                                            >
                                                <Icon as={item.icon} boxSize={10} />
                                            </Box>
                                            <VStack spacing={1}>
                                                <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                                                    {item.title}
                                                </Heading>
                                                <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="sm" textAlign="center">
                                                    {item.description}
                                                </Text>
                                            </VStack>
                                            <Button
                                                colorScheme={item.color}
                                                size="sm"
                                                w="full"
                                            >
                                                {locale === 'ar' ? 'فتح' : 'Open'}
                                            </Button>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>

                        {/* Footer Info */}
                        <Box
                            mt={8}
                            p={6}
                            bg="white"
                            _dark={{ bg: 'gray.800' }}
                            borderRadius="lg"
                            boxShadow="sm"
                            textAlign="center"
                        >
                            <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="sm">
                                ⚡ Run Order - {locale === 'ar' ? 'نظام إدارة المطاعم الاحترافي' : 'Professional Restaurant Management System'} © 2024
                            </Text>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </>
    );
};

export default HomePage;
