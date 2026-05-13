import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleFormChange = function (e) {
        let fieldName = e.target.name;
        let newValue = e.target.value;
        setFormData((data) => {
            return { ...data, [fieldName]: newValue }
        })
    }

    const authUser = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(apiUrl + '/users/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const responseData = await response.json();
                login(responseData.data);
                navigate('/dashboard');
            } else {
                alert('Login failed. Server responded with status: ' + response.status + ' - ' + response.statusText);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };
    return (
        <div className='auth_div'>
            <div className="login_container">
                <div className="login-form-overlay">
                    <h1>Welcome to Herbal Cure!</h1>
                    <p>Enter your Credentials to access your account</p>
                    <form className='loginForm' onSubmit={authUser}>
                        <label htmlFor='emailInput'>Email address</label><br />
                        <input id="emailInput" type='email' name="email" value={formData.email} onChange={handleFormChange} placeholder='Enter your email' /><br />
                        <div>
                            <label htmlFor='passwordInput'>Password</label>
                            <a href="#">Forgot Password</a>
                        </div>
                        <input id='passwordInput' name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder='Enter your password' /><br />
                        <button type="submit">Login</button>
                    </form>
                    <div className='redirectToRegisterDiv'>Don&apos;t have an account? <Link to="/register">&nbsp;Sign Up</Link></div>
                </div>
            </div>
            <img src='https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGVhdmVzfGVufDB8MXwwfHx8Mg%3D%3D' width={500} height={500} alt="leaves" />
        </div>
    );
}