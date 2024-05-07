
const validEmailRegex   = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const minNameLength     = 2;
const maxNameLength     = 50;
const maxEmailLength    = 255;
const minPasswordLength = 8;
const maxPasswordLength = 72;
const upperCase         = /[A-Z]/;
const lowerCase         = /[a-z]/;
const specialCharacter  = /[!@#$%^&*()_+[\]{};:'"<>,.?~\\-]/;
const number            = /\d/;


export const isStrongPassword = (password) => {
    if (password === "") {
        return false;
    } else if (password.length < minPasswordLength || password.length > maxPasswordLength) {
        return false;
    } else if (!upperCase.test(password)) {
        return false;
    } else if (!lowerCase.test(password)) {
        return false;
    } else if (!number.test(password)) {
        return false;
    } else if (!specialCharacter.test(password)) {
        return false;
    }
    return true;
};

export const isWithinLength = (item) => {
    return item.length >= minNameLength && item.length <= maxNameLength;
};

export const isValidEmail = (email) => {
    if (!validEmailRegex.test(email)) {
        return false;
    } else if(email.length > maxEmailLength) {
        return false;
    }
    return true;
};
