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

const CategoriesPage = () => {
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
                toast({ title: 'تم التحديث بنجاح', status: 'success', duration: 2000 });
            } else {
                await axios.post(`${API_BASE}/categories`, formData);
                toast({ title: 'تم الإضافة بنجاح', status: 'success', duration: 2000 });
            }
            loadCategories();
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            toast({ title: 'حدث خطأ', status: 'error', duration: 2000 });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

        try {
            await axios.delete(`${API_BASE}/categories/${id}`);
            toast({ title: 'تم الحذف بنجاح', status: 'success', duration: 2000 });
            loadCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast({
                title: 'خطأ',
                description: error.response?.data?.message || 'لم نتمكن من حذف القسم',
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

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                        <Heading size="lg">إدارة الأقسام</Heading>
                        <Text color="gray.600">
                            إدارة الأقسام الرئيسية للمنيو
                        </Text>
                    </VStack>
                    <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="lg"
                        onClick={() => handleOpenModal()}
                    >
                        إضافة قسم جديد
                    </Button>
                </HStack>

                {/* إحصائيات سريعة */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card>
                        <CardBody>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                        إجمالي الأقسام
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
                                        أقسام نشطة
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
                                        أقسام غير نشطة
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

                {/* بطاقات الأقسام */}
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
                                                {category.name_ar}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {category.name_en}
                                            </Text>
                                        </VStack>
                                        <Badge
                                            colorScheme={category.is_active ? 'green' : 'gray'}
                                            fontSize="sm"
                                            px={2}
                                            py={1}
                                        >
                                            {category.is_active ? 'نشط' : 'غير نشط'}
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
                                                aria-label="Edit"
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => handleDelete(category.id)}
                                                aria-label="Delete"
                                            />
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            </VStack>

            {/* نافذة الإضافة/التعديل */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingCategory ? 'تعديل قسم' : 'إضافة قسم جديد'}
                    </ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>الاسم بالعربية</FormLabel>
                                    <Input
                                        value={formData.name_ar}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_ar: e.target.value })
                                        }
                                        placeholder="مثال: البرجر"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>الاسم بالإنجليزية</FormLabel>
                                    <Input
                                        value={formData.name_en}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name_en: e.target.value })
                                        }
                                        placeholder="Example: Burgers"
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel>الوصف بالعربية</FormLabel>
                                <Textarea
                                    value={formData.description_ar}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description_ar: e.target.value })
                                    }
                                    placeholder="وصف مختصر للقسم..."
                                    rows={3}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>رابط الصورة</FormLabel>
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
                                        alt="Preview"
                                        h="150px"
                                        w="full"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                </Box>
                            )}

                            <HStack w="full" spacing={4}>
                                <FormControl>
                                    <FormLabel>ترتيب العرض</FormLabel>
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
                                    <FormLabel mb="0">نشط</FormLabel>
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
                            إلغاء
                        </Button>
                        <Button colorScheme="blue" onClick={handleSave}>
                            {editingCategory ? 'حفظ التعديلات' : 'إضافة'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CategoriesPage;
