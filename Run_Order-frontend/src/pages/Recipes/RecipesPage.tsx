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
import { useLanguage } from '../../contexts/LanguageContext';

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
    const { tr, locale } = useLanguage();
    const [items, setItems] = useState<Item[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

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
            toast({ title: tr('البيانات غير مكتملة', 'Incomplete data'), status: 'warning' });
            return;
        }

        try {
            await axios.post(`${API_BASE}/recipes`, {
                item_id: selectedItem,
                ...newRecipe
            });
            toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success' });
            onClose();
            loadRecipes(selectedItem);
            setNewRecipe({ ingredient_id: '', quantity: 0, unit: 'g' });
        } catch (error) {
            toast({ title: tr('خطأ في الإضافة', 'Add failed'), status: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من الحذف؟', 'Are you sure you want to delete?'))) return;
        try {
            await axios.delete(`${API_BASE}/recipes/${id}`);
            toast({ title: tr('تم الحذف', 'Deleted'), status: 'success' });
            loadRecipes(selectedItem);
        } catch (error) {
            toast({ title: tr('خطأ في الحذف', 'Delete failed'), status: 'error' });
        }
    };

    const getItemName = (item: Item) => {
        return locale === 'ar' ? item.name_ar : (item.name_en || item.name_ar);
    };

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Text fontSize="2xl" fontWeight="bold" mb={4}>{tr('إدارة الوصفات', 'Recipe Management')}</Text>
                    <Text color="gray.600" mb={4}>
                        {tr('اربط الأصناف بالمكونات ليتم خصمها تلقائياً من المخزون عند البيع.', 'Link items to ingredients to deduct inventory automatically.')}
                    </Text>

                    <FormControl>
                        <FormLabel>{tr('اختر الصنف', 'Select item')}</FormLabel>
                        <Select
                            placeholder={tr('اختر صنفاً لتعديل وصفته...', 'Select an item to edit its recipe...')}
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            size="lg"
                            bg="white"
                        >
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{getItemName(item)} ({locale === 'ar' ? item.name_en : item.name_ar})</option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {selectedItem && (
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                        <HStack justify="space-between" mb={6}>
                            <Text fontSize="xl" fontWeight="bold">{tr('مكونات الوصفة', 'Recipe Ingredients')}</Text>
                            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
                                {tr('إضافة مكون', 'Add Ingredient')}
                            </Button>
                        </HStack>

                        {recipes.length === 0 ? (
                            <Text textAlign="center" color="gray.500" py={8}>
                                {tr('لا توجد مكونات مضافة لهذا الصنف بعد.', 'No ingredients added for this item yet.')}
                            </Text>
                        ) : (
                            <Table variant="simple">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>{tr('المكون', 'Ingredient')}</Th>
                                        <Th isNumeric>{tr('الكمية', 'Quantity')}</Th>
                                        <Th>{tr('الوحدة', 'Unit')}</Th>
                                        <Th>{tr('إجراءات', 'Actions')}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {recipes.map((recipe) => (
                                        <Tr key={recipe.id}>
                                            <Td fontWeight="bold">
                                                {locale === 'ar' ? recipe.ingredient?.name_ar : recipe.ingredient?.name_en}
                                                <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                                                    ({locale === 'ar' ? recipe.ingredient?.name_en : recipe.ingredient?.name_ar})
                                                </Text>
                                            </Td>
                                            <Td isNumeric>{recipe.quantity}</Td>
                                            <Td>{recipe.unit}</Td>
                                            <Td>
                                                <IconButton
                                                    aria-label={tr('حذف', 'Delete')}
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
                    <ModalHeader>{tr('إضافة مكون للوصفة', 'Add Ingredient to Recipe')}</ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>{tr('المكون', 'Ingredient')}</FormLabel>
                                <Select
                                    placeholder={tr('اختر المكون', 'Select ingredient')}
                                    value={newRecipe.ingredient_id}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredient_id: e.target.value })}
                                >
                                    {ingredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {locale === 'ar' ? ing.name_ar : ing.name_en} ({tr('المتوفر', 'Available')}: {ing.current_stock} {ing.unit})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>{tr('الكمية المستهلكة', 'Quantity used')}</FormLabel>
                                    <Input
                                        type="number"
                                        value={newRecipe.quantity}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, quantity: Number(e.target.value) })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{tr('الوحدة', 'Unit')}</FormLabel>
                                    <Select
                                        value={newRecipe.unit}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, unit: e.target.value })}
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
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>{tr('إلغاء', 'Cancel')}</Button>
                        <Button colorScheme="blue" onClick={handleAddIngredient}>{tr('إضافة', 'Add')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default RecipesPage;
