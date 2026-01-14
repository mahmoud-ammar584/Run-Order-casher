import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
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
            toast({ title: 'تم إنشاء الحساب بنجاح', status: 'success' });
            navigate('/');
        } catch (error: any) {
            toast({
                title: 'خطأ في التسجيل',
                description: error.response?.data?.message || 'حدث خطأ',
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
                    <Heading size="lg">إنشاء حساب جديد</Heading>

                    <FormControl isRequired>
                        <FormLabel>اسم المنشأة</FormLabel>
                        <Input
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            placeholder="مثال: مطعم النخيل"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="أحمد محمد"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="example@domain.com"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="username"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>كلمة المرور</FormLabel>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="********"
                        />
                    </FormControl>

                    <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
                        تسجيل
                    </Button>

                    <Text fontSize="sm">
                        لديك حساب؟{' '}
                        <Link color="blue.500" onClick={() => navigate('/login')}>
                            سجل دخول
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default RegisterPage;
