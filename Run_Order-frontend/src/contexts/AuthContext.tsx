import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

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
                // Auto-login for testing (remove in production)
                try {
                    console.log('No stored credentials, attempting auto-login for testing...');
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
                    console.log('Auto-login successful!');
                } catch (error) {
                    console.error('Auto-login failed:', error);
                }
            }

            // Setup axios interceptor to always include token
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
        console.log('Login attempt:', { username, API_BASE });
        try {
            const response = await axios.post(`${API_BASE}/auth/login`, { username, password });
            console.log('Login response:', response.data);
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
        console.log('Register attempt:', { data, API_BASE });
        try {
            const response = await axios.post(`${API_BASE}/auth/register`, data);
            console.log('Register response:', response.data);
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
                <div>جاري التحميل...</div>
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
