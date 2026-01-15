import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    VStack,
    HStack,
    Button,
    Text,
    Badge,
    Image,
    Input,
    IconButton,
    Divider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    useToast,
    Radio,
    RadioGroup,
    Stack,
    Flex,
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiShoppingCart, FiTrash2, FiMinus, FiPrinter, FiGlobe } from 'react-icons/fi';
import { MdRestaurant, MdShoppingBag, MdDeliveryDining, MdTableRestaurant, MdPayment } from 'react-icons/md';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { API_BASE } from '../../config';
import { usePOSStore } from '../../store/posStore';
import { OrderType } from '../../types/definitions';
import { useLanguage } from '../../contexts/LanguageContext';

const InvoiceModal = ({ isOpen, onClose, orderData }: { isOpen: boolean; onClose: () => void; orderData: any }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { tr } = useLanguage();
    const currencyLabel = tr('ج.م', 'EGP');

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    if (!orderData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{tr('فاتورة البيع', 'Sales Invoice')}</ModalHeader>
                <ModalBody>
                    <Box ref={printRef} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="white">
                        <VStack spacing={4} align="stretch">
                            <Box textAlign="center" borderBottom="1px" borderColor="gray.200" pb={4}>
                                <Text fontSize="2xl" fontWeight="bold">Run Order Restaurant</Text>
                                <Text fontSize="sm" color="gray.500">{tr('فاتورة ضريبية', 'Tax Invoice')}</Text>
                                <Text fontSize="sm">{new Date().toLocaleString()}</Text>
                            </Box>

                            <HStack justify="space-between">
                                <Text>{tr('رقم الطلب', 'Order #')}</Text>
                                <Text fontWeight="bold">{orderData.order_number || 'PENDING'}</Text>
                            </HStack>
                            {orderData.table_number && (
                                <HStack justify="space-between">
                                    <Text>{tr('الطاولة', 'Table')}</Text>
                                    <Text fontWeight="bold">{orderData.table_number}</Text>
                                </HStack>
                            )}

                            <Divider />

                            <VStack align="stretch" spacing={2}>
                                {orderData.items.map((item: any, index: number) => (
                                    <HStack key={index} justify="space-between">
                                        <Text>{item.quantity}x {item.item_name || tr('صنف', 'Item')}</Text>
                                        <Text>{item.total_price.toFixed(2)} {currencyLabel}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Divider />

                            <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                    <Text>{tr('الإجمالي الفرعي', 'Subtotal')}</Text>
                                    <Text>{orderData.subtotal.toFixed(2)} {currencyLabel}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>{tr('الضريبة (14%)', 'Tax (14%)')}</Text>
                                    <Text>{orderData.tax_amount.toFixed(2)} {currencyLabel}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">{tr('الإجمالي', 'Total')}</Text>
                                    <Text fontWeight="bold" fontSize="lg">{orderData.total.toFixed(2)} {currencyLabel}</Text>
                                </HStack>
                            </VStack>

                            <Box textAlign="center" pt={4}>
                                <Flex justify="center">
                                    <QRCode value={`RunOrder-Invoice-${orderData.total}-${new Date().toISOString()}`} size={128} />
                                </Flex>
                                <Text fontSize="xs" mt={2} color="gray.500">
                                    {tr('امسح لاستلام الفاتورة الإلكترونية', 'Scan for e-invoice')}
                                </Text>
                            </Box>
                        </VStack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button leftIcon={<FiPrinter />} colorScheme="blue" onClick={handlePrint} mr={3}>
                        {tr('طباعة', 'Print')}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        {tr('إغلاق', 'Close')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const POSPage = () => {
    const { tr, locale, setLocale } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [lastOrder, setLastOrder] = useState<any>(null);

    const previousLocaleRef = useRef(locale);
    const { isOpen: isCheckoutOpen, onOpen: onCheckoutOpen, onClose: onCheckoutClose } = useDisclosure();
    const { isOpen: isTablesOpen, onOpen: onTablesOpen, onClose: onTablesClose } = useDisclosure();
    const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();
    const toast = useToast();

    const {
        cartItems,
        orderType,
        tableNumber,
        customerName,
        customerPhone,
        notes,
        setOrderType,
        setCustomerInfo,
        addToCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        resetCart,
    } = usePOSStore();

    const currencyLabel = tr('ج.م', 'EGP');

    useEffect(() => {
        previousLocaleRef.current = locale;
    }, []);

    useEffect(() => {
        const loadPosLanguage = async () => {
            try {
                const response = await axios.get(`${API_BASE}/settings/pos-language`);
                const posLanguage = response.data?.pos_language;
                if (posLanguage === 'ar' || posLanguage === 'en') {
                    setLocale(posLanguage, { persist: false });
                }
            } catch (error) {
                console.error('Error loading POS language:', error);
            }
        };

        loadPosLanguage();
        return () => {
            setLocale(previousLocaleRef.current, { persist: false });
        };
    }, []);

    useEffect(() => {
        loadCategories();
        loadItems();
        loadTables();
    }, []);

    const getLocalizedName = (entity: any) => {
        if (!entity) return '';
        return locale === 'ar' ? entity.name_ar : (entity.name_en || entity.name_ar);
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/categories/active`);
            setCategories(response.data);
            if (response.data.length > 0) {
                setSelectedCategory(response.data[0].id);
            } else {
                toast({
                    title: tr('لا توجد تصنيفات', 'No categories found'),
                    description: tr('يرجى إضافة تصنيفات من لوحة التحكم أولًا.', 'Please add categories from the dashboard first.'),
                    status: 'warning',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error('Error loading categories:', error);
            toast({
                title: tr('تعذر تحميل التصنيفات', 'Failed to load categories'),
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 5000,
            });
        }
    };

    const loadItems = async () => {
        try {
            const response = await axios.get(`${API_BASE}/items/available`);
            setItems(response.data);
            if (response.data.length === 0) {
                toast({
                    title: tr('لا توجد أصناف', 'No items found'),
                    description: tr('يرجى إضافة الأصناف من لوحة التحكم أولًا.', 'Please add items from the dashboard first.'),
                    status: 'warning',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error('Error loading items:', error);
            toast({
                title: tr('تعذر تحميل الأصناف', 'Failed to load items'),
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 5000,
            });
        }
    };

    const loadTables = async () => {
        try {
            const response = await axios.get(`${API_BASE}/tables`);
            setTables(response.data);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    };

    const handleTableSelect = (table: any) => {
        if (table.status === 'occupied') {
            toast({
                title: tr('الطاولة مشغولة', 'Table is occupied'),
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        setCustomerInfo('tableNumber', table.table_number);
        onTablesClose();
        toast({
            title: tr(`تم اختيار الطاولة ${table.table_number}`, `Table ${table.table_number} selected`),
            status: 'success',
            duration: 2000,
        });
    };

    const filteredItems = items.filter((item) => {
        const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query
            || item.name_ar?.includes(searchQuery)
            || item.name_en?.toLowerCase().includes(query)
            || item.sku?.toLowerCase().includes(query);
        return matchesCategory && item.is_available && matchesQuery;
    });

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast({
                title: tr('السلة فارغة', 'Cart is empty'),
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        if (orderType === OrderType.DINE_IN && !tableNumber) {
            toast({
                title: tr('يرجى اختيار طاولة', 'Please select a table'),
                status: 'warning',
                duration: 2000,
            });
            onTablesOpen();
            return;
        }

        try {
            const apiOrderItems = cartItems.map((cartItem) => {
                const unitPrice = cartItem.total_price / cartItem.quantity;
                return {
                    item_id: cartItem.item.id,
                    quantity: cartItem.quantity,
                    unit_price: unitPrice,
                    total_price: cartItem.total_price,
                    selected_modifiers: cartItem.selected_modifiers || null,
                    special_instructions: cartItem.special_instructions || null,
                };
            });

            const invoiceItems = cartItems.map((cartItem) => ({
                ...cartItem,
                item_name: locale === 'ar' ? cartItem.item.name_ar : (cartItem.item.name_en || cartItem.item.name_ar),
                unit_price: cartItem.total_price / cartItem.quantity,
            }));

            const orderPayload = {
                order_type: orderType,
                table_number: tableNumber || null,
                customer_name: customerName || null,
                customer_phone: customerPhone || null,
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax_amount: parseFloat(taxAmount.toFixed(2)),
                discount_amount: parseFloat((discountAmount || 0).toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                payment_method: paymentMethod === 'visa' ? 'card' : paymentMethod,
                items: apiOrderItems,
                notes: notes || null,
            };

            const response = await axios.post(`${API_BASE}/orders`, orderPayload);

            toast({
                title: tr('تم إنشاء الطلب بنجاح', 'Order created successfully'),
                status: 'success',
                duration: 3000,
            });

            setLastOrder({
                ...orderPayload,
                order_number: response.data.order_number,
                items: invoiceItems,
            });

            resetCart();
            onCheckoutClose();
            onInvoiceOpen();
            loadTables();
        } catch (error: any) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || error.message || tr('تعذر إنشاء الطلب', 'Failed to create order');
            toast({
                title: tr('حدث خطأ', 'Error'),
                description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleToggleLocale = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar', { persist: false });
    };

    return (
        <Box h="100vh" bg="gray.50" overflow="hidden">
            <Grid templateColumns="1fr 400px" h="full">
                <Box p={4} overflowY="auto">
                    <HStack justify="space-between" mb={4}>
                        <Text fontSize="2xl" fontWeight="bold">
                            {tr('نقطة البيع', 'Point of Sale')}
                        </Text>
                        <Button size="sm" variant="outline" leftIcon={<FiGlobe />} onClick={handleToggleLocale}>
                            {locale === 'ar' ? 'EN' : 'ع'}
                        </Button>
                    </HStack>

                    <InputGroup mb={4} size="lg">
                        <InputLeftElement>
                            <FiSearch />
                        </InputLeftElement>
                        <Input
                            placeholder={tr('ابحث عن صنف...', 'Search for an item...')}
                            bg="white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>

                    <HStack spacing={3} mb={4} overflowX="auto" pb={2}>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                size="lg"
                                minW="120px"
                                colorScheme={selectedCategory === cat.id ? 'blue' : 'gray'}
                                variant={selectedCategory === cat.id ? 'solid' : 'outline'}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {getLocalizedName(cat)}
                            </Button>
                        ))}
                    </HStack>

                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                        {filteredItems.map((item) => (
                            <Box
                                key={item.id}
                                bg="white"
                                borderRadius="xl"
                                overflow="hidden"
                                boxShadow="md"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                                onClick={() => addToCart(item, {})}
                            >
                                <Image
                                    src={item.image_url}
                                    alt={getLocalizedName(item)}
                                    h="150px"
                                    w="full"
                                    objectFit="cover"
                                />
                                <VStack p={3} align="stretch" spacing={2}>
                                    <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                        {getLocalizedName(item)}
                                    </Text>
                                    <HStack justify="space-between">
                                        <Badge colorScheme="green" fontSize="md" px={2} py={1} borderRadius="md">
                                            {item.base_price} {currencyLabel}
                                        </Badge>
                                        <IconButton
                                            icon={<FiPlus />}
                                            size="sm"
                                            colorScheme="blue"
                                            aria-label={tr('إضافة', 'Add')}
                                        />
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>

                <Box bg="white" borderLeft="1px" borderColor="gray.200" display="flex" flexDir="column">
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                        <HStack justify="space-between" mb={3}>
                            <HStack>
                                <FiShoppingCart size={24} />
                                <Text fontSize="xl" fontWeight="bold">
                                    {tr('سلة الطلب', 'Order Cart')}
                                </Text>
                            </HStack>
                            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                {cartItems.length} {tr('صنف', 'Items')}
                            </Badge>
                        </HStack>

                        <HStack spacing={2} mb={3}>
                            <Button
                                size="sm"
                                leftIcon={<MdRestaurant />}
                                colorScheme={orderType === OrderType.DINE_IN ? 'blue' : 'gray'}
                                variant={orderType === OrderType.DINE_IN ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.DINE_IN)}
                                flex={1}
                            >
                                {tr('محلي', 'Dine In')}
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<MdShoppingBag />}
                                colorScheme={orderType === OrderType.TAKEOUT ? 'blue' : 'gray'}
                                variant={orderType === OrderType.TAKEOUT ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.TAKEOUT)}
                                flex={1}
                            >
                                {tr('تيك أواي', 'Takeout')}
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<MdDeliveryDining />}
                                colorScheme={orderType === OrderType.DELIVERY ? 'blue' : 'gray'}
                                variant={orderType === OrderType.DELIVERY ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.DELIVERY)}
                                flex={1}
                            >
                                {tr('توصيل', 'Delivery')}
                            </Button>
                        </HStack>

                        {orderType === OrderType.DINE_IN && (
                            <Button
                                w="full"
                                leftIcon={<MdTableRestaurant />}
                                colorScheme={tableNumber ? 'green' : 'gray'}
                                variant="outline"
                                onClick={onTablesOpen}
                            >
                                {tableNumber ? tr(`طاولة رقم ${tableNumber}`, `Table ${tableNumber}`) : tr('اختيار طاولة', 'Select table')}
                            </Button>
                        )}
                    </Box>

                    <VStack flex={1} overflowY="auto" p={4} spacing={3} align="stretch">
                        {cartItems.length === 0 ? (
                            <VStack justify="center" h="full" opacity={0.5}>
                                <FiShoppingCart size={64} />
                                <Text fontSize="lg" color="gray.500">
                                    {tr('السلة فارغة', 'Cart is empty')}
                                </Text>
                            </VStack>
                        ) : (
                            cartItems.map((cartItem, index) => (
                                <Box
                                    key={index}
                                    p={3}
                                    bg="gray.50"
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                >
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontWeight="bold" flex={1}>
                                            {getLocalizedName(cartItem.item)}
                                        </Text>
                                        <IconButton
                                            icon={<FiTrash2 />}
                                            size="xs"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => removeFromCart(index)}
                                            aria-label={tr('حذف', 'Remove')}
                                        />
                                    </HStack>

                                    <HStack justify="space-between">
                                        <HStack>
                                            <IconButton
                                                icon={<FiMinus />}
                                                size="sm"
                                                onClick={() => updateQuantity(index, cartItem.quantity - 1)}
                                                aria-label={tr('تقليل', 'Decrease')}
                                            />
                                            <Text fontWeight="bold" minW="30px" textAlign="center">
                                                {cartItem.quantity}
                                            </Text>
                                            <IconButton
                                                icon={<FiPlus />}
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => updateQuantity(index, cartItem.quantity + 1)}
                                                aria-label={tr('زيادة', 'Increase')}
                                            />
                                        </HStack>
                                        <Text fontWeight="bold" color="blue.600">
                                            {cartItem.total_price.toFixed(2)} {currencyLabel}
                                        </Text>
                                    </HStack>
                                </Box>
                            ))
                        )}
                    </VStack>

                    <Box p={4} borderTop="1px" borderColor="gray.200">
                        <VStack spacing={2} mb={4}>
                            <HStack justify="space-between" w="full">
                                <Text>{tr('الإجمالي الفرعي', 'Subtotal')}:</Text>
                                <Text fontWeight="bold">{subtotal.toFixed(2)} {currencyLabel}</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                                <Text>{tr('الضريبة (14%)', 'Tax (14%)')}:</Text>
                                <Text fontWeight="bold">{taxAmount.toFixed(2)} {currencyLabel}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between" w="full">
                                <Text fontSize="lg" fontWeight="bold">
                                    {tr('الإجمالي', 'Total')}:
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {total.toFixed(2)} {currencyLabel}
                                </Text>
                            </HStack>
                        </VStack>

                        <Button
                            colorScheme="green"
                            size="lg"
                            w="full"
                            isDisabled={cartItems.length === 0}
                            onClick={onCheckoutOpen}
                        >
                            {tr('إتمام الدفع', 'Checkout')}
                        </Button>
                    </Box>
                </Box>
            </Grid>

            <Modal isOpen={isTablesOpen} onClose={onTablesClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{tr('اختيار الطاولة', 'Select Table')}</ModalHeader>
                    <ModalBody pb={6}>
                        <SimpleGrid columns={4} spacing={4}>
                            {tables.map((table) => (
                                <Button
                                    key={table.id}
                                    h="100px"
                                    colorScheme={table.status === 'available' ? 'green' : 'red'}
                                    variant={table.status === 'available' ? 'outline' : 'solid'}
                                    onClick={() => handleTableSelect(table)}
                                    isDisabled={table.status === 'occupied'}
                                    flexDir="column"
                                    gap={2}
                                >
                                    <MdTableRestaurant size={24} />
                                    <Text>{tr('طاولة', 'Table')} {table.table_number}</Text>
                                    <Text fontSize="xs">
                                        {table.status === 'available'
                                            ? tr('متاحة', 'Available')
                                            : tr('مشغولة', 'Occupied')}
                                    </Text>
                                </Button>
                            ))}
                        </SimpleGrid>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isCheckoutOpen} onClose={onCheckoutClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{tr('إتمام الدفع', 'Checkout')}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <HStack justify="space-between" w="full">
                                    <Text fontSize="lg" fontWeight="bold">
                                        {tr('الإجمالي المستحق', 'Amount due')}:
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                        {total.toFixed(2)} {currencyLabel}
                                    </Text>
                                </HStack>
                            </Box>

                            <Box>
                                <Text fontWeight="bold" mb={3}>{tr('طريقة الدفع', 'Payment method')}:</Text>
                                <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
                                    <Stack direction="row" spacing={4}>
                                        <Box
                                            as="label"
                                            cursor="pointer"
                                            borderWidth="1px"
                                            borderRadius="md"
                                            p={3}
                                            flex={1}
                                            bg={paymentMethod === 'cash' ? 'blue.50' : 'white'}
                                            borderColor={paymentMethod === 'cash' ? 'blue.500' : 'gray.200'}
                                        >
                                            <Radio value="cash" mb={2}>{tr('نقدي', 'Cash')}</Radio>
                                            <Flex justify="center"><MdPayment size={24} /></Flex>
                                        </Box>
                                        <Box
                                            as="label"
                                            cursor="pointer"
                                            borderWidth="1px"
                                            borderRadius="md"
                                            p={3}
                                            flex={1}
                                            bg={paymentMethod === 'visa' ? 'blue.50' : 'white'}
                                            borderColor={paymentMethod === 'visa' ? 'blue.500' : 'gray.200'}
                                        >
                                            <Radio value="visa" mb={2}>{tr('بطاقة', 'Card')}</Radio>
                                            <Flex justify="center"><MdPayment size={24} /></Flex>
                                        </Box>
                                    </Stack>
                                </RadioGroup>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCheckoutClose}>
                            {tr('إلغاء', 'Cancel')}
                        </Button>
                        <Button colorScheme="green" onClick={handleCheckout} size="lg">
                            {tr('تأكيد الدفع', 'Confirm payment')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <InvoiceModal isOpen={isInvoiceOpen} onClose={onInvoiceClose} orderData={lastOrder} />
        </Box>
    );
};

export default POSPage;
