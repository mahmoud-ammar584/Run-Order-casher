import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const RegisterPage = () => {
    const { tr } = useLanguage();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        businessName: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
            toast({ title: tr('تم إنشاء الحساب بنجاح', 'Account created successfully'), status: 'success' });
            navigate('/');
        } catch (error: any) {
            toast({
                title: tr('خطأ في التسجيل', 'Registration failed'),
                description: error.response?.data?.message || tr('حدث خطأ', 'Something went wrong'),
                status: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
            <Box bg="white" p={8} borderRadius="lg" shadow="lg" w="450px">
                <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                    <Heading size="lg">{tr('إنشاء حساب جديد', 'Create a new account')}</Heading>

                    <FormControl isRequired>
                        <FormLabel>{tr('اسم المنشأة', 'Business name')}</FormLabel>
                        <Input
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            placeholder={tr('مثال: مطعم النخيل', 'Example: Palm Restaurant')}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>{tr('الاسم الكامل', 'Full name')}</FormLabel>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder={tr('أحمد محمد', 'John Doe')}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>{tr('البريد الإلكتروني', 'Email')}</FormLabel>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="example@domain.com"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>{tr('اسم المستخدم', 'Username')}</FormLabel>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="username"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>{tr('كلمة المرور', 'Password')}</FormLabel>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="********"
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
                        {tr('تسجيل', 'Register')}
                    </Button>

                    <Text fontSize="sm">
                        {tr('لديك حساب؟', 'Already have an account?')}{' '}
                        <Link color="blue.500" onClick={() => navigate('/login')}>
                            {tr('سجل دخول', 'Sign in')}
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default RegisterPage;
