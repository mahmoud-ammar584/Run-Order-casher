import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    SimpleGrid,
    VStack,
    HStack,
    Input,
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
    Heading,
    Card,
    CardBody,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { FiPlus, FiGrid, FiEdit2, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';

const CategoriesPage = () => {
    const { tr, locale } = useLanguage();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const toast = useToast();

    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        image_url: '',
        is_active: true,
        display_order: 0,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleOpenModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name_ar: category.name_ar,
                name_en: category.name_en,
                description_ar: category.description_ar || '',
                image_url: category.image_url || '',
                is_active: category.is_active,
                display_order: category.display_order,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name_ar: '',
                name_en: '',
                description_ar: '',
                image_url: '',
                is_active: true,
                display_order: categories.length + 1,
            });
        }
        onOpen();
    };

    const handleSave = async () => {
        try {
            if (editingCategory) {
                await axios.patch(`${API_BASE}/categories/${editingCategory.id}`, formData);
                toast({ title: tr('تم التحديث بنجاح', 'Updated successfully'), status: 'success', duration: 2000 });
            } else {
                await axios.post(`${API_BASE}/categories`, formData);
                toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success', duration: 2000 });
            }
            loadCategories();
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            toast({ title: tr('حدث خطأ', 'An error occurred'), status: 'error', duration: 2000 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من حذف التصنيف؟', 'Are you sure you want to delete this category?'))) return;

        try {
            await axios.delete(`${API_BASE}/categories/${id}`);
            toast({ title: tr('تم الحذف بنجاح', 'Deleted successfully'), status: 'success', duration: 2000 });
            loadCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast({
                title: tr('خطأ', 'Error'),
                description: error.response?.data?.message || tr('تعذر حذف التصنيف.', 'Failed to delete category.'),
                status: 'error',
                duration: 3000
            });
        }
    };

    const toggleActive = async (category: any) => {
        try {
            await axios.patch(`${API_BASE}/categories/${category.id}`, {
                is_active: !category.is_active
            });
            loadCategories();
        } catch (error) {
            console.error('Error toggling category:', error);
        }
    };

    const getCategoryTitle = (category: any) => {
        return locale === 'ar' ? category.name_ar : category.name_en;
    };

    const getCategorySubtitle = (category: any) => {
        return locale === 'ar' ? category.name_en : category.name_ar;
    };

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                        <Heading size="lg">{tr('إدارة التصنيفات', 'Manage Categories')}</Heading>
                        <Text color="gray.600">
                            {tr('تنظيم التصنيفات الرئيسية وفرزها بسهولة.', 'Organize and manage your main categories.')}
                        </Text>
                    </VStack>
                    <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="lg"
                        onClick={() => handleOpenModal()}
                    >
                        {tr('إضافة تصنيف جديد', 'Add New Category')}
                    </Button>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card>
                        <CardBody>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                        {tr('إجمالي التصنيفات', 'Total Categories')}
                                    </Text>
                                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                        {categories.length}
                                    </Text>
                                </VStack>
                                <Box bg="blue.50" p={3} borderRadius="lg">
                                    <FiGrid size={24} color="#3182ce" />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                        {tr('نشطة', 'Active')}
                                    </Text>
                                    <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                        {categories.filter((c) => c.is_active).length}
                                    </Text>
                                </VStack>
                                <Box bg="green.50" p={3} borderRadius="lg">
                                    <FiGrid size={24} color="#38a169" />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                        {tr('غير نشطة', 'Inactive')}
                                    </Text>
                                    <Text fontSize="3xl" fontWeight="bold" color="gray.600">
                                        {categories.filter((c) => !c.is_active).length}
                                    </Text>
                                </VStack>
                                <Box bg="gray.100" p={3} borderRadius="lg">
                                    <FiGrid size={24} color="#718096" />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            overflow="hidden"
                            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                            transition="all 0.2s"
                            opacity={category.is_active ? 1 : 0.6}
                        >
                            {category.image_url && (
                                <Image
                                    src={category.image_url}
                                    alt={category.name_ar}
                                    h="200px"
                                    w="full"
                                    objectFit="cover"
                                />
                            )}
                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xl" fontWeight="bold">
                                                {getCategoryTitle(category)}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {getCategorySubtitle(category)}
                                            </Text>
                                        </VStack>
                                        <Badge
                                            colorScheme={category.is_active ? 'green' : 'gray'}
                                            fontSize="sm"
                                            px={2}
                                            py={1}
                                        >
                                            {category.is_active ? tr('نشط', 'Active') : tr('غير نشط', 'Inactive')}
                                        </Badge>
                                    </HStack>

                                    {category.description_ar && (
                                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                            {category.description_ar}
                                        </Text>
                                    )}

                                    <HStack justify="space-between">
                                        <HStack>
                                            <Switch
                                                isChecked={category.is_active}
                                                onChange={() => toggleActive(category)}
                                                colorScheme="green"
                                            />
                                        </HStack>
                                        <HStack spacing={2}>
                                            <IconButton
                                                icon={<FiEdit2 />}
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={() => handleOpenModal(category)}
                                                aria-label={tr('تعديل', 'Edit')}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => handleDelete(category.id)}
                                                aria-label={tr('حذف', 'Delete')}
                                            />
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingCategory ? tr('تعديل تصنيف', 'Edit Category') : tr('إضافة تصنيف جديد', 'Add New Category')}
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
                                        placeholder={tr('مثال: مشروبات', 'Example: Beverages')}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>{tr('الاسم (English)', 'Name (English)')}</FormLabel>
                                    <Input
                                        value={formData.name_en}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_en: e.target.value })
                                        }
                                        placeholder="Example: Beverages"
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel>{tr('الوصف (عربي)', 'Description (Arabic)')}</FormLabel>
                                <Textarea
                                    value={formData.description_ar}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description_ar: e.target.value })
                                    }
                                    placeholder={tr('وصف مختصر للتصنيف...', 'Short description for the category...')}
                                    rows={3}
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

                            {formData.image_url && (
                                <Box w="full">
                                    <Image
                                        src={formData.image_url}
                                        alt={tr('معاينة', 'Preview')}
                                        h="150px"
                                        w="full"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                </Box>
                            )}

                            <HStack w="full" spacing={4}>
                                <FormControl>
                                    <FormLabel>{tr('ترتيب العرض', 'Display order')}</FormLabel>
                                    <Input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                display_order: parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </FormControl>
                                <FormControl display="flex" alignItems="center" pt={8}>
                                    <FormLabel mb="0">{tr('نشط', 'Active')}</FormLabel>
                                    <Switch
                                        isChecked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_active: e.target.checked })
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
                            {editingCategory ? tr('حفظ التعديلات', 'Save changes') : tr('إضافة', 'Add')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CategoriesPage;
