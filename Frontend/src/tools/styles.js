import { styled } from '@mui/system';
import { Box as MuiBox, Button as MuiButton, Typography as MuiTypography, Toolbar as MuiToolbar, TextField as MuiTextField, Checkbox as MuiCheckbox } from '@mui/material';

import backgroundPhoto from './photos/planet-earth-background.jpg';

export const Container = styled(MuiBox)({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundImage: `url(${backgroundPhoto})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    width: '100vw',
    height: '100vh'
});

export const SubContainer = styled(MuiBox)({
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
});

export const Header = styled(MuiTypography)({
    fontSize: '3rem',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    color: '#FFFFFF',
    '&:hover': {color: '#F0F0F0'}
});

export const Button1 = styled(MuiButton)({
    paddingInline: 100,
    margin: 15,
    backgroundColor: '#000000',
    opacity: 0.8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    '&:hover': { backgroundColor: '#000000' }
});

export const Button2 = styled(MuiButton)({
    paddingInline: 100,
    margin: 15,
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
    fontWeight: 'bold',
    color: '#000000',
    '&:hover': { backgroundColor: '#F5F5F5' }
});

export const MainToolbar = styled(MuiToolbar)({
    backgroundColor: '#000000'
});

export const Subheader = styled(MuiTypography)({
    fontSize: '0.9rem',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 1
});

export const TextField1 = styled(MuiTextField)({
    backgroundColor: '#000000',
    borderRadius: '4px',
    marginBottom: '20px',
    opacity: 0.8,
    width: '50%',
    '& .MuiInputBase-input': {
        color: '#FFFFFF',
    },
    '& .MuiInputLabel-root': {
        color: '#FFFFFF', 
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#FFFFFF',
        },
        '&:hover fieldset': {
            borderColor: '#FFFFFF', 
        },
        '&.Mui-focused fieldset': {
            borderColor: '#FFFFFF', 
        },
    },
    '& .MuiFormLabel-root.Mui-focused': {
        color: '#FFFFFF',
    },
});

export const HelpText = styled(MuiTypography)({
    marginTop: '5px',
    font: 'sans-serif',
    color: '#F5F5F5',
    fontWeight: 'bold',
    opacity: 0.9
});

export const HelpButton = styled(MuiButton)({
    color: '#FFFFFF', 
    fontWeight: 'bold',
    '&:hover': {color: '#FFFFFF'}
});

export const CheckBoxSmall = styled(MuiCheckbox)({
    color: '#F5F5F5', 
    '&:hover': {color: '#FFFFFF'},
    '&.Mui-checked': {
    color: '#F5F5F5',
    '&:hover': {
      color: '#FFFFFF',
    },
  },
});
