import { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    HStack,
    Select,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import axios from 'axios';
import { API_BASE } from '../../config';

const COLORS = ['#3182ce', '#38a169', '#dd6b20', '#d53f8c', '#805ad5'];

const ReportsPage = () => {
    const [dailySales, setDailySales] = useState<any>(null);
    const [topItems, setTopItems] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [salesAnalytics, setSalesAnalytics] = useState<any>(null);
    const [period, setPeriod] = useState('today');

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        try {
            const endDate = new Date().toISOString();
            let startDate = new Date();

            if (period === 'week') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (period === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else {
                startDate.setHours(0, 0, 0, 0);
            }

            const [salesRes, itemsRes, stockRes, analyticsRes] = await Promise.all([
                axios.get(`${API_BASE}/reports/daily-sales`),
                axios.get(`${API_BASE}/reports/top-items`),
                axios.get(`${API_BASE}/reports/low-stock`),
                axios.get(`${API_BASE}/reports/sales-analytics?startDate=${startDate.toISOString()}&endDate=${endDate}`),
            ]);

            setDailySales(salesRes.data);
            setTopItems(itemsRes.data);
            setLowStock(stockRes.data);
            setSalesAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    };

    if (!dailySales) return <Box p={6}>جاري تحميل التقارير...</Box>;

    const paymentMethodData = salesAnalytics?.byPaymentMethod ? Object.entries(salesAnalytics.byPaymentMethod).map(([method, data]: any) => ({
        name: method === 'cash' ? 'نقدي' : method === 'card' ? 'بطاقة' : method,
        value: data.revenue,
        count: data.count,
    })) : [];

    const orderTypeData = salesAnalytics?.byOrderType ? Object.entries(salesAnalytics.byOrderType).map(([type, data]: any) => ({
        name: type === 'dine_in' ? 'داخل المطعم' : type === 'takeout' ? 'تيك أواي' : 'توصيل',
        value: data.revenue,
        count: data.count,
    })) : [];

    return (
        <Box p={6} bg="gray.50" minH="100vh">
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">لوحة التقارير والتحليلات</Heading>
                <Select w="200px" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="today">اليوم</option>
                    <option value="week">آخر 7 أيام</option>
                    <option value="month">آخر 30 يوم</option>
                </Select>
            </HStack>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>المبيعات</Tab>
                    <Tab>التحليلات</Tab>
                    <Tab>المخزون</Tab>
                </TabList>

                <TabPanels>
                    {/* Sales Tab */}
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card bg="blue.500" color="white">
                                <CardBody>
                                    <Stat>
                                        <StatLabel color="white">مبيعات اليوم</StatLabel>
                                        <StatNumber color="white">{Number(dailySales.totalRevenue).toFixed(2)} ر.س</StatNumber>
                                        <StatHelpText color="whiteAlpha.800">
                                            <StatArrow type="increase" />
                                            {dailySales.totalOrders} طلبات
                                        </StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>

                            {salesAnalytics?.summary && (
                                <>
                                    <Card>
                                        <CardBody>
                                            <Stat>
                                                <StatLabel>متوسط قيمة الطلب</StatLabel>
                                                <StatNumber color="green.600">
                                                    {salesAnalytics.summary.averageOrderValue.toFixed(2)} ر.س
                                                </StatNumber>
                                                <StatHelpText>{salesAnalytics.summary.totalOrders} طلب</StatHelpText>
                                            </Stat>
                                        </CardBody>
                                    </Card>
                                    <Card>
                                        <CardBody>
                                            <Stat>
                                                <StatLabel>تنبيهات المخزون</StatLabel>
                                                <StatNumber color="red.500">{lowStock.length}</StatNumber>
                                                <StatHelpText>مكونات منخفضة</StatHelpText>
                                            </Stat>
                                        </CardBody>
                                    </Card>
                                </>
                            )}
                        </SimpleGrid>

                        <Card h="400px" mb={6}>
                            <CardHeader>
                                <Heading size="md">المبيعات بالساعة</Heading>
                            </CardHeader>
                            <CardBody>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailySales.salesByHour}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="amount" name="المبيعات (ر.س)" stroke="#3182ce" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>

                        <Card h="400px">
                            <CardHeader>
                                <Heading size="md">أعلى 5 أصناف مبيعاً</Heading>
                            </CardHeader>
                            <CardBody>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topItems}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="quantity"
                                        >
                                            {topItems.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            <Card h="350px">
                                <CardHeader>
                                    <Heading size="md">المبيعات حسب طريقة الدفع</Heading>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentMethodData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="الإيرادات (ر.س)" fill="#38a169" />
                                            <Bar dataKey="count" name="عدد الطلبات" fill="#3182ce" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>

                            <Card h="350px">
                                <CardHeader>
                                    <Heading size="md">المبيعات حسب نوع الطلب</Heading>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={orderTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                dataKey="value"
                                            >
                                                {orderTypeData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    </TabPanel>

                    {/* Inventory Tab */}
                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md" color="red.500">تنبيهات المخزون المنخفض</Heading>
                            </CardHeader>
                            <CardBody>
                                {lowStock.length === 0 ? (
                                    <Text textAlign="center" color="gray.500" py={8}>لا توجد تنبيهات للمخزون</Text>
                                ) : (
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>المكون</Th>
                                                <Th isNumeric>الكمية الحالية</Th>
                                                <Th isNumeric>حد الطلب</Th>
                                                <Th>الحالة</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {lowStock.map((item) => (
                                                <Tr key={item.id}>
                                                    <Td fontWeight="bold">{item.name_ar}</Td>
                                                    <Td isNumeric>{item.current_stock} {item.unit}</Td>
                                                    <Td isNumeric>{item.reorder_point}</Td>
                                                    <Td>
                                                        <Badge colorScheme="red">منخفض جداً</Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ReportsPage;
