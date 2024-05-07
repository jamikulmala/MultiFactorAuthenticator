import { useNavigate } from "react-router";
import { Button1, CheckBoxSmall, Container, Header, HelpButton, HelpText, TextField1 } from "../tools/styles";
import { useEffect, useState } from "react";
import { useAppState } from "../tools/context";
import { isStrongPassword, isValidEmail, isWithinLength } from "../tools/validate";

export const Register = () => {
  
  const { setReqStatus } = useAppState();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const whitelistRegex = /^[a-zA-Z0-9.@_-]*$/; // allowing alphanumerical characters with . - _ and @ for email

  const handleEmailChange = (event) => {
    const { value } = event.target;
    if (!whitelistRegex.test(value)) {
      alert('Input contains disallowed characters');
      return;
    }
    setEmail(event.target.value);
  };

  const handleNameChange = (event) => {
    const { value } = event.target;
    if (!whitelistRegex.test(value)) {
      alert('Input contains disallowed characters');
      return;
    }
    setName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    const { value } = event.target;
    if (!whitelistRegex.test(value)) {
      alert('Input contains disallowed characters');
      return;
    }
    setLastName(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmChange = (event) => {
    setConfirm(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = async (event) => {
    const url = 'http://localhost:8080/register';

    event.preventDefault();

    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = {
      FirstName: name,
      LastName: lastName,
      Email: email,
      Password: password,
      ConfirmPassword: confirm,
      Checked: isChecked
    }

    const validationErrors = {};

    if (!isValidEmail(user.Email)) {
      validationErrors.email = 'Invalid email format';
    }
    if (!isWithinLength(user.FirstName)) {
      validationErrors.firstName = 'First name length should be between 2 and 50 characters';
    }
    if (!isWithinLength(user.LastName)) {
      validationErrors.lastName = 'Last name length should be between 2 and 50 characters';
    }
    if (!isStrongPassword(user.Password)) {
      validationErrors.passwordStrength = 'Password should be 8 to 72 marks long and contain an upper and a lower case letter, a special character and a number';
    }
    if(user.Password !== user.ConfirmPassword) {
      validationErrors.passwordMatch = 'Password and password confirmation should match';
    }
    if (!isChecked) {
      alert('You need to agree the terms to continue');
      return;
    }

    if (Object.keys(validationErrors).length === 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Reset input fields after successful registration
      setEmail('');
      setName('');
      setLastName('');
      setPassword('');
      setConfirm('');
      setIsChecked(false);
      setErrors({});

      const responseData = await response.text();
      alert(responseData)
      navigate("/login")
    } catch (error) {
        console.error(error.message);
        if (error.message.includes("Email already in use")) {
          alert("Email is already in use");
        }
        return;
    } 
  } else {
    setErrors(validationErrors);
    }
  };

  useEffect(() => {
    setReqStatus("Register By Giving Your Information And Choosing A Strong Password. The Password Is Encypted And The Data Stored Only For Educational Purposes.")
  },[setReqStatus]);

  return (
    <Container>
      <Header style={{paddingBottom: 20}}>Register</Header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <TextField1
          label="Email"
          value={email}
          onChange={handleEmailChange}
          error={errors.email}
          helperText={errors.email}
        />
        <TextField1
          label="First name"
          value={name}
          autoComplete="off"
          onChange={handleNameChange}
          error={errors.firstName}
          helperText={errors.firstName}
        />
        <TextField1
          label="Last name"
          value={lastName}
          onChange={handleLastNameChange}
          error={errors.lastName}
          helperText={errors.lastName}
        />
        <TextField1
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.passwordStrength}
          helperText={errors.passwordStrength}
        />
        <TextField1
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={handleConfirmChange}
          error={errors.passwordMatch}
          helperText={errors.passwordMatch}
        />
        <HelpText>
          By continuing you agree that the application can process your data for educational purposes
          <CheckBoxSmall checked={isChecked} onChange={handleCheckboxChange}></CheckBoxSmall>
        </HelpText>
        <Button1 variant="contained" type="submit">
          Sign Up
        </Button1>
        <HelpText>
          Returning User?
          <HelpButton onClick={() => navigate('/login')}>Sign In Now</HelpButton>
        </HelpText>
      </form>
    </Container>
  );
};