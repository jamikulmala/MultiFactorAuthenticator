import { CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppState } from "../tools/context";
import { Container, Button1, TextField1, Header, HelpButton } from "../tools/styles";

const fetchUserProfile = async (state, setUserData, setError) => {
  try {
    if (!state.isLoggedIn) {
      setError("Login to access this page");
      return;
    }
    const token = state.user.token;
    const response = await fetch('http://localhost:8080/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      setError('Failed to fetch user details');
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    const userData = await response.json();
    setUserData(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

const handleDeleteUser = async (state, email, setDeletion, setIsLoggedIn, setError) => {
  try {
    if (!state.isLoggedIn) {
      setError("Session has expired");
      return;
    }
    const token = state.user.token;
    const response = await fetch('http://localhost:8080/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });
    if (!response.ok) {
      alert('Failed to delete user')
      throw new Error('Failed to delete user');
    }
    setDeletion(true)
    setIsLoggedIn(false)
  } catch (error) {
    console.error('Error deleting user:', error.message);
  }
};

const handleLogOut = async (state, email, setIsLoggedIn, setError, setUser) => {
  try {
    if (!state.isLoggedIn) {
      setError("Session has expired");
      return;
    }
    const token = state.user.token;
    const response = await fetch('http://localhost:8080/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });
    if (!response.ok) {
      alert('Failed to logout')
      throw new Error('Failed to logout');
    }
    const responseData = await response.text();
    setUser({token: responseData.token});
    setIsLoggedIn(false)
    console.log("User logged out")
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
};

export const UserView = () => {
  const { state, setReqStatus, setIsLoggedIn, setUser } = useAppState();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [deletion, setDeletion] = useState(false);

  // Timer for token expiration handling
  useEffect(() => {
    let tokenExpirationTimer;
    if (userData && userData.exp) {
      const expirationTime = new Date(userData.exp * 1000);
      const timeRemaining = expirationTime - new Date();
      if (timeRemaining > 0) {
        tokenExpirationTimer = setTimeout(() => {
          // Token has expired, log out the user
          handleLogOut(state, userData.Email, setIsLoggedIn, setError, setUser);
        }, timeRemaining);
      }
    }
    return () => clearTimeout(tokenExpirationTimer);
  }, [userData, state, setIsLoggedIn, setError, setUser]);

  // Timer for session timeout handling
  useEffect(() => {
    let idleTimer;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // User is inactive, log out the user
        handleLogOut(state, userData?.Email, setIsLoggedIn, setError, setUser);
      }, 6000); 
    };

    // Reset idle timer on user interaction
    const handleUserInteraction = () => {
      resetIdleTimer();
    };
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keypress", handleUserInteraction);

    resetIdleTimer(); 

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keypress", handleUserInteraction);
    };
  }, [state, userData, setIsLoggedIn, setError, setUser]);

  useEffect(() => {
    if (!fetched) {
      setReqStatus("");
      fetchUserProfile(state, setUserData, setError);
      setFetched(true);
    }
  }, [state, setReqStatus, setUserData, setError, fetched, setIsLoggedIn]);

  if (error !== "") {
    return (
      <Container>
        <Typography >
          {error}
          <Button1 onClick={() => navigate('/login')}>Login</Button1>
        </Typography>
      </Container>
    );
  }

  if (deletion) {
    return (
      <Container>
        <Typography>
          Account deleted succesfully
        </Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Typography>Fetching user data</Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (!state.isLoggedIn) {
    return (
      <Container>
        <Typography >
          Your session has expired or you have logged out
          <Button1 onClick={() => navigate('/login')}>Login</Button1>
        </Typography>
      </Container>
    );
  }

  const { ID, Email, FirstName, LastName } = userData;

  return (
    <Container>
      <Header>User Information</Header>
      <TextField1
        value={`Email: ${Email}`}
        InputProps={{
          readOnly: true
        }}
        style={{
          width: "20%"
        }}
      />
      <TextField1
        value={`ID: ${ID}`}
        InputProps={{
          readOnly: true
        }}
        style={{
          width: "20%"
        }}
      />
      <TextField1
        value={`First Name: ${FirstName}`}
        InputProps={{
          readOnly: true
        }}
        style={{
          width: "20%"
        }}
      />
      <TextField1
        value={`Last Name: ${LastName}`}
        InputProps={{
          readOnly: true
        }}
        style={{
          width: "20%"
        }}
      />
        <HelpButton onClick={() => handleDeleteUser(state, Email, setDeletion, setIsLoggedIn, setError)}>
          Delete User
        </HelpButton>
        <HelpButton onClick={() => handleLogOut(state, Email, setIsLoggedIn, setError, setUser)}>
          Log Out
        </HelpButton>
    </Container>
  );
};