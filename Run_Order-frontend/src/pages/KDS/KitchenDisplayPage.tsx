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

const WS_URL = 'http://localhost:3000';

const KitchenDisplayPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [orders, setOrders] = useState<any[]>([]);

    // تحديث الوقت كل ثانية
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load pending orders
    useEffect(() => {
        loadOrders();

        // Setup WebSocket connection
        const socket = io(WS_URL);

        socket.on('new-order', (order) => {
            console.log('New order received:', order);
            loadOrders();
        });

        socket.on('order-status-updated', (data) => {
            console.log('Order status updated:', data);
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
            case 'dine_in': return 'داخلي';
            case 'takeout': return 'تيك أواي';
            case 'delivery': return 'توصيل';
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
            {/* الهيدر */}
            <Box bg="gray.800" p={4} borderBottom="2px" borderColor="gray.700">
                <HStack justify="space-between">
                    <HStack spacing={4}>
                        <FiPackage size={32} color="#3182ce" />
                        <VStack align="start" spacing={0}>
                            <Heading size="lg" color="white">
                                شاشة المطبخ
                            </Heading>
                            <Text fontSize="sm" color="gray.400">
                                Kitchen Display System
                            </Text>
                        </VStack>
                    </HStack>
                    <VStack align="end" spacing={0}>
                        <Text fontSize="3xl" fontWeight="bold">
                            {currentTime.toLocaleTimeString('ar-EG')}
                        </Text>
                        <Text fontSize="md" color="gray.400">
                            {currentTime.toLocaleDateString('ar-EG', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </VStack>
                </HStack>
            </Box>

            {/* الإحصائيات السريعة */}
            <HStack spacing={4} p={4} bg="gray.800">
                <Card bg="blue.600" color="white" flex={1}>
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="sm">طلبات جديدة</Text>
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
                                <Text fontSize="sm">قيد التحضير</Text>
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
                                <Text fontSize="sm">جاهز</Text>
                                <Text fontSize="3xl" fontWeight="bold">
                                    {readyOrders.length}
                                </Text>
                            </VStack>
                            <FiCheck size={40} />
                        </HStack>
                    </CardBody>
                </Card>
            </HStack>

            {/* الطلبات */}
            <Grid templateColumns="repeat(3, 1fr)" gap={4} p={4} h="calc(100vh - 240px)" overflowY="auto">
                {/* عمود الطلبات الجديدة */}
                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="blue" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        طلبات جديدة ({pendingOrders.length})
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
                                                    {order.table_number && ` - طاولة ${order.table_number}`}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Badge
                                            colorScheme={elapsed > 10 ? 'red' : elapsed > 5 ? 'orange' : 'green'}
                                            fontSize="lg"
                                            p={2}
                                        >
                                            {elapsed} دقيقة
                                        </Badge>
                                    </HStack>
                                </CardHeader>
                                <CardBody pt={2}>
                                    <VStack align="stretch" spacing={2}>
                                        {order.items?.map((item: any, idx: number) => (
                                            <Box key={idx} p={2} bg="white" borderRadius="md">
                                                <Text fontWeight="bold">
                                                    {item.quantity}x {item.item?.name_ar || item.name || 'صنف'}
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
                                        بدء التحضير
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })}
                </VStack>

                {/* عمود قيد التحضير */}
                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="orange" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        قيد التحضير ({preparingOrders.length})
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
                                            {elapsed} دقيقة
                                        </Badge>
                                    </HStack>
                                </CardHeader>
                                <CardBody pt={2}>
                                    <VStack align="stretch" spacing={2}>
                                        {order.items?.map((item: any, idx: number) => (
                                            <Box key={idx} p={2} bg="white" borderRadius="md">
                                                <Text fontWeight="bold">
                                                    {item.quantity}x {item.item?.name_ar || 'صنف'}
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
                                        الطلب جاهز ✓
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })}
                </VStack>

                {/* عمود الطلبات الجاهزة */}
                <VStack spacing={4} align="stretch">
                    <Badge colorScheme="green" fontSize="lg" p={2} textAlign="center" borderRadius="md">
                        جاهز ({readyOrders.length})
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
                                        ✓ جاهز
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
                                    تم التسليم
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
