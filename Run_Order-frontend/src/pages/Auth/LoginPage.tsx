import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password);
            toast({ title: 'تم تسجيل الدخول بنجاح', status: 'success' });
            navigate('/');
        } catch (error: any) {
            toast({
                title: 'خطأ في تسجيل الدخول',
                description: error.response?.data?.message || 'بيانات خاطئة',
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
            <Box bg="white" p={8} borderRadius="lg" shadow="lg" w="400px">
                <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                    <Heading size="lg">تسجيل الدخول</Heading>

                    <FormControl isRequired>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="أدخل اسم المستخدم"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>كلمة المرور</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="أدخل كلمة المرور"
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
                        دخول
                    </Button>

                    <Text fontSize="sm">
                        ليس لديك حساب؟{' '}
                        <Link color="blue.500" onClick={() => navigate('/register')}>
                            سجل الآن
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default LoginPage;
