package controllers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/lib/pq"

	"mfauthenticator/tools"

	"golang.org/x/crypto/bcrypt"
)

const (
	dbHost     = "localhost"
	dbPort     = 5432
	dbUser     = "postgres"
	dbPassword = "" // own master user password here
	dbName     = "authenticator"
)

func RegisterController(w http.ResponseWriter, r *http.Request) {
	var user tools.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Sanitize user input
	user.FirstName = tools.SanitizeInput(user.FirstName)
	user.LastName = tools.SanitizeInput(user.LastName)
	user.Email = tools.SanitizeInput(user.Email)

	// Validate user information
	if err := tools.ValidateUserData(user); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}
	if err := tools.PasswordsMatch(user.Password, user.ConfirmPassword); err != nil {
		http.Error(w, "Validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Store user information to postgre and set verification code and send it to email
	verificationCode, err := tools.GenerateConfirmationCode()
	if err != nil {
		http.Error(w, "Failed to generate confirmation code: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := storeUserData(user, string(hashedPassword), false, verificationCode); err != nil {
		if err.Error() == "email already in use" {
			http.Error(w, "Email already in use", http.StatusBadRequest)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	if err := tools.SendConfirmationEmail(user.Email, verificationCode); err != nil {
		http.Error(w, "Failed to send verification link to email "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User registered successfully, Check your email"))
}

func storeUserData(user tools.User, hashedPassword string, emailConfirmed bool, verificationCode string) error {
	// parametrized queries to deny injection attacks
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	statement := `INSERT INTO users (first_name, last_name, email, password, email_confirmed, verification_code) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = db.Exec(statement, user.FirstName, user.LastName, user.Email, hashedPassword, emailConfirmed, verificationCode)
	if err != nil {
		// Check if the error is due to a duplicate key violation
		pgErr, ok := err.(*pq.Error)
		if ok && pgErr.Code == "23505" { // 23505 is the PostgreSQL error code for unique_violation
			return errors.New("email already in use")
		}
		return err
	}

	return nil
}
