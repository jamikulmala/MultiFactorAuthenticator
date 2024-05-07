import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button1, Container, Header, HelpButton, TextField1 } from "../tools/styles";
import { useAppState } from "../tools/context";
import { isValidEmail } from "../tools/validate";


export const ResetPassword = () => {

    const whitelistRegex = /^[a-zA-Z0-9.@_-]*$/; // allowing alphanumerical characters with . - _ and @ for email
  
    const { setReqStatus } = useAppState();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
  
    const handleEmailChange = (event) => {
      const { value } = event.target;
      if (!whitelistRegex.test(value)) {
        alert('Input contains disallowed characters');
        return;
      }
      setEmail(event.target.value);
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
  
        const url = 'http://localhost:8080/password-reset-request';
  
        const user = {
            Email: email,
        }
    
        const validationErrors = {};
    
        if (!isValidEmail(user.Email)) {
          validationErrors.email = 'Invalid email format';
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
          throw new Error(responseText);
        }
  
        setEmail('');
        
        alert("Password reset link sent to your email. Check your email.")
        navigate("/login");
      } else {
          setErrors(validationErrors);
        }
      } catch (error) {
          console.error('Error:', error.message);
      } 
    };
  
    useEffect(() => {
      setReqStatus("Give your email to receive a password reset link to your email")
    },[setReqStatus]);
  
    return (
      <Container>
        <Header style={{paddingBottom: 20}}>Reset Password</Header>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <TextField1
            label="Email"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            helperText={errors.email}
            style={{width: '100%'}}
          />
          <Button1 variant="contained" type="submit">
            Send Link
          </Button1>
            <HelpButton onClick={() => navigate('/login')}></HelpButton>
        </form>
      </Container>
    );
  };