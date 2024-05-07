package tools

import (
	"errors"
	"net/mail"
	"unicode"
)

type User struct {
	ID               int
	FirstName        string
	LastName         string
	Email            string
	Password         string // to be encrypted with Bcrypt
	ConfirmPassword  string
	Checked          bool
	EmailConfirmed   bool
	VerificationCode string
}

const (
	minNameLength     = 2
	maxNameLength     = 50
	maxEmailLength    = 255
	minPasswordLength = 8
	maxPasswordLength = 72
)

func ValidateUserData(user User) error {
	if !IsValidEmail(user.Email) {
		return errors.New("invalid email format")
	}
	if !IsWithinLength(user.FirstName, minNameLength, maxNameLength) {
		return errors.New("first name length should be between 2 and 50 characters")
	}
	if !IsWithinLength(user.LastName, minNameLength, maxNameLength) {
		return errors.New("last name length should be between 2 and 50 characters")
	}
	if !IsWithinLength(user.Password, minPasswordLength, maxPasswordLength) {
		return errors.New("password length should be between 8 and 72 characters")
	}
	if !IsStrongPassword(user.Password) {
		return errors.New("password should contain an upper and a lower case letter, a special character and a number")
	}
	if !user.Checked {
		return errors.New("you must agree to the terms to continue")
	}
	return nil
}

func IsValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func IsWithinLength(s string, min, max int) bool {
	return len(s) >= min && len(s) <= max
}

func IsStrongPassword(password string) bool {
	var (
		hasUpper   bool
		hasLower   bool
		hasDigit   bool
		hasSpecial bool
	)
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}
	return hasUpper && hasLower && hasDigit && hasSpecial
}

func PasswordsMatch(password string, confirmPassword string) error {
	if password != confirmPassword {
		return errors.New("password and password confirmation don't match")
	}
	return nil
}
