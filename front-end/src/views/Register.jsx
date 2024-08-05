import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { PasswordTextField } from '../components/Inputs';
import { ButtonSizes } from '../components/Buttons';
import { UnderlineLink} from '../components/Link';
import { AlertDialogSlide } from '../components/Model';
import axios from 'axios';
import OutlinedAlerts from '../components/Alert';
import { UserTextField } from "../components/Inputs";

// this is register page
export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState(null); 

    // go to other page
    const navigate = useNavigate();
    const goLogin = () => {
        navigate("/login");
    }
    
    const goChoice = () => {
        navigate("/choice");
    }
    // post the register information to backend and receive response
    const handleRegister = () => {
        if (password !== confirmPassword) {
            setAlert({ severity: 'warning', message: 'Passwords do not match' });
            return;
        }
        
        axios.post('http://backend:8000/invoice/register/', {    
                username: username,
                password: password,
                name: name,
                email: email,
                confirm_password: confirmPassword,
            }, 
            {headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
          })
        .then(response => {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('userid', response.data.userid);
            setAlert({ severity: 'success', message: 'Register successfully!'});
            goChoice();
        })
        .catch(error => {
            if (error.response) {
                setAlert({ severity: 'error', message: error.response.data.error || 'Registration failed' });
            } else {
                setAlert({ severity: 'error', message: error.message });
            }
        });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center',flexDirection: 'column', alignItems: 'center', height: '100vh', backgroundColor: 'white' }}>
                {alert && (
                    <div style={{
                        position: 'fixed',
                        top: '11vh',
                        right: 10,  
                        width: '30%',
                        zIndex: 9999
                    }}>
                        <OutlinedAlerts severity={alert.severity} onClose={() => setAlert(null)}>
                            {alert.message}
                        </OutlinedAlerts>
                    </div>
                )}
                <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Create an account</h1>
                <UserTextField 
                label="Username" 
                id="Register-Username" 
                dataTestId="Register-Username" 
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}  
                />
                <UserTextField 
                label="Email" 
                id="Register-Email" 
                dataTestId="Register-Email" 
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}  
                />
                <UserTextField 
                label="Name" 
                id="Register-Name"
                dataTestId="Register-Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}  
                />
                <PasswordTextField 
                id="Register-password"
                dataTestId="Register-password"
                label="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                /> 
                <PasswordTextField
                id="Register-confirm-password"
                dataTestId="Register-confirm-password"
                label="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                /> 
                <ButtonSizes dataTestId="Sign-up-btn" onClick={handleRegister}>
                    Sign up
                </ButtonSizes>
                <UnderlineLink onClick={goLogin}  fontsize='10px'>
                    Have an account? Go Login
                </UnderlineLink>
                <AlertDialogSlide  fontsize='8px'/>
        </div>
    );
}