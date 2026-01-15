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
import { useLanguage } from '../../contexts/LanguageContext';

const COLORS = ['#3182ce', '#38a169', '#dd6b20', '#d53f8c', '#805ad5'];

const ReportsPage = () => {
    const { tr, locale } = useLanguage();
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

    if (!dailySales) return <Box p={6}>{tr('جار تحميل التقارير...', 'Loading reports...')}</Box>;

    const paymentMethodData = salesAnalytics?.byPaymentMethod ? Object.entries(salesAnalytics.byPaymentMethod).map(([method, data]: any) => ({
        name: method === 'cash' ? tr('نقدي', 'Cash') : method === 'card' ? tr('بطاقة', 'Card') : method,
        value: data.revenue,
        count: data.count,
    })) : [];

    const orderTypeData = salesAnalytics?.byOrderType ? Object.entries(salesAnalytics.byOrderType).map(([type, data]: any) => ({
        name: type === 'dine_in' ? tr('محلي', 'Dine In') : type === 'takeout' ? tr('تيك أواي', 'Takeout') : tr('توصيل', 'Delivery'),
        value: data.revenue,
        count: data.count,
    })) : [];

    return (
        <Box p={6} bg="gray.50" minH="100vh">
            <HStack justify="space-between" mb={6}>
                <Heading size="lg" color="gray.800">{tr('التقارير والتحليلات', 'Reports & Analytics')}</Heading>
                <Select w="200px" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="today">{tr('اليوم', 'Today')}</option>
                    <option value="week">{tr('آخر 7 أيام', 'Last 7 days')}</option>
                    <option value="month">{tr('آخر 30 يوم', 'Last 30 days')}</option>
                </Select>
            </HStack>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>{tr('المبيعات', 'Sales')}</Tab>
                    <Tab>{tr('التحليلات', 'Analytics')}</Tab>
                    <Tab>{tr('المخزون', 'Inventory')}</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card bg="blue.500" color="white">
                                <CardBody>
                                    <Stat>
                                        <StatLabel color="white">{tr('مبيعات اليوم', "Today's sales")}</StatLabel>
                                        <StatNumber color="white">{Number(dailySales.totalRevenue).toFixed(2)} {tr('ج.م', 'EGP')}</StatNumber>
                                        <StatHelpText color="whiteAlpha.800">
                                            <StatArrow type="increase" />
                                            {dailySales.totalOrders} {tr('طلب', 'orders')}
                                        </StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>

                            {salesAnalytics?.summary && (
                                <>
                                    <Card>
                                        <CardBody>
                                            <Stat>
                                                <StatLabel>{tr('متوسط قيمة الطلب', 'Average order value')}</StatLabel>
                                                <StatNumber color="green.600">
                                                    {salesAnalytics.summary.averageOrderValue.toFixed(2)} {tr('ج.م', 'EGP')}
                                                </StatNumber>
                                                <StatHelpText>{salesAnalytics.summary.totalOrders} {tr('طلب', 'orders')}</StatHelpText>
                                            </Stat>
                                        </CardBody>
                                    </Card>
                                    <Card>
                                        <CardBody>
                                            <Stat>
                                                <StatLabel>{tr('أصناف منخفضة المخزون', 'Low stock items')}</StatLabel>
                                                <StatNumber color="red.500">{lowStock.length}</StatNumber>
                                                <StatHelpText>{tr('تحتاج متابعة', 'Needs attention')}</StatHelpText>
                                            </Stat>
                                        </CardBody>
                                    </Card>
                                </>
                            )}
                        </SimpleGrid>

                        <Card h="400px" mb={6}>
                            <CardHeader>
                                <Heading size="md">{tr('مبيعات حسب الساعة', 'Sales by hour')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailySales.salesByHour}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="amount" name={tr('المبيعات', 'Sales')} stroke="#3182ce" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardBody>
                        </Card>

                        <Card h="400px">
                            <CardHeader>
                                <Heading size="md">{tr('أفضل 5 أصناف مبيعًا', 'Top 5 items')}</Heading>
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

                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                            <Card h="350px">
                                <CardHeader>
                                    <Heading size="md">{tr('المبيعات حسب وسيلة الدفع', 'Sales by payment method')}</Heading>
                                </CardHeader>
                                <CardBody>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentMethodData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name={tr('الإيراد', 'Revenue')} fill="#38a169" />
                                            <Bar dataKey="count" name={tr('عدد الطلبات', 'Orders')} fill="#3182ce" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardBody>
                            </Card>

                            <Card h="350px">
                                <CardHeader>
                                    <Heading size="md">{tr('المبيعات حسب نوع الطلب', 'Sales by order type')}</Heading>
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

                    <TabPanel>
                        <Card>
                            <CardHeader>
                                <Heading size="md" color="red.500">{tr('الأصناف منخفضة المخزون', 'Low stock items')}</Heading>
                            </CardHeader>
                            <CardBody>
                                {lowStock.length === 0 ? (
                                    <Text textAlign="center" color="gray.500" py={8}>{tr('لا توجد أصناف منخفضة المخزون', 'No low stock items')}</Text>
                                ) : (
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>{tr('المكون', 'Ingredient')}</Th>
                                                <Th isNumeric>{tr('الكمية', 'Quantity')}</Th>
                                                <Th isNumeric>{tr('حد الطلب', 'Reorder point')}</Th>
                                                <Th>{tr('الحالة', 'Status')}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {lowStock.map((item) => (
                                                <Tr key={item.id}>
                                                    <Td fontWeight="bold">{locale === 'ar' ? item.name_ar : (item.name_en || item.name_ar)}</Td>
                                                    <Td isNumeric>{item.current_stock} {item.unit}</Td>
                                                    <Td isNumeric>{item.reorder_point}</Td>
                                                    <Td>
                                                        <Badge colorScheme="red">{tr('منخفض', 'Low')}</Badge>
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
