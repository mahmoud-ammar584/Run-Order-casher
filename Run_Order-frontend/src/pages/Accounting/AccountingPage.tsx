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
import { useLanguage } from '../../contexts/LanguageContext';

const AccountingPage = () => {
    const { tr, locale } = useLanguage();
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

    const currencyLabel = tr('ج.م', 'EGP');

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
            toast({ title: tr('البيانات غير مكتملة', 'Incomplete data'), status: 'warning' });
            return;
        }

        try {
            await axios.post(`${API_BASE}/accounting/expenses`, formData);
            toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success' });
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
            toast({ title: tr('خطأ في الإضافة', 'Add failed'), status: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من الحذف؟', 'Are you sure you want to delete?'))) return;
        try {
            await axios.delete(`${API_BASE}/accounting/expenses/${id}`);
            toast({ title: tr('تم الحذف', 'Deleted'), status: 'success' });
            loadData();
        } catch (error) {
            toast({ title: tr('خطأ في الحذف', 'Delete failed'), status: 'error' });
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            purchase: tr('مشتريات', 'Purchases'),
            salary: tr('رواتب', 'Salaries'),
            rent: tr('إيجار', 'Rent'),
            utilities: tr('مرافق', 'Utilities'),
            maintenance: tr('صيانة', 'Maintenance'),
            other: tr('أخرى', 'Other'),
        };
        return labels[category] || category;
    };

    const renderPeriodCard = (title: string, data: any, colorScheme: string) => {
        if (!data) return null;
        const profit = data.profit?.netProfit || 0;
        const revenue = data.revenue?.totalRevenue || 0;
        const expensesTotal = data.expenses?.totalExpenses || 0;

        return (
            <Card bg={`${colorScheme}.50`} borderLeft="4px" borderColor={`${colorScheme}.500`}>
                <CardBody>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>{title}</Text>
                    <SimpleGrid columns={3} spacing={4}>
                        <Box>
                            <Text fontSize="xs" color="gray.500">{tr('الإيرادات', 'Revenue')}</Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                                {revenue.toFixed(2)} {currencyLabel}
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">{tr('المصروفات', 'Expenses')}</Text>
                            <Text fontSize="lg" fontWeight="bold" color="red.600">
                                {expensesTotal.toFixed(2)} {currencyLabel}
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="gray.500">{tr('صافي الربح', 'Net profit')}</Text>
                            <HStack>
                                <Text fontSize="lg" fontWeight="bold" color={profit >= 0 ? 'green.600' : 'red.600'}>
                                    {profit.toFixed(2)} {currencyLabel}
                                </Text>
                                {profit >= 0 ? <FiTrendingUp color="green" /> : <FiTrendingDown color="red" />}
                            </HStack>
                        </Box>
                    </SimpleGrid>
                    {data.profit?.profitMargin !== undefined && (
                        <Badge mt={2} colorScheme={data.profit.profitMargin >= 0 ? 'green' : 'red'}>
                            {tr('هامش الربح', 'Profit margin')}: {data.profit.profitMargin}%
                        </Badge>
                    )}
                </CardBody>
            </Card>
        );
    };

    return (
        <Box p={6} bg="gray.50" minH="100vh">
            <VStack spacing={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">{tr('المحاسبة والتقارير المالية', 'Accounting & Financial Reports')}</Text>

                {financialSummary && (
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>{tr('الملخص المالي', 'Financial Summary')}</Text>
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                            {renderPeriodCard(tr('اليوم', 'Today'), financialSummary.today, 'blue')}
                            {renderPeriodCard(tr('هذا الأسبوع', 'This week'), financialSummary.thisWeek, 'purple')}
                            {renderPeriodCard(tr('هذا الشهر', 'This month'), financialSummary.thisMonth, 'teal')}
                        </SimpleGrid>
                    </Box>
                )}

                <Divider />

                {financialSummary?.today?.expenses?.byCategory && (
                    <Card>
                        <CardBody>
                            <Text fontSize="lg" fontWeight="bold" mb={4}>{tr('المصروفات حسب الفئة (اليوم)', 'Expenses by category (today)')}</Text>
                            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                                {Object.entries(financialSummary.today.expenses.byCategory).map(([category, amount]: any) => (
                                    <Box key={category} p={3} bg="gray.50" borderRadius="md">
                                        <Text fontSize="sm" color="gray.600">{getCategoryLabel(category)}</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="red.500">{amount.toFixed(2)} {currencyLabel}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </CardBody>
                    </Card>
                )}

                <Card>
                    <CardBody>
                        <HStack justify="space-between" mb={6}>
                            <Text fontSize="xl" fontWeight="bold">{tr('سجل المصروفات', 'Expense log')}</Text>
                            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
                                {tr('إضافة مصروف', 'Add expense')}
                            </Button>
                        </HStack>

                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="gray.100">
                                    <Tr>
                                        <Th>{tr('التاريخ', 'Date')}</Th>
                                        <Th>{tr('الوصف', 'Description')}</Th>
                                        <Th>{tr('الفئة', 'Category')}</Th>
                                        <Th isNumeric>{tr('المبلغ', 'Amount')}</Th>
                                        <Th>{tr('إجراءات', 'Actions')}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {expenses.map((expense) => (
                                        <Tr key={expense.id}>
                                            <Td>{new Date(expense.expense_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</Td>
                                            <Td fontWeight="medium">{expense.description}</Td>
                                            <Td>
                                                <Badge colorScheme="orange">{getCategoryLabel(expense.category)}</Badge>
                                            </Td>
                                            <Td isNumeric color="red.600" fontWeight="bold">
                                                {Number(expense.amount).toFixed(2)} {currencyLabel}
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    aria-label={tr('حذف', 'Delete')}
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
                    <ModalHeader>{tr('إضافة مصروف جديد', 'Add new expense')}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>{tr('الوصف', 'Description')}</FormLabel>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={tr('مثال: فاتورة كهرباء', 'Example: Electricity bill')}
                                />
                            </FormControl>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>{tr('المبلغ', 'Amount')}</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{tr('التاريخ', 'Date')}</FormLabel>
                                    <Input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>{tr('الفئة', 'Category')}</FormLabel>
                                <Select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="purchase">{tr('مشتريات', 'Purchases')}</option>
                                    <option value="salary">{tr('رواتب', 'Salaries')}</option>
                                    <option value="rent">{tr('إيجار', 'Rent')}</option>
                                    <option value="utilities">{tr('مرافق', 'Utilities')}</option>
                                    <option value="maintenance">{tr('صيانة', 'Maintenance')}</option>
                                    <option value="other">{tr('أخرى', 'Other')}</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>{tr('ملاحظات (اختياري)', 'Notes (optional)')}</FormLabel>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder={tr('أي ملاحظات إضافية...', 'Any additional notes...')}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>{tr('إلغاء', 'Cancel')}</Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>{tr('إضافة', 'Add')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AccountingPage;
