import React, { useState } from 'react';
import axios from 'axios';
import styles from '../CSS/SignUpPage.module.css';

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: 'Student', // Default role, you can set this dynamically based on user selection
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:8080/api/users/signup', formData);
            console.log('Signup successful:', response.data);
            alert('User registered successfully!');
        } catch (error) {
            console.error('There was an error signing up:', error);
            
            // Check if the error has a response (for Axios errors)
            if (error.response) {
                const errorMessage = error.response.data;  // This is the message returned from the backend
                
                if (errorMessage === 'Email is already in use') {
                    alert('An account with this email already exists. Please use a different email.');
                } else {
                    alert(`Error signing up: ${errorMessage}`);
                }
            } else if (error.request) {
                // No response from the server
                console.error('Request error:', error.request);
                alert('No response from server. Please try again later.');
            } else {
                // Other errors
                console.error('Error message:', error.message);
                alert('Error signing up. Please try again.');
            }
        }
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.signupMaterial}>
                <div className={styles.signupBox}>
                    <h2 className={styles.signupTitle}>Sign Up</h2>
                    <form className={styles.signupForm} onSubmit={handleSubmit}>
                        <div className={styles.signupField}>
                            <label className={styles.signupLabel} htmlFor="fullname">Full Name:</label>
                            <input
                                className={styles.signupInput}
                                type="text"
                                id="fullname"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.signupField}>
                            <label className={styles.signupLabel} htmlFor="email">Email:</label>
                            <input
                                className={styles.signupInput}
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.signupField}>
                            <label className={styles.signupLabel} htmlFor="password">Password:</label>
                            <input
                                className={styles.signupInput}
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.signupField}>
                            <label className={styles.signupLabel} htmlFor="role">Role:</label>
                            <select
                                className={styles.signupSelect}
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>
                        <button className={styles.signupButton} type="submit">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
