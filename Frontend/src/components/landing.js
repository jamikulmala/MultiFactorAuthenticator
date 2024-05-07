import { useNavigate } from 'react-router';
import { Container, Button1, Button2, SubContainer, Header } from '../tools/styles';
import { useEffect } from 'react';
import { useAppState } from '../tools/context';

export const Landing = () => {

  const navigate = useNavigate();
  const { setReqStatus } = useAppState();

  useEffect(() => {
    setReqStatus("Secure Authentication - Login Or Register To Your Account Using Multifactor Authentication.")
  },[]);

  return (
    <Container>
      <SubContainer>
        <Header>
          MFAuthenticator
        </Header>
      </SubContainer>
      <SubContainer>
        <Button1 variant="contained" onClick={() => navigate('/register')}>
          Register
        </Button1>
        <Button2 variant="contained" onClick={() => navigate('/login')}>
          Login
        </Button2>
      </SubContainer>
    </Container>
  );
};