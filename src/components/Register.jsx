import { Link } from 'react-router-dom';
import { useState } from 'react';
function Register() {
    let [formData, setFormData] = useState({
        'name': '',
        'email': '',
        'password': '',
        'age': '',
        'gender': '',
        'phone': ''
    });

    const handleFormChange = function (e) {
        let fieldName = e.target.name;
        let newValue = e.target.value;
        setFormData((data) => {
            return { ...data, [fieldName]: newValue }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = import.meta.env.VITE_API_URL;
        await fetch(apiUrl + '/users/register', {
            method: "POST",
            credentials: 'include',
            headers: { 'content-type': "application/json" },
            body: JSON.stringify(formData)
        }).then((response) => {
            if (response.status == 201) {
                window.location.href = "/";
            } else {
                alert('Server error', response.status);
            }
        }).catch((error) => {
            alert(error);
            console.log(error);
        });
    };
    return (
        <div className='auth_div'>
            <div className='register_container'>
                <div className="register-form-overlay">
                    <h1>Get Started Now</h1>
                    <form className='registerForm' onSubmit={handleSubmit}>
                        <label>Name</label><br />
                        <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter your name" /><br />
                        <label>Email address</label><br />
                        <input name="email" value={formData.email} onChange={handleFormChange} type='email' placeholder="Enter your email" /><br />
                        <label>Phone number</label><br />
                        <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Enter your phone number" /><br />
                        <label>Disease</label><br />
                        <input name="disease" value={formData.disease} onChange={handleFormChange} placeholder="Enter Disease" /><br />
                        <label>Gender</label><br />
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <br />
                        <label>Date of Birth</label><br />
                        <input type='date' value={formData.age} onChange={handleFormChange} name="age" /><br />
                        <label>Password</label>
                        <input name="password" value={formData.password} onChange={handleFormChange} type="password" placeholder="Enter your password" /><br />
                        <button type="submit">Signup</button>
                    </form>
                    <div className='redirectToLoginPage'>Have an account? <Link href="/">&nbsp;Sign In</Link></div>
                </div>
            </div>
            <img src='https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGVhdmVzfGVufDB8MXwwfHx8Mg%3D%3D' width={500} height={500} alt="leaves" />
        </div>
    );
}

export default Register;