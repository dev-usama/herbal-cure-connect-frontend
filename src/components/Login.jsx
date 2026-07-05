import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

export default function Login() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const authUser = async (formData) => {
        try {
            console.log(formData);
            const apiUrl = import.meta.env.VITE_BACKEND_URL;
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
                setError("password", {
                    message: response.status === 401 ? response.text() : "Login failed. Please check your credentials."
                })
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };
    return (
        <div className='auth_div h-screen max-sm:flex-col-reverse max-sm:justify-end sm:flex-row'>
            <div className="auth_container w-[70%] md:w-1/2">
                <div className="login-form-overlay">
                    <h1>Welcome to Herbal Cure!</h1>
                    <p>Enter your Credentials to access your account</p>
                    <form className='loginForm' onSubmit={handleSubmit(authUser)}>
                        <label htmlFor='emailInput'>Email address</label><br />
                        <input id="emailInput" type='email' {...register('email', {
                            required: "Email is required"
                        })} placeholder='Enter your email' /><br />
                        {errors.email && <span role="alert">{errors.email?.message}</span>}
                        <div>
                            <label htmlFor='passwordInput'>Password</label>
                            <a href="#">Forgot Password</a>
                        </div>
                        <input id='passwordInput' name="password" type="password" {...register('password', {
                            required: "Password is required", minLength: {
                                value: 5, message: "Password must be at least 9 characters long"
                            }
                        })} placeholder='Enter your password' /><br />
                        {errors.password && <span role="alert">{errors.password?.message}</span>}
                        <button type="submit">Login</button>
                        { }
                    </form>
                    <div className='redirectToRegisterDiv'>Don&apos;t have an account? <Link to="/register">&nbsp;Sign Up</Link></div>
                </div>
            </div>
            <img className="max-sm:h-24 w-full md:w-1/2" src='https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGVhdmVzfGVufDB8MXwwfHx8Mg%3D%3D' width={500} height={500} alt="leaves" />
        </div>
    );
}