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
    Select,
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
    useDisclosure,
    HStack,
    IconButton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';

interface Item {
    id: string;
    name_ar: string;
    name_en: string;
}

interface Ingredient {
    id: string;
    name_ar: string;
    name_en: string;
    unit: string;
    current_stock?: number;
}

interface Recipe {
    id: string;
    item_id: string;
    ingredient_id: string;
    quantity: number;
    unit: string;
    ingredient: Ingredient;
}

const RecipesPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Form State
    const [newRecipe, setNewRecipe] = useState({
        ingredient_id: '',
        quantity: 0,
        unit: 'g',
    });

    useEffect(() => {
        loadItems();
        loadIngredients();
    }, []);

    useEffect(() => {
        if (selectedItem) {
            loadRecipes(selectedItem);
        } else {
            setRecipes([]);
        }
    }, [selectedItem]);

    const loadItems = async () => {
        try {
            const response = await axios.get(`${API_BASE}/items`);
            setItems(response.data);
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const loadIngredients = async () => {
        try {
            const response = await axios.get(`${API_BASE}/inventory/ingredients`);
            setIngredients(response.data);
        } catch (error) {
            console.error('Error loading ingredients:', error);
        }
    };

    const loadRecipes = async (itemId: string) => {
        try {
            const response = await axios.get(`${API_BASE}/recipes/item/${itemId}`);
            setRecipes(response.data);
        } catch (error) {
            console.error('Error loading recipes:', error);
        }
    };

    const handleAddIngredient = async () => {
        if (!selectedItem || !newRecipe.ingredient_id || newRecipe.quantity <= 0) {
            toast({ title: 'البيانات غير مكتملة', status: 'warning' });
            return;
        }

        try {
            await axios.post(`${API_BASE}/recipes`, {
                item_id: selectedItem,
                ...newRecipe
            });
            toast({ title: 'تمت الإضافة بنجاح', status: 'success' });
            onClose();
            loadRecipes(selectedItem);
            setNewRecipe({ ingredient_id: '', quantity: 0, unit: 'g' });
        } catch (error) {
            toast({ title: 'خطأ في الإضافة', status: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await axios.delete(`${API_BASE}/recipes/${id}`);
            toast({ title: 'تم الحذف', status: 'success' });
            loadRecipes(selectedItem);
        } catch (error) {
            toast({ title: 'خطأ في الحذف', status: 'error' });
        }
    };

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Text fontSize="2xl" fontWeight="bold" mb={4}>إدارة الوصفات</Text>
                    <Text color="gray.600" mb={4}>اربط الأصناف بالمكونات ليتم خصمها تلقائياً من المخزون عند البيع.</Text>

                    <FormControl>
                        <FormLabel>اختر الصنف</FormLabel>
                        <Select
                            placeholder="اختر صنفاً لتعديل وصفته..."
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            size="lg"
                            bg="white"
                        >
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name_ar} ({item.name_en})</option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {selectedItem && (
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <HStack justify="space-between" mb={6}>
                            <Text fontSize="xl" fontWeight="bold">مكونات الوصفة</Text>
                            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
                                إضافة مكون
                            </Button>
                        </HStack>

                        {recipes.length === 0 ? (
                            <Text textAlign="center" color="gray.500" py={8}>لا توجد مكونات مضافة لهذا الصنف بعد.</Text>
                        ) : (
                            <Table variant="simple">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>المكون</Th>
                                        <Th isNumeric>الكمية</Th>
                                        <Th>الوحدة</Th>
                                        <Th>إجراءات</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {recipes.map((recipe) => (
                                        <Tr key={recipe.id}>
                                            <Td fontWeight="bold">
                                                {recipe.ingredient?.name_ar}
                                                <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                                                    ({recipe.ingredient?.name_en})
                                                </Text>
                                            </Td>
                                            <Td isNumeric>{recipe.quantity}</Td>
                                            <Td>{recipe.unit}</Td>
                                            <Td>
                                                <IconButton
                                                    aria-label="Delete"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(recipe.id)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </Box>
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>إضافة مكون للوصفة</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>المكون</FormLabel>
                                <Select
                                    placeholder="اختر المكون"
                                    value={newRecipe.ingredient_id}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredient_id: e.target.value })}
                                >
                                    {ingredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name_ar} (المتوفر: {ing.current_stock} {ing.unit})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>الكمية المستهلكة</FormLabel>
                                    <Input
                                        type="number"
                                        value={newRecipe.quantity}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, quantity: Number(e.target.value) })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>الوحدة</FormLabel>
                                    <Select
                                        value={newRecipe.unit}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, unit: e.target.value })}
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
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>إلغاء</Button>
                        <Button colorScheme="blue" onClick={handleAddIngredient}>إضافة</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RecipesPage;
