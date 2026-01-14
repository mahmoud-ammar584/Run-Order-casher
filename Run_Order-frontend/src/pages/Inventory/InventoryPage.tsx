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
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Form State
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
                title: 'خطأ',
                description: 'فشل تحميل المخزون',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingIngredient) {
                await axios.patch(`${API_BASE}/inventory/ingredients/${editingIngredient.id}`, formData);
                toast({ title: 'تم التحديث بنجاح', status: 'success' });
            } else {
                await axios.post(`${API_BASE}/inventory/ingredients`, formData);
                toast({ title: 'تم الإضافة بنجاح', status: 'success' });
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
                title: 'خطأ',
                description: 'فشل حفظ البيانات',
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
        if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await axios.delete(`${API_BASE}/inventory/ingredients/${id}`);
            toast({ title: 'تم الحذف', status: 'success' });
            loadIngredients();
        } catch (error) {
            toast({ title: 'خطأ في الحذف', status: 'error' });
        }
    };

    const filteredIngredients = ingredients.filter(i =>
        i.name_ar.includes(searchQuery) || i.name_en.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box p={6}>
            <HStack justify="space-between" mb={6}>
                <Text fontSize="2xl" fontWeight="bold">إدارة المخزون</Text>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => { setEditingIngredient(null); onOpen(); }}>
                    إضافة مكون
                </Button>
            </HStack>

            <Input
                placeholder="بحث عن مكون..."
                mb={6}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="400px"
            />

            <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>الاسم (عربي)</Th>
                            <Th>الاسم (إنجليزي)</Th>
                            <Th isNumeric>الكمية (وحدة التخزين)</Th>
                            <Th>وحدة القياس</Th>
                            <Th isNumeric>عامل التحويل</Th>
                            <Th isNumeric>التكلفة / وحدة تخزين</Th>
                            <Th>الحالة</Th>
                            <Th>إجراءات</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredIngredients.map((ingredient) => (
                            <Tr key={ingredient.id}>
                                <Td fontWeight="bold">{ingredient.name_ar}</Td>
                                <Td>{ingredient.name_en}</Td>
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
                                        <Badge colorScheme="red">منخفض</Badge>
                                    )}
                                </Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <IconButton
                                            aria-label="Edit"
                                            icon={<FiEdit2 />}
                                            size="sm"
                                            onClick={() => handleEdit(ingredient)}
                                        />
                                        <IconButton
                                            aria-label="Delete"
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
                    <ModalHeader>{editingIngredient ? 'تعديل مكون' : 'إضافة مكون جديد'}</ModalHeader>
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>الاسم بالعربية</FormLabel>
                            <Input
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                            />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>الاسم بالإنجليزية</FormLabel>
                            <Input
                                value={formData.name_en}
                                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            />
                        </FormControl>
                        <HStack mb={3}>
                            <FormControl>
                                <FormLabel>وحدة التخزين (المخزون)</FormLabel>
                                <Select
                                    value={formData.storage_unit}
                                    onChange={(e) => setFormData({ ...formData, storage_unit: e.target.value })}
                                >
                                    <option value="kg">كيلو جرام (kg)</option>
                                    <option value="g">جرام (g)</option>
                                    <option value="l">لتر (L)</option>
                                    <option value="ml">ملليلتر (ml)</option>
                                    <option value="box">صندوق (Box)</option>
                                    <option value="gallon">جالون (Gallon)</option>
                                    <option value="pcs">قطعة (Piece)</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>وحدة القياس (للوصفات)</FormLabel>
                                <Select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="kg">كيلو جرام (kg)</option>
                                    <option value="g">جرام (g)</option>
                                    <option value="l">لتر (L)</option>
                                    <option value="ml">ملليلتر (ml)</option>
                                    <option value="pcs">قطعة (Piece)</option>
                                </Select>
                            </FormControl>
                        </HStack>
                        <FormControl mb={3}>
                            <FormLabel>عامل التحويل (كم {formData.unit} في 1 {formData.storage_unit}؟)</FormLabel>
                            <Input
                                type="number"
                                value={formData.conversion_factor}
                                onChange={(e) => setFormData({ ...formData, conversion_factor: Number(e.target.value) })}
                                placeholder="مثال: 1000 (إذا كان 1 كيلو = 1000 جرام)"
                            />
                        </FormControl>
                        <HStack mb={3}>
                            <FormControl>
                                <FormLabel>الكمية الحالية ({formData.storage_unit})</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.current_stock}
                                    onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>التكلفة لكل {formData.storage_unit}</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.cost_per_unit}
                                    onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                                />
                            </FormControl>
                        </HStack>
                        <FormControl>
                            <FormLabel>حد إعادة الطلب</FormLabel>
                            <Input
                                type="number"
                                value={formData.reorder_point}
                                onChange={(e) => setFormData({ ...formData, reorder_point: Number(e.target.value) })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
                        <Button colorScheme="blue" onClick={handleSubmit}>حفظ</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default InventoryPage;
