import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../CSS/LoginPage.module.css';

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/users/login', formData);
            console.log('Login response:', response.data);

            sessionStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                email: response.data.email,
                fullname: response.data.fullname,
                role: response.data.role
            }));

            if (response.data.role === 'Teacher') {
                navigate('/teacher-dashboard');
            } else if (response.data.role === 'Student') {
                navigate('/student-dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        setError('User not found');
                        break;
                    case 401:
                        setError('Invalid password');
                        break;
                    case 500:
                        setError('Server error. Please try again later.');
                        break;
                    default:
                        setError(error.response.data.message || 'Login failed');
                }
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.loginContainer} ${styles['night']}`}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>
                    Exam<span>_</span>Point
                </h1>
            </header>
            <div className={styles.materialContainer}>
                <div className={styles.glassBox}></div>
                <div className={styles.box}>
                    <h2 className={styles.title}>Login to Exam Portal</h2>
                    {error && <div className={styles.error}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className={styles.input}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.input}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={`${styles.button} ${styles.login}`}>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        <div className={styles.button}>
                            <a href="/signup" style={{
                                display: 'block',
                                width: '100%',
                                padding: '8px',
                                marginTop: '14px',
                                background: 'rgba(74, 144, 226, 0.12)',
                                border: '1px solid rgba(74, 144, 226, 0.18)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: 400,
                                letterSpacing: '0.5px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(3px)',
                                WebkitBackdropFilter: 'blur(3px)',
                                textShadow: '0 2px 6px rgba(0,0,0,0.45)'
                            }}>Sign Up</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;