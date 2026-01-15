import {
    Box,
    Heading,
    Text,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    Select,
    Button,
    VStack,
    HStack,
    useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';

type PosLanguage = 'ar' | 'en';

const SettingsPage = () => {
    const { tr } = useLanguage();
    const toast = useToast();
    const [posLanguage, setPosLanguage] = useState<PosLanguage>('ar');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await axios.get(`${API_BASE}/settings/pos-language`);
                setPosLanguage((response.data?.pos_language as PosLanguage) || 'ar');
            } catch (error) {
                console.error('Error loading settings:', error);
                toast({
                    title: tr('تعذر تحميل الإعدادات', 'Failed to load settings'),
                    status: 'error',
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.patch(`${API_BASE}/settings/pos-language`, {
                pos_language: posLanguage,
            });
            toast({
                title: tr('تم حفظ الإعدادات', 'Settings saved'),
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: tr('تعذر حفظ الإعدادات', 'Failed to save settings'),
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <Box>
                        <Heading size="lg">{tr('الإعدادات', 'Settings')}</Heading>
                        <Text color="gray.600">
                            {tr('تحكم في إعدادات نقطة البيع واللغة.', 'Manage POS and language settings.')}
                        </Text>
                    </Box>
                </HStack>

                <Card>
                    <CardBody>
                        <VStack align="stretch" spacing={4}>
                            <FormControl isDisabled={isLoading}>
                                <FormLabel>{tr('لغة نقطة البيع', 'POS Language')}</FormLabel>
                                <Select
                                    value={posLanguage}
                                    onChange={(e) => setPosLanguage(e.target.value as PosLanguage)}
                                >
                                    <option value="ar">{tr('العربية', 'Arabic')}</option>
                                    <option value="en">{tr('الإنجليزية', 'English')}</option>
                                </Select>
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                    {tr('يتم تطبيق اللغة على شاشة الكاشير عند فتحها.', 'The selected language applies to the cashier screen.')}
                                </Text>
                            </FormControl>

                            <Button
                                colorScheme="blue"
                                alignSelf="flex-start"
                                onClick={handleSave}
                                isLoading={isSaving}
                            >
                                {tr('حفظ التغييرات', 'Save changes')}
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default SettingsPage;
