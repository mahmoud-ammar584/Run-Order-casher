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
import { useLanguage } from '../../contexts/LanguageContext';

const TablesPage = () => {
    const { tr } = useLanguage();
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
                toast({ title: tr('تم التحديث بنجاح', 'Updated successfully'), status: 'success', duration: 2000 });
            } else {
                await axios.post(`${API_BASE}/tables`, formData);
                toast({ title: tr('تمت الإضافة بنجاح', 'Added successfully'), status: 'success', duration: 2000 });
            }
            loadTables();
            onClose();
        } catch (error: any) {
            console.error('Error saving table:', error);
            toast({
                title: tr('حدث خطأ', 'Error'),
                description: error.response?.data?.message || tr('تعذر حفظ الطاولة', 'Failed to save table'),
                status: 'error',
                duration: 2000
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(tr('هل أنت متأكد من حذف الطاولة؟', 'Are you sure you want to delete this table?'))) return;

        try {
            await axios.delete(`${API_BASE}/tables/${id}`);
            toast({ title: tr('تم الحذف بنجاح', 'Deleted successfully'), status: 'success', duration: 2000 });
            loadTables();
        } catch (error) {
            console.error('Error deleting table:', error);
            toast({ title: tr('خطأ', 'Error'), status: 'error', duration: 2000 });
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
                return tr('متاحة', 'Available');
            case 'occupied':
                return tr('مشغولة', 'Occupied');
            case 'reserved':
                return tr('محجوزة', 'Reserved');
            case 'cleaning':
                return tr('تنظيف', 'Cleaning');
            default:
                return status;
        }
    };

    return (
        <Box p={6}>
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">{tr('إدارة الطاولات', 'Manage Tables')}</Heading>
                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => handleOpenModal()}>
                    {tr('إضافة طاولة', 'Add Table')}
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
                                    <strong>{tr('السعة', 'Capacity')}:</strong> {table.capacity} {tr('أشخاص', 'seats')}
                                </Text>

                                {table.location && (
                                    <Text color="gray.600" fontSize="sm">
                                        <strong>{tr('الموقع', 'Location')}:</strong> {table.location}
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
                                        aria-label={tr('تعديل', 'Edit')}
                                        icon={<FiEdit2 />}
                                        size="sm"
                                        onClick={() => handleOpenModal(table)}
                                    />
                                    <IconButton
                                        aria-label={tr('حذف', 'Delete')}
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
                        {editingTable ? tr('تعديل طاولة', 'Edit Table') : tr('إضافة طاولة جديدة', 'Add New Table')}
                    </ModalHeader>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>{tr('رقم الطاولة', 'Table Number')}</FormLabel>
                                <Input
                                    value={formData.table_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, table_number: e.target.value })
                                    }
                                    placeholder="T1"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>{tr('السعة', 'Capacity')}</FormLabel>
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
                                <FormLabel>{tr('الحالة', 'Status')}</FormLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                >
                                    <option value="available">{tr('متاحة', 'Available')}</option>
                                    <option value="occupied">{tr('مشغولة', 'Occupied')}</option>
                                    <option value="reserved">{tr('محجوزة', 'Reserved')}</option>
                                    <option value="cleaning">{tr('تنظيف', 'Cleaning')}</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>{tr('الموقع', 'Location')}</FormLabel>
                                <Input
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    placeholder={tr('داخلي / خارجي / تراس', 'Indoor / Outdoor / Terrace')}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>{tr('ملاحظات', 'Notes')}</FormLabel>
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
                            {tr('إلغاء', 'Cancel')}
                        </Button>
                        <Button colorScheme="blue" onClick={handleSave}>
                            {tr('حفظ', 'Save')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TablesPage;
