import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const apiUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${apiUrl}/users/me`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setIsAuthenticated(true);
                    setUser(userData);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};