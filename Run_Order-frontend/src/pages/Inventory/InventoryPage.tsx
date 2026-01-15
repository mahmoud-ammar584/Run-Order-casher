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
    Input,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    useDisclosure,
    HStack,
    IconButton,
    Text,
    Badge,
    Select,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';

interface Ingredient {
    id: string;
    name_ar: string;
    name_en: string;
    current_stock: number;
    unit: string;
    storage_unit: string;
    conversion_factor: number;
    cost_per_unit: number;
    reorder_point: number;
}

const InventoryPage = () => {
    const { tr, locale } = useLanguage();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        current_stock: 0,
        unit: 'g',
        storage_unit: 'kg',
        conversion_factor: 1000,
        cost_per_unit: 0,
        reorder_point: 10,
    });

    useEffect(() => {
        loadIngredients();
    }, []);

    const loadIngredients = async () => {
        try {
            const response = await axios.get(`${API_BASE}/inventory/ingredients`);
            setIngredients(response.data);
        } catch (error) {
            console.error('Error loading ingredients:', error);
            toast({
                title: tr('خطأ', 'Error'),
                description: tr('فشل تحميل المخزون', 'Failed to load inventory'),
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingIngredient) {
                await axios.patch(`${API_BASE}/inventory/ingredients/${editingIngredient.id}`, formData);
                toast({ title: tr('تم التحديث بنجاح', 'Updated successfully'), status: 'success' });
            } else {
                await axios.post(`${API_BASE}/inventory/ingredients`, formData);
                toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success' });
            }
            onClose();
            loadIngredients();
            setEditingIngredient(null);
            setFormData({
                name_ar: '',
                name_en: '',
                current_stock: 0,
                unit: 'g',
                storage_unit: 'kg',
                conversion_factor: 1000,
                cost_per_unit: 0,
                reorder_point: 10,
            });
        } catch (error) {
            toast({
                title: tr('خطأ', 'Error'),
                description: tr('فشل حفظ البيانات', 'Failed to save data'),
                status: 'error',
            });
        }
    };

    const handleEdit = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setFormData({
            name_ar: ingredient.name_ar,
            name_en: ingredient.name_en,
            current_stock: ingredient.current_stock,
            unit: ingredient.unit,
            storage_unit: ingredient.storage_unit || 'kg',
            conversion_factor: ingredient.conversion_factor || 1000,
            cost_per_unit: ingredient.cost_per_unit,
            reorder_point: ingredient.reorder_point,
        });
        onOpen();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من الحذف؟', 'Are you sure you want to delete?'))) return;
        try {
            await axios.delete(`${API_BASE}/inventory/ingredients/${id}`);
            toast({ title: tr('تم الحذف', 'Deleted'), status: 'success' });
            loadIngredients();
        } catch (error) {
            toast({ title: tr('خطأ في الحذف', 'Delete failed'), status: 'error' });
        }
    };

    const filteredIngredients = ingredients.filter(i =>
        i.name_ar.includes(searchQuery) || i.name_en.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIngredientName = (ingredient: Ingredient) => {
        return locale === 'ar' ? ingredient.name_ar : (ingredient.name_en || ingredient.name_ar);
    };

    return (
        <Box p={6}>
            <HStack justify="space-between" mb={6}>
                <Text fontSize="2xl" fontWeight="bold">{tr('إدارة المخزون', 'Inventory Management')}</Text>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => { setEditingIngredient(null); onOpen(); }}>
                    {tr('إضافة مكون', 'Add Ingredient')}
                </Button>
            </HStack>

            <Input
                placeholder={tr('بحث عن مكون...', 'Search for an ingredient...')}
                mb={6}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="400px"
            />

            <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>{tr('الاسم', 'Name')}</Th>
                            <Th>{tr('الاسم (English)', 'Name (English)')}</Th>
                            <Th isNumeric>{tr('الكمية (وحدة التخزين)', 'Quantity (storage unit)')}</Th>
                            <Th>{tr('وحدة القياس', 'Unit')}</Th>
                            <Th isNumeric>{tr('عامل التحويل', 'Conversion factor')}</Th>
                            <Th isNumeric>{tr('التكلفة / وحدة تخزين', 'Cost / storage unit')}</Th>
                            <Th>{tr('الحالة', 'Status')}</Th>
                            <Th>{tr('إجراءات', 'Actions')}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredIngredients.map((ingredient) => (
                            <Tr key={ingredient.id}>
                                <Td fontWeight="bold">{getIngredientName(ingredient)}</Td>
                                <Td>{locale === 'ar' ? ingredient.name_en : ingredient.name_ar}</Td>
                                <Td isNumeric>
                                    <Badge
                                        colorScheme={Number(ingredient.current_stock) <= Number(ingredient.reorder_point) ? 'red' : 'green'}
                                        fontSize="md"
                                    >
                                        {ingredient.current_stock} {ingredient.storage_unit || ingredient.unit}
                                    </Badge>
                                </Td>
                                <Td>{ingredient.unit}</Td>
                                <Td isNumeric>{ingredient.conversion_factor}</Td>
                                <Td isNumeric>{ingredient.cost_per_unit}</Td>
                                <Td>
                                    {Number(ingredient.current_stock) <= Number(ingredient.reorder_point) && (
                                        <Badge colorScheme="red">{tr('منخفض', 'Low')}</Badge>
                                    )}
                                </Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <IconButton
                                            aria-label={tr('تعديل', 'Edit')}
                                            icon={<FiEdit2 />}
                                            size="sm"
                                            onClick={() => handleEdit(ingredient)}
                                        />
                                        <IconButton
                                            aria-label={tr('حذف', 'Delete')}
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleDelete(ingredient.id)}
                                        />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingIngredient ? tr('تعديل مكون', 'Edit Ingredient') : tr('إضافة مكون جديد', 'Add New Ingredient')}</ModalHeader>
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>{tr('الاسم بالعربية', 'Name (Arabic)')}</FormLabel>
                            <Input
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                            />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>{tr('الاسم بالإنجليزية', 'Name (English)')}</FormLabel>
                            <Input
                                value={formData.name_en}
                                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            />
                        </FormControl>
                        <HStack mb={3}>
                            <FormControl>
                                <FormLabel>{tr('وحدة التخزين', 'Storage unit')}</FormLabel>
                                <Select
                                    value={formData.storage_unit}
                                    onChange={(e) => setFormData({ ...formData, storage_unit: e.target.value })}
                                >
                                    <option value="kg">{tr('كيلو جرام (kg)', 'Kilogram (kg)')}</option>
                                    <option value="g">{tr('جرام (g)', 'Gram (g)')}</option>
                                    <option value="l">{tr('لتر (L)', 'Liter (L)')}</option>
                                    <option value="ml">{tr('ملليلتر (ml)', 'Milliliter (ml)')}</option>
                                    <option value="box">{tr('صندوق (Box)', 'Box')}</option>
                                    <option value="gallon">{tr('جالون (Gallon)', 'Gallon')}</option>
                                    <option value="pcs">{tr('قطعة (Piece)', 'Piece')}</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>{tr('وحدة القياس', 'Usage unit')}</FormLabel>
                                <Select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="kg">{tr('كيلو جرام (kg)', 'Kilogram (kg)')}</option>
                                    <option value="g">{tr('جرام (g)', 'Gram (g)')}</option>
                                    <option value="l">{tr('لتر (L)', 'Liter (L)')}</option>
                                    <option value="ml">{tr('ملليلتر (ml)', 'Milliliter (ml)')}</option>
                                    <option value="pcs">{tr('قطعة (Piece)', 'Piece')}</option>
                                </Select>
                            </FormControl>
                        </HStack>
                        <FormControl mb={3}>
                            <FormLabel>
                                {tr(`عامل التحويل (كم ${formData.unit} في 1 ${formData.storage_unit}؟)`, `Conversion factor (how many ${formData.unit} in 1 ${formData.storage_unit}?)`)}
                            </FormLabel>
                            <Input
                                type="number"
                                value={formData.conversion_factor}
                                onChange={(e) => setFormData({ ...formData, conversion_factor: Number(e.target.value) })}
                                placeholder={tr('مثال: 1000', 'Example: 1000')}
                            />
                        </FormControl>
                        <HStack mb={3}>
                            <FormControl>
                                <FormLabel>{tr(`الكمية الحالية (${formData.storage_unit})`, `Current stock (${formData.storage_unit})`)}</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.current_stock}
                                    onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>{tr(`التكلفة لكل ${formData.storage_unit}`, `Cost per ${formData.storage_unit}`)}</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.cost_per_unit}
                                    onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                                />
                            </FormControl>
                        </HStack>
                        <FormControl>
                            <FormLabel>{tr('حد إعادة الطلب', 'Reorder point')}</FormLabel>
                            <Input
                                type="number"
                                value={formData.reorder_point}
                                onChange={(e) => setFormData({ ...formData, reorder_point: Number(e.target.value) })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>{tr('إلغاء', 'Cancel')}</Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>{tr('حفظ', 'Save')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InventoryPage;
