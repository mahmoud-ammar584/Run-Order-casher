import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    Select,
    useDisclosure,
    HStack,
    IconButton,
    Text,
    VStack,
    Card,
    CardBody,
    SimpleGrid,
    Textarea,
    Badge,
    Divider,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';

const AccountingPage = () => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: 'purchase',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                axios.get(`${API_BASE}/accounting/expenses`),
                axios.get(`${API_BASE}/accounting/financial-summary`),
            ]);
            setExpenses(expensesRes.data);
            setFinancialSummary(summaryRes.data);
        } catch (error) {
            console.error('Error loading accounting data:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.description || formData.amount <= 0) {
            toast({ title: 'البيانات غير مكتملة', status: 'warning' });
            return;
        }

        try {
            await axios.post(`${API_BASE}/accounting/expenses`, formData);
            toast({ title: 'تمت الإضافة بنجاح', status: 'success' });
            onClose();
            loadData();
            setFormData({
                description: '',
                amount: 0,
                category: 'purchase',
                expense_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
        } catch (error) {
            toast({ title: 'خطأ في الإضافة', status: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await axios.delete(`${API_BASE}/accounting/expenses/${id}`);
            toast({ title: 'تم الحذف', status: 'success' });
            loadData();
        } catch (error) {
            toast({ title: 'خطأ في الحذف', status: 'error' });
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            purchase: 'مشتريات',
            salary: 'رواتب',
            rent: 'إيجار',
            utilities: 'مرافق',
            maintenance: 'صيانة',
            other: 'أخرى',
        };
        return labels[category] || category;
    };

    const renderPeriodCard = (title: string, data: any, colorScheme: string) => {
        if (!data) return null;
        const profit = data.profit?.netProfit || 0;
        const revenue = data.revenue?.totalRevenue || 0;
        const expenses = data.expenses?.totalExpenses || 0;

        return (
            <Card bg={`${colorScheme}.50`} borderLeft="4px" borderColor={`${colorScheme}.500`}>
                <CardBody>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>{title}</Text>
                    <SimpleGrid columns={3} spacing={4}>
                        <Box>
                            <Text fontSize="xs" color="gray.500">الإيرادات</Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                                {revenue.toFixed(2)} ر.س
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">المصروفات</Text>
                            <Text fontSize="lg" fontWeight="bold" color="red.600">
                                {expenses.toFixed(2)} ر.س
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">صافي الربح</Text>
                            <HStack>
                                <Text fontSize="lg" fontWeight="bold" color={profit >= 0 ? 'green.600' : 'red.600'}>
                                    {profit.toFixed(2)} ر.س
                                </Text>
                                {profit >= 0 ? <FiTrendingUp color="green" /> : <FiTrendingDown color="red" />}
                            </HStack>
                        </Box>
                    </SimpleGrid>
                    {data.profit?.profitMargin !== undefined && (
                        <Badge mt={2} colorScheme={data.profit.profitMargin >= 0 ? 'green' : 'red'}>
                            هامش الربح: {data.profit.profitMargin}%
                        </Badge>
                    )}
                </CardBody>
            </Card>
        );
    };

    return (
        <Box p={6} bg="gray.50" minH="100vh">
            <VStack spacing={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">المحاسبة والتقارير المالية</Text>

                {/* Financial Summary */}
                {financialSummary && (
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>الملخص المالي</Text>
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                            {renderPeriodCard('اليوم', financialSummary.today, 'blue')}
                            {renderPeriodCard('هذا الأسبوع', financialSummary.thisWeek, 'purple')}
                            {renderPeriodCard('هذا الشهر', financialSummary.thisMonth, 'teal')}
                        </SimpleGrid>
                    </Box>
                )}

                <Divider />

                {/* Expenses by Category */}
                {financialSummary?.today?.expenses?.byCategory && (
                    <Card>
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>المصروفات حسب الفئة (اليوم)</Text>
                            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                                {Object.entries(financialSummary.today.expenses.byCategory).map(([category, amount]: any) => (
                                    <Box key={category} p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600">{getCategoryLabel(category)}</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="red.500">{amount.toFixed(2)} ر.س</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </CardBody>
                    </Card>
                )}

                {/* Expenses Table */}
                <Card>
                    <CardBody>
                        <HStack justify="space-between" mb={6}>
                            <Text fontSize="xl" fontWeight="bold">سجل المصروفات</Text>
                            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
                                إضافة مصروف
                            </Button>
                        </HStack>

                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="gray.100">
                                    <Tr>
                                        <Th>التاريخ</Th>
                                        <Th>الوصف</Th>
                                        <Th>الفئة</Th>
                                        <Th isNumeric>المبلغ</Th>
                                        <Th>إجراءات</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {expenses.map((expense) => (
                                        <Tr key={expense.id}>
                                            <Td>{new Date(expense.expense_date).toLocaleDateString('ar')}</Td>
                                            <Td fontWeight="medium">{expense.description}</Td>
                                            <Td>
                                                <Badge colorScheme="orange">{getCategoryLabel(expense.category)}</Badge>
                                            </Td>
                                            <Td isNumeric color="red.600" fontWeight="bold">
                                                {Number(expense.amount).toFixed(2)} ر.س
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    aria-label="Delete"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(expense.id)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>إضافة مصروف جديد</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>الوصف</FormLabel>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="مثال: فاتورة كهرباء"
                                />
                            </FormControl>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>المبلغ</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>التاريخ</FormLabel>
                                    <Input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>الفئة</FormLabel>
                                <Select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="purchase">مشتريات</option>
                                    <option value="salary">رواتب</option>
                                    <option value="rent">إيجار</option>
                                    <option value="utilities">مرافق (كهرباء، ماء)</option>
                                    <option value="maintenance">صيانة</option>
                                    <option value="other">أخرى</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>ملاحظات (اختياري)</FormLabel>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="أي ملاحظات إضافية..."
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>إضافة</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AccountingPage;
