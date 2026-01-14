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
import { FiSearch, FiPlus, FiShoppingCart, FiTrash2, FiMinus, FiPrinter } from 'react-icons/fi';
import { MdRestaurant, MdShoppingBag, MdDeliveryDining, MdTableRestaurant, MdPayment } from 'react-icons/md';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { API_BASE } from '../../config';
import { usePOSStore } from '../../store/posStore';
import { OrderType } from '../../types/definitions';

// Invoice Modal Component
const InvoiceModal = ({ isOpen, onClose, orderData }: { isOpen: boolean; onClose: () => void; orderData: any }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore state
        }
    };

    if (!orderData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>فاتورة الطلب</ModalHeader>
                <ModalBody>
                    <Box ref={printRef} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="white">
                        <VStack spacing={4} align="stretch">
                            <Box textAlign="center" borderBottom="1px" borderColor="gray.200" pb={4}>
                                <Text fontSize="2xl" fontWeight="bold">Run Order Restaurant</Text>
                                <Text fontSize="sm" color="gray.500">Tax Invoice / فاتورة ضريبية</Text>
                                <Text fontSize="sm">{new Date().toLocaleString()}</Text>
                            </Box>

                            <HStack justify="space-between">
                                <Text>Order #:</Text>
                                <Text fontWeight="bold">{orderData.order_number || 'PENDING'}</Text>
                            </HStack>
                            {orderData.table_number && (
                                <HStack justify="space-between">
                                    <Text>Table:</Text>
                                    <Text fontWeight="bold">{orderData.table_number}</Text>
                                </HStack>
                            )}

                            <Divider />

                            <VStack align="stretch" spacing={2}>
                                {orderData.items.map((item: any, index: number) => (
                                    <HStack key={index} justify="space-between">
                                        <Text>{item.quantity}x {item.item_name || 'Item'}</Text>
                                        <Text>{(item.total_price).toFixed(2)}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Divider />

                            <VStack align="stretch" spacing={1}>
                                <HStack justify="space-between">
                                    <Text>Subtotal:</Text>
                                    <Text>{orderData.subtotal.toFixed(2)}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Tax (14%):</Text>
                                    <Text>{orderData.tax_amount.toFixed(2)}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text fontWeight="bold" fontSize="lg">Total:</Text>
                                    <Text fontWeight="bold" fontSize="lg">{orderData.total.toFixed(2)}</Text>
                                </HStack>
                            </VStack>

                            <Box textAlign="center" pt={4}>
                                <Flex justify="center">
                                    <QRCode value={`RunOrder-Invoice-${orderData.total}-${new Date().toISOString()}`} size={128} />
                                </Flex>
                                <Text fontSize="xs" mt={2} color="gray.500">Scan for e-invoice</Text>
                            </Box>
                        </VStack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button leftIcon={<FiPrinter />} colorScheme="blue" onClick={handlePrint} mr={3}>
                        طباعة
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        إغلاق
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const POSPage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [lastOrder, setLastOrder] = useState<any>(null);

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

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadItems();
        loadTables();
    }, []);


    const loadCategories = async () => {
        try {
            console.log('Loading categories from:', `${API_BASE}/categories/active`);
            const response = await axios.get(`${API_BASE}/categories/active`);
            console.log('Categories response:', response.data);
            setCategories(response.data);
            if (response.data.length > 0) {
                setSelectedCategory(response.data[0].id);
            } else {
                console.warn('No categories found');
                toast({
                    title: 'لا توجد أقسام',
                    description: 'يرجى إضافة أقسام من صفحة إدارة الأقسام',
                    status: 'warning',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error('Error loading categories:', error);
            toast({
                title: 'خطأ في تحميل الأقسام',
                description: error.response?.data?.message || error.message,
                status: 'error',
                duration: 5000,
            });
        }
    };

    const loadItems = async () => {
        try {
            console.log('Loading items from:', `${API_BASE}/items/available`);
            const response = await axios.get(`${API_BASE}/items/available`);
            console.log('Items response:', response.data);
            setItems(response.data);
            if (response.data.length === 0) {
                console.warn('No items found');
                toast({
                    title: 'لا توجد أصناف',
                    description: 'يرجى إضافة أصناف من صفحة إدارة الأصناف',
                    status: 'warning',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error('Error loading items:', error);
            toast({
                title: 'خطأ في تحميل الأصناف',
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
                title: 'الطاولة مشغولة',
                status: 'warning',
                duration: 2000,
            });
            return;
        }
        setCustomerInfo('tableNumber', table.table_number);
        onTablesClose();
        toast({
            title: `تم اختيار الطاولة ${table.table_number}`,
            status: 'success',
            duration: 2000,
        });
    };

    // فلترة الأصناف حسب القسم المختار
    const filteredItems = items.filter(
        (item) => item.category_id === selectedCategory && item.is_available
    );

    // إتمام الطلب
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast({
                title: 'السلة فارغة',
                status: 'warning',
                duration: 2000,
            });
            return;
        }

        if (orderType === OrderType.DINE_IN && !tableNumber) {
            toast({
                title: 'يرجى اختيار طاولة',
                status: 'warning',
                duration: 2000,
            });
            onTablesOpen();
            return;
        }

        try {
            // تحويل cartItems إلى الصيغة المطلوبة من الـ Backend
            const apiOrderItems = cartItems.map(cartItem => {
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

            // Prepare data for invoice (needs names)
            const invoiceItems = cartItems.map(cartItem => ({
                ...cartItem,
                item_name: cartItem.item.name_ar,
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
                items: apiOrderItems, // Send clean items to API
                notes: notes || null,
            };

            const response = await axios.post(`${API_BASE}/orders`, orderPayload);

            toast({
                title: 'تم إتمام الطلب بنجاح',
                status: 'success',
                duration: 3000,
            });

            // Prepare data for invoice
            setLastOrder({
                ...orderPayload,
                order_number: response.data.order_number,
                items: invoiceItems // Use items with names for invoice
            });

            resetCart();
            onCheckoutClose();
            onInvoiceOpen(); // Open invoice modal

            // Reload tables to update status if needed
            loadTables();
        } catch (error: any) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'لم نتمكن من إتمام الطلب';
            toast({
                title: 'حدث خطأ',
                description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box h="100vh" bg="gray.50" overflow="hidden">
            <Grid templateColumns="1fr 400px" h="full">
                {/* القسم الأيسر: الأقسام والأصناف */}
                <Box p={4} overflowY="auto">
                    {/* شريط البحث */}
                    <InputGroup mb={4} size="lg">
                        <InputLeftElement>
                            <FiSearch />
                        </InputLeftElement>
                        <Input
                            placeholder="ابحث عن صنف..."
                            bg="white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>

                    {/* الأقسام */}
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
                                {cat.name_ar}
                            </Button>
                        ))}
                    </HStack>

                    {/* الأصناف */}
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
                                    alt={item.name_ar}
                                    h="150px"
                                    w="full"
                                    objectFit="cover"
                                />
                                <VStack p={3} align="stretch" spacing={2}>
                                    <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                        {item.name_ar}
                                    </Text>
                                    <HStack justify="space-between">
                                        <Badge colorScheme="green" fontSize="md" px={2} py={1} borderRadius="md">
                                            {item.base_price} ج.م
                                        </Badge>
                                        <IconButton
                                            icon={<FiPlus />}
                                            size="sm"
                                            colorScheme="blue"
                                            aria-label="Add"
                                        />
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>

                {/* القسم الأيمن: السلة */}
                <Box bg="white" borderLeft="1px" borderColor="gray.200" display="flex" flexDir="column">
                    {/* رأس السلة */}
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                        <HStack justify="space-between" mb={3}>
                            <HStack>
                                <FiShoppingCart size={24} />
                                <Text fontSize="xl" fontWeight="bold">
                                    الطلب الحالي
                                </Text>
                            </HStack>
                            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                {cartItems.length} صنف
                            </Badge>
                        </HStack>

                        {/* نوع الطلب */}
                        <HStack spacing={2} mb={3}>
                            <Button
                                size="sm"
                                leftIcon={<MdRestaurant />}
                                colorScheme={orderType === OrderType.DINE_IN ? 'blue' : 'gray'}
                                variant={orderType === OrderType.DINE_IN ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.DINE_IN)}
                                flex={1}
                            >
                                داخلي
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<MdShoppingBag />}
                                colorScheme={orderType === OrderType.TAKEOUT ? 'blue' : 'gray'}
                                variant={orderType === OrderType.TAKEOUT ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.TAKEOUT)}
                                flex={1}
                            >
                                تيك أواي
                            </Button>
                            <Button
                                size="sm"
                                leftIcon={<MdDeliveryDining />}
                                colorScheme={orderType === OrderType.DELIVERY ? 'blue' : 'gray'}
                                variant={orderType === OrderType.DELIVERY ? 'solid' : 'outline'}
                                onClick={() => setOrderType(OrderType.DELIVERY)}
                                flex={1}
                            >
                                توصيل
                            </Button>
                        </HStack>

                        {/* زر اختيار الطاولة (يظهر فقط في حالة الداخلي) */}
                        {orderType === OrderType.DINE_IN && (
                            <Button
                                w="full"
                                leftIcon={<MdTableRestaurant />}
                                colorScheme={tableNumber ? 'green' : 'gray'}
                                variant="outline"
                                onClick={onTablesOpen}
                            >
                                {tableNumber ? `طاولة رقم ${tableNumber}` : 'اختر طاولة'}
                            </Button>
                        )}
                    </Box>

                    {/* قائمة السلة */}
                    <VStack flex={1} overflowY="auto" p={4} spacing={3} align="stretch">
                        {cartItems.length === 0 ? (
                            <VStack justify="center" h="full" opacity={0.5}>
                                <FiShoppingCart size={64} />
                                <Text fontSize="lg" color="gray.500">
                                    السلة فارغة
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
                                            {cartItem.item.name_ar}
                                        </Text>
                                        <IconButton
                                            icon={<FiTrash2 />}
                                            size="xs"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => removeFromCart(index)}
                                            aria-label="Remove"
                                        />
                                    </HStack>

                                    <HStack justify="space-between">
                                        <HStack>
                                            <IconButton
                                                icon={<FiMinus />}
                                                size="sm"
                                                onClick={() => updateQuantity(index, cartItem.quantity - 1)}
                                                aria-label="Decrease"
                                            />
                                            <Text fontWeight="bold" minW="30px" textAlign="center">
                                                {cartItem.quantity}
                                            </Text>
                                            <IconButton
                                                icon={<FiPlus />}
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => updateQuantity(index, cartItem.quantity + 1)}
                                                aria-label="Increase"
                                            />
                                        </HStack>
                                        <Text fontWeight="bold" color="blue.600">
                                            {cartItem.total_price.toFixed(2)} ج.م
                                        </Text>
                                    </HStack>
                                </Box>
                            ))
                        )}
                    </VStack>

                    {/* الإجماليات والدفع */}
                    <Box p={4} borderTop="1px" borderColor="gray.200">
                        <VStack spacing={2} mb={4}>
                            <HStack justify="space-between" w="full">
                                <Text>المجموع الفرعي:</Text>
                                <Text fontWeight="bold">{subtotal.toFixed(2)} ج.م</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                                <Text>الضريبة (14%):</Text>
                                <Text fontWeight="bold">{taxAmount.toFixed(2)} ج.م</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between" w="full">
                                <Text fontSize="lg" fontWeight="bold">
                                    الإجمالي:
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                    {total.toFixed(2)} ج.م
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
                            إتمام الطلب
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* نافذة اختيار الطاولة */}
            <Modal isOpen={isTablesOpen} onClose={onTablesClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>اختر الطاولة</ModalHeader>
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
                                    <Text>طاولة {table.table_number}</Text>
                                    <Text fontSize="xs">
                                        {table.status === 'available' ? 'متاح' : 'مشغول'}
                                    </Text>
                                </Button>
                            ))}
                        </SimpleGrid>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* نافذة إتمام الطلب */}
            <Modal isOpen={isCheckoutOpen} onClose={onCheckoutClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>إتمام الطلب</ModalHeader>
                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            {/* ملخص المبلغ */}
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <HStack justify="space-between" w="full">
                                    <Text fontSize="lg" fontWeight="bold">
                                        الإجمالي النهائي:
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                        {total.toFixed(2)} ج.م
                                    </Text>
                                </HStack>
                            </Box>

                            {/* وسائل الدفع */}
                            <Box>
                                <Text fontWeight="bold" mb={3}>وسيلة الدفع:</Text>
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
                                            <Radio value="cash" mb={2}>نقدي (Cash)</Radio>
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
                                            <Radio value="visa" mb={2}>فيزا (Visa)</Radio>
                                            <Flex justify="center"><MdPayment size={24} /></Flex>
                                        </Box>
                                    </Stack>
                                </RadioGroup>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onCheckoutClose}>
                            إلغاء
                        </Button>
                        <Button colorScheme="green" onClick={handleCheckout} size="lg">
                            تأكيد ودفع
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Invoice Modal */}
            <InvoiceModal isOpen={isInvoiceOpen} onClose={onInvoiceClose} orderData={lastOrder} />
        </Box>
    );
};

export default POSPage;
