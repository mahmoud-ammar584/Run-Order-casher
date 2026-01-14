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
    Select,
    Heading,
    Card,
    CardBody,
    Text,
    useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../../config';

const TablesPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingTable, setEditingTable] = useState<any>(null);
    const [tables, setTables] = useState<any[]>([]);
    const toast = useToast();

    const [formData, setFormData] = useState({
        table_number: '',
        capacity: 4,
        status: 'available',
        location: '',
        notes: '',
        is_active: true,
    });

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        try {
            const response = await axios.get(`${API_BASE}/tables`);
            setTables(response.data);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    };

    const handleOpenModal = (table: any = null) => {
        if (table) {
            setEditingTable(table);
            setFormData({
                table_number: table.table_number,
                capacity: table.capacity,
                status: table.status,
                location: table.location || '',
                notes: table.notes || '',
                is_active: table.is_active,
            });
        } else {
            setEditingTable(null);
            setFormData({
                table_number: '',
                capacity: 4,
                status: 'available',
                location: '',
                notes: '',
                is_active: true,
            });
        }
        onOpen();
    };

    const handleSave = async () => {
        try {
            if (editingTable) {
                await axios.patch(`${API_BASE}/tables/${editingTable.id}`, formData);
                toast({ title: 'تم التحديث بنجاح', status: 'success', duration: 2000 });
            } else {
                await axios.post(`${API_BASE}/tables`, formData);
                toast({ title: 'تم الإضافة بنجاح', status: 'success', duration: 2000 });
            }
            loadTables();
            onClose();
        } catch (error: any) {
            console.error('Error saving table:', error);
            toast({
                title: 'حدث خطأ',
                description: error.response?.data?.message || 'لم نتمكن من حفظ الطاولة',
                status: 'error',
                duration: 2000
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الطاولة؟')) return;

        try {
            await axios.delete(`${API_BASE}/tables/${id}`);
            toast({ title: 'تم الحذف بنجاح', status: 'success', duration: 2000 });
            loadTables();
        } catch (error) {
            console.error('Error deleting table:', error);
            toast({ title: 'خطأ', status: 'error', duration: 2000 });
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`${API_BASE}/tables/${id}/status`, { status });
            loadTables();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'occupied':
                return 'red';
            case 'reserved':
                return 'yellow';
            case 'cleaning':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'متاحة';
            case 'occupied':
                return 'مشغولة';
            case 'reserved':
                return 'محجوزة';
            case 'cleaning':
                return 'تنظيف';
            default:
                return status;
        }
    };

    return (
        <Box p={6}>
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">إدارة الطاولات</Heading>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => handleOpenModal()}>
                    إضافة طاولة
                </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                {tables.map((table) => (
                    <Card key={table.id}>
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                    <Heading size="md">{table.table_number}</Heading>
                                    <Badge colorScheme={getStatusColor(table.status)}>
                                        {getStatusText(table.status)}
                                    </Badge>
                                </HStack>

                                <Text color="gray.600">
                                    <strong>السعة:</strong> {table.capacity} أشخاص
                                </Text>

                                {table.location && (
                                    <Text color="gray.600" fontSize="sm">
                                        <strong>الموقع:</strong> {table.location}
                                    </Text>
                                )}

                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        variant="outline"
                                        onClick={() => updateStatus(table.id, 'available')}
                                        isDisabled={table.status === 'available'}
                                    >
                                        <FiCheck />
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => updateStatus(table.id, 'occupied')}
                                        isDisabled={table.status === 'occupied'}
                                    >
                                        <FiX />
                                    </Button>
                                    <IconButton
                                        aria-label="Edit"
                                        icon={<FiEdit2 />}
                                        size="sm"
                                        onClick={() => handleOpenModal(table)}
                                    />
                                    <IconButton
                                        aria-label="Delete"
                                        icon={<FiTrash2 />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleDelete(table.id)}
                                    />
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingTable ? 'تعديل طاولة' : 'إضافة طاولة جديدة'}
                    </ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>رقم الطاولة</FormLabel>
                                <Input
                                    value={formData.table_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, table_number: e.target.value })
                                    }
                                    placeholder="T1"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>السعة</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })
                                    }
                                    min={1}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>الحالة</FormLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                >
                                    <option value="available">متاحة</option>
                                    <option value="occupied">مشغولة</option>
                                    <option value="reserved">محجوزة</option>
                                    <option value="cleaning">تنظيف</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>الموقع</FormLabel>
                                <Input
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    placeholder="الداخل / الخارج / الطابق الثاني"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>ملاحظات</FormLabel>
                                <Input
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button colorScheme="blue" onClick={handleSave}>
                            حفظ
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TablesPage;

