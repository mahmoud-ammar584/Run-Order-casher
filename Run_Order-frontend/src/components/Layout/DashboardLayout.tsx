import {
    Box,
    Flex,
    VStack,
    Button,
    Text,
    Icon,
    Collapse,
} from '@chakra-ui/react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiSettings, FiSave, FiChevronDown, FiChevronRight, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import GlobalHeader from '../GlobalHeader';
import { useState } from 'react';

const DashboardLayout = () => {
    const location = useLocation();
    const [dashboardOpen, setDashboardOpen] = useState(true);

    const navItems = [
        {
            name: 'لوحة التحكم',
            icon: FiGrid,
            path: '#',
            hasSubmenu: true,
            subItems: [
                { name: 'الأقسام', path: '/dashboard/categories' },
                { name: 'الأصناف', path: '/dashboard/items' },
            ]
        },
        { name: 'المخزون', icon: FiPackage, path: '/dashboard/inventory' },
        { name: 'الوصفات', icon: FiSave, path: '/dashboard/recipes' },
        { name: 'التقارير', icon: FiBarChart2, path: '/dashboard/reports' },
        { name: 'المحاسبة', icon: FiDollarSign, path: '/dashboard/accounting' },
        { name: 'الطاولات', icon: FiSettings, path: '/dashboard/tables' },
    ];

    return (
        <Box h="100vh" bg="gray.50">
            <GlobalHeader />
            <Flex h="calc(100vh - 60px)">
                {/* Modern Sidebar */}
                <Box
                    w="280px"
                    bg="linear-gradient(180deg, #1a365d 0%, #2a4365 100%)"
                    color="white"
                    display={{ base: 'none', md: 'block' }}
                    boxShadow="2xl"
                >
                    <VStack align="stretch" spacing={0} h="full">
                        {/* Logo */}
                        <Box p={6} borderBottom="1px" borderColor="whiteAlpha.300">
                            <Text
                                fontSize="2xl"
                                fontWeight="black"
                                bgGradient="linear(to-r, blue.200, green.200)"
                                bgClip="text"
                                letterSpacing="tight"
                            >
                                ⚡ Run Order
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                                نظام إدارة المطاعم الذكي
                            </Text>
                        </Box>

                        {/* Navigation */}
                        <VStack align="stretch" spacing={1} p={4} flex={1} overflowY="auto">
                            {navItems.map((item) => (
                                <Box key={item.name}>
                                    {item.hasSubmenu ? (
                                        <>
                                            <Button
                                                onClick={() => setDashboardOpen(!dashboardOpen)}
                                                leftIcon={<Icon as={item.icon} />}
                                                rightIcon={<Icon as={dashboardOpen ? FiChevronDown : FiChevronRight} />}
                                                variant="ghost"
                                                colorScheme="whiteAlpha"
                                                justifyContent="space-between"
                                                size="lg"
                                                w="full"
                                                _hover={{ bg: 'whiteAlpha.200' }}
                                                color="white"
                                            >
                                                {item.name}
                                            </Button>
                                            <Collapse in={dashboardOpen}>
                                                <VStack align="stretch" pl={4} mt={1} spacing={1}>
                                                    {item.subItems?.map((subItem) => (
                                                        <Button
                                                            key={subItem.path}
                                                            as={Link}
                                                            to={subItem.path}
                                                            variant={location.pathname === subItem.path ? 'solid' : 'ghost'}
                                                            colorScheme={location.pathname === subItem.path ? 'blue' : 'whiteAlpha'}
                                                            justifyContent="flex-start"
                                                            size="md"
                                                            fontSize="sm"
                                                            color={location.pathname === subItem.path ? 'white' : 'whiteAlpha.900'}
                                                            bg={location.pathname === subItem.path ? 'blue.500' : 'transparent'}
                                                            _hover={{
                                                                bg: location.pathname === subItem.path ? 'blue.600' : 'whiteAlpha.200'
                                                            }}
                                                            _active={{
                                                                bg: location.pathname === subItem.path ? 'blue.700' : 'whiteAlpha.300'
                                                            }}
                                                        >
                                                            {subItem.name}
                                                        </Button>
                                                    ))}
                                                </VStack>
                                            </Collapse>
                                        </>
                                    ) : (
                                        <Button
                                            as={Link}
                                            to={item.path}
                                            leftIcon={<Icon as={item.icon} />}
                                            variant={location.pathname === item.path ? 'solid' : 'ghost'}
                                            colorScheme={location.pathname === item.path ? 'blue' : 'whiteAlpha'}
                                            justifyContent="flex-start"
                                            size="lg"
                                            color={location.pathname === item.path ? 'white' : 'whiteAlpha.900'}
                                            bg={location.pathname === item.path ? 'blue.500' : 'transparent'}
                                            _hover={{
                                                bg: location.pathname === item.path ? 'blue.600' : 'whiteAlpha.200'
                                            }}
                                            _active={{
                                                bg: location.pathname === item.path ? 'blue.700' : 'whiteAlpha.300'
                                            }}
                                        >
                                            {item.name}
                                        </Button>
                                    )}
                                </Box>
                            ))}
                        </VStack>

                        {/* Footer Links */}
                        <VStack p={4} spacing={3} borderTop="1px" borderColor="whiteAlpha.300">
                            <Button
                                as={Link}
                                to="/pos"
                                bgGradient="linear(to-r, green.400, green.600)"
                                color="white"
                                size="lg"
                                w="full"
                                fontWeight="bold"
                                _hover={{
                                    bgGradient: "linear(to-r, green.500, green.700)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                }}
                                transition="all 0.2s"
                            >
                                🛒 فتح نقطة البيع
                            </Button>
                            <Button
                                as={Link}
                                to="/kds"
                                bgGradient="linear(to-r, orange.400, orange.600)"
                                color="white"
                                size="lg"
                                w="full"
                                fontWeight="bold"
                                _hover={{
                                    bgGradient: "linear(to-r, orange.500, orange.700)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                }}
                                transition="all 0.2s"
                            >
                                🍳 شاشة المطبخ
                            </Button>
                        </VStack>
                    </VStack>
                </Box>

                {/* Main Content */}
                <Box flex={1} overflow="auto">
                    <Outlet />
                </Box>
            </Flex>
        </Box>
    );
};

export default DashboardLayout;
