import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    VStack,
    HStack,
    Text,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Heading,
} from '@chakra-ui/react';
import { FiClock, FiCheck, FiPackage } from 'react-icons/fi';
import { MdRestaurant, MdDeliveryDining, MdShoppingBag } from 'react-icons/md';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_BASE } from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';

const WS_URL = 'http://localhost:3000';

const KitchenDisplayPage = () => {
    const { tr, locale } = useLanguage();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadOrders();

        const socket = io(WS_URL);

        socket.on('new-order', () => {
            loadOrders();
        });

        socket.on('order-status-updated', () => {
            loadOrders();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const loadOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE}/orders/pending`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status: newStatus });
            loadOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const getElapsedTime = (createdAt: Date) => {
        const elapsed = Math.floor((currentTime.getTime() - new Date(createdAt).getTime()) / 60000);
        return elapsed;
    };

    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case 'dine_in': return <MdRestaurant size={24} />;
            case 'takeout': return <MdShoppingBag size={24} />;
            case 'delivery': return <MdDeliveryDining size={24} />;
            default: return null;
        }
    };

    const getOrderTypeText = (type: string) => {
        switch (type) {
            case 'dine_in': return tr('داخلي', 'Dine in');
            case 'takeout': return tr('تيك أواي', 'Takeout');
            case 'delivery': return tr('توصيل', 'Delivery');
            default: return '';
        }
    };

    const getCardColor = (elapsed: number) => {
        if (elapsed < 5) return 'white';
        if (elapsed < 10) return 'yellow.50';
        if (elapsed < 15) return 'orange.50';
        return 'red.50';
    };

    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const preparingOrders = orders.filter((o) => o.status === 'preparing');
    const readyOrders = orders.filter((o) => o.status === 'ready');

    return (
        <Box h="100vh" bg="gray.900" color="white" overflow="hidden">
            <Box bg="gray.800" p={4} borderBottom="2px" borderColor="gray.700">
                <HStack justify="space-between">
                    <HStack spacing={4}>
                        <FiPackage size={32} color="#3182ce" />
                        <VStack align="start" spacing={0}>
                            <Heading size="lg" color="white">
                                {tr('شاشة المطبخ', 'Kitchen Display')}
                            </Heading>
                            <Text fontSize="sm" color="gray.400">
                                {tr('نظام عرض الطلبات', 'Kitchen Display System')}
                            </Text>
                        </VStack>
                    </HStack>
                    <VStack align="end" spacing={0}>
                        <Text fontSize="3xl" fontWeight="bold">
                            {currentTime.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                        </Text>
                        <Text fontSize="md" color="gray.400">
                            {currentTime.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            <HStack spacing={4} p={4} bg="gray.800">
                <Card bg="blue.600" color="white" flex={1}>
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{tr('طلبات جديدة', 'New orders')}</Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {pendingOrders.length}
                                </Text>
                            </VStack>
                            <FiClock size={40} />
                        </HStack>
                    </CardBody>
                </Card>
                <Card bg="orange.600" color="white" flex={1}>
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{tr('قيد التحضير', 'Preparing')}</Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {preparingOrders.length}
                                </Text>
                            </VStack>
                            <FiPackage size={40} />
                        </HStack>
                    </CardBody>
                </Card>
                <Card bg="green.600" color="white" flex={1}>
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{tr('جاهز', 'Ready')}</Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {readyOrders.length}
                                </Text>
                            </VStack>
                            <FiCheck size={40} />
                        </HStack>
                    </CardBody>
                </Card>
            </HStack>

            <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} h="calc(100vh - 240px)" overflowY="auto">
                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="blue" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        {tr('طلبات جديدة', 'New orders')} ({pendingOrders.length})
                    </Badge>
                    {pendingOrders.map((order) => {
                        const elapsed = getElapsedTime(order.created_at);
                        return (
                            <Card
                                key={order.id}
                                bg={getCardColor(elapsed)}
                                color="gray.900"
                                borderWidth="2px"
                                borderColor={elapsed > 10 ? 'red.500' : 'blue.500'}
                            >
                                <CardHeader pb={2}>
                                    <HStack justify="space-between">
                                        <HStack>
                                            {getOrderTypeIcon(order.order_type)}
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {order.order_number}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {getOrderTypeText(order.order_type)}
                                                    {order.table_number && ` - ${tr('طاولة', 'Table')} ${order.table_number}`}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Badge
                                            colorScheme={elapsed > 10 ? 'red' : elapsed > 5 ? 'orange' : 'green'}
                                            fontSize="lg"
                                            p={2}
                                        >
                                            {elapsed} {tr('دقيقة', 'min')}
                                        </Badge>
                                    </HStack>
                                </CardHeader>
                                <CardBody pt={2}>
                                    <VStack align="stretch" spacing={2}>
                                        {order.items?.map((item: any, idx: number) => (
                                            <Box key={idx} p={2} bg="white" borderRadius="md">
                                                <Text fontWeight="bold">
                                                    {item.quantity}x {locale === 'ar' ? item.item?.name_ar : (item.item?.name_en || item.item?.name_ar) || item.name || tr('صنف', 'Item')}
                                                </Text>
                                            </Box>
                                        ))}
                                    </VStack>
                                    <Button
                                        mt={4}
                                        w="full"
                                        colorScheme="blue"
                                        size="lg"
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    >
                                        {tr('بدء التحضير', 'Start preparing')}
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })}
                </VStack>

                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="orange" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        {tr('قيد التحضير', 'Preparing')} ({preparingOrders.length})
                    </Badge>
                    {preparingOrders.map((order) => {
                        const elapsed = getElapsedTime(order.created_at);
                        return (
                            <Card
                                key={order.id}
                                bg={getCardColor(elapsed)}
                                color="gray.900"
                                borderWidth="2px"
                                borderColor="orange.500"
                            >
                                <CardHeader pb={2}>
                                    <HStack justify="space-between">
                                        <Text fontWeight="bold" fontSize="lg">
                                            {order.order_number}
                                        </Text>
                                        <Badge colorScheme={elapsed > 15 ? 'red' : 'orange'} fontSize="lg" p={2}>
                                            {elapsed} {tr('دقيقة', 'min')}
                                        </Badge>
                                    </HStack>
                                </CardHeader>
                                <CardBody pt={2}>
                                    <VStack align="stretch" spacing={2}>
                                        {order.items?.map((item: any, idx: number) => (
                                            <Box key={idx} p={2} bg="white" borderRadius="md">
                                                <Text fontWeight="bold">
                                                    {item.quantity}x {locale === 'ar' ? item.item?.name_ar : (item.item?.name_en || item.item?.name_ar) || tr('صنف', 'Item')}
                                                </Text>
                                            </Box>
                                        ))}
                                    </VStack>
                                    <Button
                                        mt={4}
                                        w="full"
                                        colorScheme="green"
                                        size="lg"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                    >
                                        {tr('الطلب جاهز', 'Mark ready')}
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })}
                </VStack>

                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="green" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        {tr('جاهز', 'Ready')} ({readyOrders.length})
                    </Badge>
                    {readyOrders.map((order) => (
                        <Card
                            key={order.id}
                            bg="green.50"
                            color="gray.900"
                            borderWidth="2px"
                            borderColor="green.500"
                        >
                            <CardHeader pb={2}>
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">
                                        {order.order_number}
                                    </Text>
                                    <Badge colorScheme="green" fontSize="lg" p={2}>
                                        {tr('جاهز', 'Ready')} ✓
                                    </Badge>
                                </HStack>
                            </CardHeader>
                            <CardBody pt={2}>
                                <Button
                                    mt={4}
                                    w="full"
                                    colorScheme="gray"
                                    size="lg"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                >
                                    {tr('تم التسليم', 'Delivered')}
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            </Grid>
        </Box>
    );
};

export default KitchenDisplayPage;
