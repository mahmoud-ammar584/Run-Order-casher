import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginPage = () => {
    const { tr } = useLanguage();
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
            toast({ title: tr('تم تسجيل الدخول بنجاح', 'Logged in successfully'), status: 'success' });
            navigate('/');
        } catch (error: any) {
            toast({
                title: tr('خطأ في تسجيل الدخول', 'Login failed'),
                description: error.response?.data?.message || tr('بيانات خاطئة', 'Invalid credentials'),
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
                    <Heading size="lg">{tr('تسجيل الدخول', 'Sign in')}</Heading>

                    <FormControl isRequired>
                        <FormLabel>{tr('اسم المستخدم', 'Username')}</FormLabel>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={tr('أدخل اسم المستخدم', 'Enter username')}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>{tr('كلمة المرور', 'Password')}</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tr('أدخل كلمة المرور', 'Enter password')}
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
                        {tr('دخول', 'Sign in')}
                    </Button>

                    <Text fontSize="sm">
                        {tr('ليس لديك حساب؟', "Don't have an account?")}{' '}
                        <Link color="blue.500" onClick={() => navigate('/register')}>
                            {tr('سجل الآن', 'Register')}
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default LoginPage;
