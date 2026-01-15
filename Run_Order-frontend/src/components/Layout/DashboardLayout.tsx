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
import { FiGrid, FiPackage, FiSettings, FiSave, FiChevronDown, FiChevronRight, FiDollarSign, FiBarChart2, FiSliders } from 'react-icons/fi';
import GlobalHeader from '../GlobalHeader';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardLayout = () => {
    const location = useLocation();
    const [dashboardOpen, setDashboardOpen] = useState(true);
    const { tr } = useLanguage();

    const navItems = [
        {
            name: tr('لوحة التحكم', 'Dashboard'),
            icon: FiGrid,
            path: '#',
            hasSubmenu: true,
            subItems: [
                { name: tr('التصنيفات', 'Categories'), path: '/dashboard/categories' },
                { name: tr('الأصناف', 'Items'), path: '/dashboard/items' },
            ],
        },
        { name: tr('المخزون', 'Inventory'), icon: FiPackage, path: '/dashboard/inventory' },
        { name: tr('الوصفات', 'Recipes'), icon: FiSave, path: '/dashboard/recipes' },
        { name: tr('التقارير', 'Reports'), icon: FiBarChart2, path: '/dashboard/reports' },
        { name: tr('الحسابات', 'Accounting'), icon: FiDollarSign, path: '/dashboard/accounting' },
        { name: tr('الطاولات', 'Tables'), icon: FiSettings, path: '/dashboard/tables' },
        { name: tr('الإعدادات', 'Settings'), icon: FiSliders, path: '/dashboard/settings' },
    ];

    return (
                        <Box p={6} borderBottom="1px" borderColor="whiteAlpha.300">
                            <Text
                                fontSize="2xl"
                                fontWeight="black"
                                bgGradient="linear(to-r, blue.200, green.200)"
                                bgClip="text"
                                letterSpacing="tight"
                            >
                                Run Order
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                                {tr('نظام إدارة المطاعم الذكي', 'Smart restaurant management')}
                            </Text>
                        </Box>

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
                                                                bg: location.pathname === subItem.path ? 'blue.600' : 'whiteAlpha.200',
                                                            }}
                                                            _active={{
                                                                bg: location.pathname === subItem.path ? 'blue.700' : 'whiteAlpha.300',
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
                                                bg: location.pathname === item.path ? 'blue.600' : 'whiteAlpha.200',
                                            }}
                                            _active={{
                                                bg: location.pathname === item.path ? 'blue.700' : 'whiteAlpha.300',
                                            }}
                                        >
                                            {item.name}
                                        </Button>
                                    )}
                                </Box>
                            ))}
                        </VStack>

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
                                    bgGradient: 'linear(to-r, green.500, green.700)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                transition="all 0.2s"
                            >
                                {tr('فتح نقطة البيع', 'Open POS')}
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
                                    bgGradient: 'linear(to-r, orange.500, orange.700)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                transition="all 0.2s"
                            >
                                {tr('فتح شاشة المطبخ', 'Open KDS')}
                            </Button>
                        </VStack>
                    </VStack >
                </Box >

    <Box flex={1} overflow="auto">
        <Outlet />
    </Box>
            </Flex >
        </Box >
    );
};

export default DashboardLayout;
