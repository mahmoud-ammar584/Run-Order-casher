import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    HStack,
    VStack,
    Input,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    useDisclosure,
    Badge,
    IconButton,
    Image,
    Switch,
    InputGroup,
    InputLeftElement,
    Heading,
    Card,
    CardBody,
    useToast,
    Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';

const ItemsPage = () => {
    const { tr, locale } = useLanguage();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const toast = useToast();

    const [formData, setFormData] = useState<{
        name_ar: string;
        name_en: string;
        description_ar: string;
        category_id: string;
        base_price: string | number;
        sku: string;
        barcode: string;
        image_url: string;
        is_active: boolean;
        is_available: boolean;
        display_order?: number;
    }>({
        name_ar: '',
        name_en: '',
        description_ar: '',
        category_id: '',
        base_price: '',
        sku: '',
        barcode: '',
        image_url: '',
        is_active: true,
        is_available: true,
        display_order: 0,
    });

    useEffect(() => {
        loadItems();
        loadCategories();
    }, []);

    const loadItems = async () => {
        try {
            const response = await axios.get(`${API_BASE}/items`);
            setItems(response.data);
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleOpenModal = (item: any = null) => {
        const defaultCategoryId = categories.length > 0 ? categories[0].id : '';

        if (item) {
            setEditingItem(item);
            setFormData({
                name_ar: item.name_ar,
                name_en: item.name_en,
                description_ar: item.description_ar || '',
                category_id: item.category_id || defaultCategoryId,
                base_price: item.base_price.toString(),
                sku: item.sku,
                barcode: item.barcode || '',
                image_url: item.image_url || '',
                is_active: item.is_active,
                is_available: item.is_available,
                display_order: item.display_order || 0,
            });
        } else {
            setEditingItem(null);
            setFormData({
                name_ar: '',
                name_en: '',
                description_ar: '',
                category_id: defaultCategoryId,
                base_price: '',
                sku: '',
                barcode: '',
                image_url: '',
                is_active: true,
                is_available: true,
                display_order: 0,
            });
        }
        onOpen();
    };

    const handleSave = async () => {
        try {
            if (!formData.name_ar.trim()) {
                toast({
                    title: tr('خطأ في الإدخال', 'Validation error'),
                    description: tr('الاسم العربي مطلوب', 'Arabic name is required'),
                    status: 'error',
                    duration: 3000
                });
                return;
            }

            if (!formData.name_en.trim()) {
                toast({
                    title: tr('خطأ في الإدخال', 'Validation error'),
                    description: tr('الاسم الإنجليزي مطلوب', 'English name is required'),
                    status: 'error',
                    duration: 3000
                });
                return;
            }

            if (!formData.category_id || formData.category_id === '') {
                toast({
                    title: tr('خطأ في الإدخال', 'Validation error'),
                    description: tr('اختر التصنيف', 'Please select a category'),
                    status: 'error',
                    duration: 3000
                });
                return;
            }

            if (!formData.sku.trim()) {
                toast({
                    title: tr('خطأ في الإدخال', 'Validation error'),
                    description: tr('SKU مطلوب', 'SKU is required'),
                    status: 'error',
                    duration: 3000
                });
                return;
            }

            const submitData: any = {
                ...formData,
                base_price: parseFloat(String(formData.base_price)) || 0,
            };

            if (formData.display_order !== undefined) {
                submitData.display_order = formData.display_order;
            }

            if (editingItem) {
                await axios.patch(`${API_BASE}/items/${editingItem.id}`, submitData);
                toast({ title: tr('تم التحديث بنجاح', 'Updated successfully'), status: 'success', duration: 2000 });
            } else {
                await axios.post(`${API_BASE}/items`, submitData);
                toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success', duration: 2000 });
            }
            loadItems();
            onClose();
        } catch (error: any) {
            console.error('Error saving item:', error);
            toast({
                title: tr('حدث خطأ', 'Error'),
                description: error.response?.data?.message || tr('تعذر حفظ الصنف', 'Failed to save item'),
                status: 'error',
                duration: 2000
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من حذف الصنف؟', 'Are you sure you want to delete this item?'))) return;

        try {
            await axios.delete(`${API_BASE}/items/${id}`);
            toast({ title: tr('تم الحذف بنجاح', 'Deleted successfully'), status: 'success', duration: 2000 });
            loadItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast({ title: tr('خطأ', 'Error'), status: 'error', duration: 2000 });
        }
    };

    const toggleAvailability = async (item: any) => {
        try {
            await axios.patch(`${API_BASE}/items/${item.id}/toggle-availability`);
            loadItems();
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const getItemName = (item: any) => {
        return locale === 'ar' ? item.name_ar : (item.name_en || item.name_ar);
    };

    const getCategoryName = (category: any) => {
        if (!category) return '-';
        return locale === 'ar' ? category.name_ar : (category.name_en || category.name_ar);
    };

    const filteredItems = items.filter(
        (item) =>
            item.name_ar.includes(searchQuery)
            || item.name_en?.toLowerCase().includes(searchQuery.toLowerCase())
            || item.sku?.includes(searchQuery)
    );

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <Heading size="lg">{tr('إدارة الأصناف', 'Manage Items')}</Heading>
                    <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        onClick={() => handleOpenModal()}
                        size="lg"
                        isDisabled={categories.length === 0}
                    >
                        {tr('إضافة صنف جديد', 'Add New Item')}
                    </Button>
                </HStack>

                <Card>
                    <CardBody>
                        <HStack spacing={4}>
                            <InputGroup flex={2}>
                                <InputLeftElement>
                                    <FiSearch />
                                </InputLeftElement>
                                <Input
                                    placeholder={tr('ابحث بالاسم أو SKU...', 'Search by name or SKU...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                        </HStack>
                    </CardBody>
                </Card>

                {categories.length === 0 && (
                    <Card>
                        <CardBody>
                            <Box textAlign="center" py={8}>
                                <Text>{tr('جارٍ تحميل التصنيفات...', 'Loading categories...')}</Text>
                            </Box>
                        </CardBody>
                    </Card>
                )}

                <Card>
                    <CardBody p={0}>
                        <Table variant="simple">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th>{tr('الصورة', 'Image')}</Th>
                                    <Th>{tr('الاسم', 'Name')}</Th>
                                    <Th>{tr('التصنيف', 'Category')}</Th>
                                    <Th>SKU</Th>
                                    <Th>{tr('السعر', 'Price')}</Th>
                                    <Th>{tr('الحالة', 'Status')}</Th>
                                    <Th>{tr('متاح للبيع', 'Available')}</Th>
                                    <Th>{tr('إجراءات', 'Actions')}</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredItems.map((item) => (
                                    <Tr key={item.id} _hover={{ bg: 'gray.50' }}>
                                        <Td>
                                            {item.image_url && (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name_ar}
                                                    boxSize="50px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                />
                                            )}
                                        </Td>
                                        <Td>
                                            <VStack align="start" spacing={0}>
                                                <Box fontWeight="bold">{getItemName(item)}</Box>
                                                <Box fontSize="sm" color="gray.600">
                                                    {locale === 'ar' ? item.name_en : item.name_ar}
                                                </Box>
                                            </VStack>
                                        </Td>
                                        <Td>{getCategoryName(item.category)}</Td>
                                        <Td>
                                            <Badge colorScheme="purple">{item.sku}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme="green" fontSize="md">
                                                {item.base_price} {tr('ج.م', 'EGP')}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={item.is_active ? 'green' : 'gray'}>
                                                {item.is_active ? tr('نشط', 'Active') : tr('غير نشط', 'Inactive')}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Switch
                                                isChecked={item.is_available}
                                                onChange={() => toggleAvailability(item)}
                                                colorScheme="green"
                                            />
                                        </Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    icon={<FiEdit2 />}
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                    onClick={() => handleOpenModal(item)}
                                                    aria-label={tr('تعديل', 'Edit')}
                                                />
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(item.id)}
                                                    aria-label={tr('حذف', 'Delete')}
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingItem ? tr('تعديل صنف', 'Edit Item') : tr('إضافة صنف جديد', 'Add New Item')}
                    </ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>{tr('الاسم (عربي)', 'Name (Arabic)')}</FormLabel>
                                    <Input
                                        value={formData.name_ar}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_ar: e.target.value })
                                        }
                                        placeholder={tr('مثال: برجر كلاسيك', 'Example: Classic Burger')}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{tr('الاسم (English)', 'Name (English)')}</FormLabel>
                                    <Input
                                        value={formData.name_en}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_en: e.target.value })
                                        }
                                        placeholder="Example: Classic Burger"
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel>{tr('التصنيف', 'Category')}</FormLabel>
                                <Select
                                    value={formData.category_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category_id: e.target.value })
                                    }
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{getCategoryName(cat)}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>{tr('السعر (ج.م)', 'Price (EGP)')}</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.base_price}
                                        onChange={(e) =>
                                            setFormData({ ...formData, base_price: e.target.value })
                                        }
                                        placeholder="0.00"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>SKU</FormLabel>
                                    <Input
                                        value={formData.sku}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sku: e.target.value })
                                        }
                                        placeholder="BRG001"
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel>{tr('الباركود', 'Barcode')}</FormLabel>
                                <Input
                                    value={formData.barcode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, barcode: e.target.value })
                                    }
                                    placeholder="1234567890"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>{tr('رابط الصورة', 'Image URL')}</FormLabel>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image_url: e.target.value })
                                    }
                                    placeholder="https://..."
                                />
                            </FormControl>

                            <HStack w="full" spacing={4}>
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">{tr('نشط', 'Active')}</FormLabel>
                                    <Switch
                                        isChecked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_active: e.target.checked })
                                        }
                                        colorScheme="green"
                                    />
                                </FormControl>
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel mb="0">{tr('متاح للبيع', 'Available for sale')}</FormLabel>
                                    <Switch
                                        isChecked={formData.is_available}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_available: e.target.checked,
                                            })
                                        }
                                        colorScheme="green"
                                    />
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            {tr('إلغاء', 'Cancel')}
                        </Button>
                        <Button colorScheme="blue" onClick={handleSave}>
                            {editingItem ? tr('حفظ التعديلات', 'Save changes') : tr('إضافة', 'Add')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ItemsPage;
