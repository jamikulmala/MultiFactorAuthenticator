import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button1, Container, Header, HelpButton, HelpText, TextField1 } from "../tools/styles";
import { useAppState } from "../tools/context";
import { isStrongPassword, isValidEmail } from "../tools/validate";

export const Login = () => {

  const whitelistRegex = /^[a-zA-Z0-9.@_-]*$/; // allowing alphanumerical characters with . - _ and @ for email

  const { setReqStatus, setUser, setIsLoggedIn } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginDisabled, setLoginDisabled] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    const { value } = event.target;
    if (!whitelistRegex.test(value)) {
      alert('Input contains disallowed characters');
      return;
    }
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const url = 'http://localhost:8080/login';

      const user = {
        Email: email,
        Password: password
      }
  
      const validationErrors = {};
  
      if (!isValidEmail(user.Email)) {
        validationErrors.email = 'Invalid email format';
      }
      if (!isStrongPassword(user.Password)) {
        validationErrors.passwordStrength = 'Enter A Valid Password';
      }

      if (Object.keys(validationErrors).length === 0) {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const responseText = await response.text()
        alert(responseText)
        if(responseText.includes("Too many requests")) {
          setLoginDisabled(true);
          setTimeout(() => {
            setLoginDisabled(false);
          }, 60000);
        }
        throw new Error(responseText);
      }

      setEmail('');
      setPassword('');
      
      const responseData = await response.json();
      setUser({token: responseData.token});
      console.log(responseData.token);
      setIsLoggedIn(true);
      navigate("/user");
    } else {
        setErrors(validationErrors);
      }
    } catch (error) {
        console.error('Login failed:', error.message);
    } 
  };

  useEffect(() => {
    setReqStatus("Login To Your Account. Email Confirmation Required.")
  },[setReqStatus]);

  return (
    <Container>
      <Header style={{paddingBottom: 20}}>Login</Header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TextField1
          label="Email"
          value={email}
          onChange={handleEmailChange}
          error={errors.email}
          helperText={errors.email}
          style={{width: '100%'}}
        />
        <TextField1
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.passwordStrength}
          helperText={errors.passwordStrength}
          style={{width: '100%'}}
        />
        <HelpButton onClick={() => navigate('/resetPassword')}>Forgot your password?</HelpButton>
        <Button1 variant="contained" type="submit" disabled={loginDisabled}>
          Sign In
        </Button1>
        <HelpText>
           New User?
          <HelpButton onClick={() => navigate('/register')}>Sign Up Now</HelpButton>
        </HelpText>
      </form>
    </Container>
  );
};