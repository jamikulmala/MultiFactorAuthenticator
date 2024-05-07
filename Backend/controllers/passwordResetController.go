package controllers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"mfauthenticator/tools"
	"net/http"
	"strconv"
	"text/template"

	"golang.org/x/crypto/bcrypt"
)

func PasswordResetRequestController(w http.ResponseWriter, r *http.Request) {
	var requestData struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Extract the email from the request data
	email := requestData.Email
	if email == "" {
		http.Error(w, "Email not provided", http.StatusBadRequest)
		return
	}

	if !emailExists(email) {
		http.Error(w, "Email does not exist", http.StatusBadRequest)
		return
	}

	resetToken, err := tools.GenerateConfirmationCode()
	if err != nil {
		http.Error(w, "Failed to generate reset token", http.StatusInternalServerError)
		return
	}

	if err := storeResetToken(email, resetToken); err != nil {
		http.Error(w, "Failed to store reset token", http.StatusInternalServerError)
		return
	}

	if err := tools.SendPasswordResetEmail(email, resetToken); err != nil {
		http.Error(w, "Failed to send password reset email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func PasswordResetHandler(w http.ResponseWriter, r *http.Request) {

	email := r.FormValue("email")
	newPassword := r.FormValue("password")

	if email == "" || newPassword == "" {
		http.Error(w, "Email and new password are required", http.StatusBadRequest)
		return
	}

	if !tools.IsWithinLength(newPassword, 8, 72) {
		http.Error(w, "Password must be between 8 and 72 characters long", http.StatusBadRequest)
		return
	}
	if !tools.IsStrongPassword(newPassword) {
		http.Error(w, "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character", http.StatusBadRequest)
		return
	}

	err := updateUserPassword(email, newPassword)
	if err != nil {
		http.Error(w, "Failed to reset password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset successful. Please login with your new password."))
}

func PasswordResetFormHandler(w http.ResponseWriter, r *http.Request) {
	resetToken := r.URL.Query().Get("token")
	if resetToken == "" {
		http.Error(w, "Reset token not provided", http.StatusBadRequest)
		return
	}

	email, err := validateResetToken(resetToken)
	if err != nil {
		http.Error(w, "Invalid reset token", http.StatusBadRequest)
		return
	}

	renderPasswordResetForm(w, email)
}

// Store the reset token in the database for the user
func storeResetToken(email, resetToken string) error {
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	statement := "INSERT INTO reset_tokens (email, token) VALUES ($1, $2)"
	_, err = db.Exec(statement, email, resetToken)
	if err != nil {
		return err
	}

	return nil
}

func renderPasswordResetForm(w http.ResponseWriter, email string) {
	// Define the HTML template for the password reset form
	const resetFormHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Password Reset</title>
    </head>
    <body>
        <h1>Password Reset</h1>
        <p>Enter your new password:</p>
        <form action="/password-reset" method="post">
            <input type="hidden" name="email" value="{{ .Email }}">
            <input type="password" name="password" placeholder="New Password" required>
            <button type="submit">Reset Password</button>
        </form>
    </body>
    </html>
    `

	// Parse the HTML template
	tmpl, err := template.New("resetForm").Parse(resetFormHTML)
	if err != nil {
		http.Error(w, "Failed to render password reset form", http.StatusInternalServerError)
		return
	}

	// Execute the template with the email data
	err = tmpl.Execute(w, struct{ Email string }{Email: email})
	if err != nil {
		http.Error(w, "Failed to render password reset form", http.StatusInternalServerError)
		return
	}
}

func validateResetToken(resetToken string) (string, error) {
	// Query the database to validate the reset token
	email, err := getUserByEmailFromResetToken(resetToken)
	if err != nil {
		return "", err
	}
	return email, nil
}

func getUserByEmailFromResetToken(resetToken string) (string, error) {
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return "", err
	}
	defer db.Close()

	// Query the database to retrieve the email associated with the reset token
	var email string
	err = db.QueryRow("SELECT email FROM reset_tokens WHERE token = $1", resetToken).Scan(&email)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", errors.New("reset token not found")
		}
		return "", err
	}

	return email, nil
}

func updateUserPassword(email, newPassword string) error {
	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update the user's password in the database
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"

	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	// Execute an UPDATE statement to set the new password for the user
	statement := "UPDATE users SET password = $1 WHERE email = $2"
	_, err = db.Exec(statement, hashedPassword, email)
	if err != nil {
		return err
	}

	return nil
}

func emailExists(email string) bool {
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return false
	}
	defer db.Close()

	// Query the database to check if the email exists
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		return false
	}

	return exists
}
