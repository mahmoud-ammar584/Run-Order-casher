import {
    Box,
    HStack,
    Button,
    IconButton,
    useDisclosure,
    useColorMode,
    Container,
    Flex,
    Text,
} from '@chakra-ui/react';
import { FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import AIAssistant from './AIAssistant';

const GlobalHeader = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { locale, toggleLanguage, tr } = useLanguage();
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Box
                bg="white"
                _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                borderBottomWidth="1px"
                borderColor="gray.200"
                position="sticky"
                top={0}
                zIndex={999}
                boxShadow="sm"
            >
                <Container maxW="container.xl">
                    <Flex h="60px" alignItems="center" justifyContent="space-between">
                        <HStack spacing={3}>
                            <Box
                                w="40px"
                                h="40px"
                                borderRadius="lg"
                                bgGradient="linear(to-br, blue.500, purple.600)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontWeight="bold"
                                fontSize="xl"
                            >
                                R
                            </Box>
                            <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, blue.500, purple.600)" bgClip="text">
                                Run Order
                            </Text>
                        </HStack>

                        <HStack spacing={3}>
                            <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<FiGlobe />}
                                onClick={toggleLanguage}
                                colorScheme="blue"
                            >
                                {locale === 'ar' ? 'EN' : 'ع'}
                            </Button>

                            <IconButton
                                size="sm"
                                variant="outline"
                                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                                onClick={toggleColorMode}
                                aria-label={tr('تبديل المظهر', 'Toggle theme')}
                                colorScheme="blue"
                            />

                            <Button
                                size="sm"
                                bgGradient="linear(to-r, purple.500, pink.500)"
                                color="white"
                                _hover={{
                                    bgGradient: 'linear(to-r, purple.600, pink.600)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                _active={{
                                    transform: 'translateY(0)',
                                }}
                                onClick={onOpen}
                                leftIcon={<Text>✨</Text>}
                                boxShadow="md"
                                transition="all 0.2s"
                            >
                                {tr('اسأل الذكاء الاصطناعي', 'Ask AI')}
                            </Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <AIAssistant isOpen={isOpen} onClose={onClose} />
        </>
    );
};

export default GlobalHeader;
