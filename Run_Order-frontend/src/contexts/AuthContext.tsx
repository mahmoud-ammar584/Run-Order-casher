import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useLanguage } from './LanguageContext';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    organizationId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { tr } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } else {
                try {
                    const response = await axios.post(`${API_BASE}/auth/login`, {
                        username: 'admin',
                        password: 'admin123'
                    });
                    const { access_token, user: userData } = response.data;
                    setToken(access_token);
                    setUser(userData);
                    localStorage.setItem('token', access_token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                } catch (error) {
                    console.error('Auto-login failed:', error);
                }
            }

            axios.interceptors.request.use(
                (config) => {
                    const currentToken = localStorage.getItem('token');
                    if (currentToken) {
                        config.headers.Authorization = `Bearer ${currentToken}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE}/auth/login`, { username, password });
            const { access_token, user: userData } = response.data;

            setToken(access_token);
            setUser(userData);
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            const response = await axios.post(`${API_BASE}/auth/register`, data);
            const { access_token, user: userData } = response.data;

            setToken(access_token);
            setUser(userData);
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
            console.error('Register error:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>{tr('جار التحميل...', 'Loading...')}</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
