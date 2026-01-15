import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    HStack,
    Input,
    Button,
    Box,
    Text,
    Avatar,
    useToast,
    Spinner,
    Badge,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    IconButton,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrendingDown, FiPackage, FiDollarSign, FiUsers } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sql?: string;
    data?: any[];
    timestamp: string;
}

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

const quickPrompts = [
    { icon: FiTrendingDown, ar: 'ليه المبيعات قليلة النهاردة؟', en: 'Why are sales down today?' },
    { icon: FiPackage, ar: 'إيه أكثر الأصناف مبيعًا؟', en: 'What are top selling items?' },
    { icon: FiDollarSign, ar: 'إجمالي المبيعات هذا الشهر؟', en: 'Total sales this month?' },
    { icon: FiUsers, ar: 'عدد الطلبات النشطة؟', en: 'Active orders count?' },
];

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
    const { tr, locale } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && !insights) {
            loadQuickInsights();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadQuickInsights = async () => {
        try {
            const response = await axios.get(`${API_BASE}/ai/insights`);
            setInsights(response.data);
        } catch (error) {
            console.error('Failed to load insights:', error);
        }
    };

    const sendMessage = async (query: string) => {
        if (!query.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: query,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/ai/query`, { query });

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.data.response,
                sql: response.data.sql,
                data: response.data.data,
                timestamp: response.data.timestamp,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('AI Query Error:', error);
            toast({
                title: tr('خطأ', 'Error'),
                description: error.response?.data?.message || tr('تعذر معالجة الاستعلام الذكي', 'Failed to process AI query'),
                status: 'error',
                duration: 3000,
            });

            const errorMessage: Message = {
                role: 'assistant',
                content: tr(
                    'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
                    'Sorry, something went wrong while processing your request. Please try again.',
                ),
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        sendMessage(prompt);
    };

    return (
        <Drawer isOpen={isOpen} placement={locale === 'ar' ? 'right' : 'left'} onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent
                bgGradient="linear(to-br, purple.50, pink.50)"
                _dark={{ bgGradient: 'linear(to-br, gray.900, purple.900)' }}
            >
                <DrawerCloseButton />
                <DrawerHeader
                    borderBottomWidth="1px"
                    bgGradient="linear(to-r, purple.600, pink.600)"
                    color="white"
                >
                    <HStack spacing={3}>
                        <Box
                            w="40px"
                            h="40px"
                            borderRadius="full"
                            bgGradient="linear(to-br, purple.400, pink.400)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="20px"
                        >
                            ✨
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold">
                                RunBrain
                            </Text>
                            <Text fontSize="xs" opacity={0.9}>
                                {tr('مساعد ذكي لفهم بيانات المبيعات', 'Smart assistant for sales insights')}
                            </Text>
                        </VStack>
                    </HStack>
                </DrawerHeader>

                <DrawerBody p={4}>
                    <VStack spacing={4} align="stretch" h="full">
                        {insights && (
                            <SimpleGrid columns={2} spacing={3}>
                                <Stat
                                    bg="white"
                                    _dark={{ bg: 'gray.800' }}
                                    p={3}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                >
                                    <StatLabel fontSize="xs">{tr('التصنيفات', 'Categories')}</StatLabel>
                                    <StatNumber color="purple.600">{insights.totalCategories}</StatNumber>
                                </Stat>
                                <Stat
                                    bg="white"
                                    _dark={{ bg: 'gray.800' }}
                                    p={3}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                >
                                    <StatLabel fontSize="xs">{tr('الأصناف', 'Items')}</StatLabel>
                                    <StatNumber color="pink.600">{insights.totalItems}</StatNumber>
                                </Stat>
                                <Stat
                                    bg="white"
                                    _dark={{ bg: 'gray.800' }}
                                    p={3}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                >
                                    <StatLabel fontSize="xs">{tr('طلبات اليوم', "Today's orders")}</StatLabel>
                                    <StatNumber color="blue.600">{insights.todayOrders}</StatNumber>
                                </Stat>
                                <Stat
                                    bg="white"
                                    _dark={{ bg: 'gray.800' }}
                                    p={3}
                                    borderRadius="lg"
                                    boxShadow="sm"
                                >
                                    <StatLabel fontSize="xs">{tr('الطاولات المتاحة', 'Available tables')}</StatLabel>
                                    <StatNumber color="green.600">{insights.availableTables}</StatNumber>
                                </Stat>
                            </SimpleGrid>
                        )}

                        {messages.length === 0 && (
                            <VStack align="stretch" spacing={2}>
                                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                    {tr('أسئلة سريعة:', 'Quick prompts:')}
                                </Text>
                                {quickPrompts.map((prompt, index) => (
                                    <Button
                                        key={index}
                                        size="sm"
                                        variant="outline"
                                        colorScheme="purple"
                                        leftIcon={<prompt.icon />}
                                        onClick={() => handleQuickPrompt(locale === 'ar' ? prompt.ar : prompt.en)}
                                        textAlign={locale === 'ar' ? 'right' : 'left'}
                                        justifyContent="flex-start"
                                    >
                                        {locale === 'ar' ? prompt.ar : prompt.en}
                                    </Button>
                                ))}
                            </VStack>
                        )}

                        <VStack
                            flex={1}
                            spacing={3}
                            align="stretch"
                            overflowY="auto"
                            css={{
                                '&::-webkit-scrollbar': { width: '4px' },
                                '&::-webkit-scrollbar-track': { background: 'transparent' },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#cbd5e0',
                                    borderRadius: '4px',
                                },
                            }}
                        >
                            {messages.map((message, index) => (
                                <HStack
                                    key={index}
                                    align="start"
                                    justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar
                                            size="sm"
                                            bg="gradient"
                                            bgGradient="linear(to-br, purple.500, pink.500)"
                                            icon={<Text>✨</Text>}
                                        />
                                    )}
                                    <VStack
                                        align={message.role === 'user' ? 'end' : 'start'}
                                        spacing={1}
                                        maxW="80%"
                                    >
                                        <Box
                                            bg={message.role === 'user' ? 'purple.500' : 'white'}
                                            color={message.role === 'user' ? 'white' : 'gray.800'}
                                            _dark={{
                                                bg: message.role === 'user' ? 'purple.600' : 'gray.700',
                                                color: 'white',
                                            }}
                                            px={4}
                                            py={2}
                                            borderRadius="lg"
                                            boxShadow="sm"
                                        >
                                            <Text fontSize="sm">{message.content}</Text>
                                        </Box>
                                        {message.sql && (
                                            <Badge colorScheme="purple" fontSize="xs">
                                                {tr('استعلام SQL', 'SQL Query')}
                                            </Badge>
                                        )}
                                    </VStack>
                                    {message.role === 'user' && (
                                        <Avatar size="sm" bg="blue.500" name={tr('مستخدم', 'User')} />
                                    )}
                                </HStack>
                            ))}
                            {isLoading && (
                                <HStack>
                                    <Avatar
                                        size="sm"
                                        bgGradient="linear(to-br, purple.500, pink.500)"
                                        icon={<Text>✨</Text>}
                                    />
                                    <Box bg="white" _dark={{ bg: 'gray.700' }} px={4} py={2} borderRadius="lg">
                                        <HStack spacing={2}>
                                            <Spinner size="sm" color="purple.500" />
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                                                {tr('جار التحليل...', 'Analyzing...')}
                                            </Text>
                                        </HStack>
                                    </Box>
                                </HStack>
                            )}
                            <div ref={messagesEndRef} />
                        </VStack>

                        <HStack spacing={2}>
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                                placeholder={tr('اكتب سؤالك هنا...', 'Type your question here...')}
                                bg="white"
                                _dark={{ bg: 'gray.800' }}
                                borderColor="purple.200"
                                _focus={{ borderColor: 'purple.500' }}
                                disabled={isLoading}
                            />
                            <IconButton
                                icon={<FiSend />}
                                colorScheme="purple"
                                onClick={() => sendMessage(inputValue)}
                                isLoading={isLoading}
                                aria-label={tr('إرسال', 'Send')}
                            />
                        </HStack>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default AIAssistant;
