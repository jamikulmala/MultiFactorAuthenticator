package controllers

import (
	"database/sql"
	"mfauthenticator/tools"
	"net/http"
	"strconv"
)

func VerifyEmailController(w http.ResponseWriter, r *http.Request) {
	// Extract the verification code from the query parameters
	verificationCode := r.URL.Query().Get("token")
	if verificationCode == "" {
		http.Error(w, "Verification code not provided", http.StatusBadRequest)
		return
	}

	// Query the database to find the user with the given verification code
	user, err := getUserByVerificationCode(verificationCode)
	if err != nil {
		http.Error(w, "Failed to find user with verification code", http.StatusNotFound)
		return
	}

	// Update the user's email confirmation status in the database
	err = confirmUserEmail(user.ID)
	if err != nil {
		http.Error(w, "Failed to confirm user's email", http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Email confirmed successfully"))
}

func getUserByVerificationCode(verificationCode string) (tools.User, error) {
	// parametrized queries to deny injection attacks
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	// Connect to the database
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return tools.User{}, err
	}
	defer db.Close()

	// Query the database for the user with the given verification code
	var user tools.User
	err = db.QueryRow("SELECT id, first_name, last_name, email FROM users WHERE verification_code = $1", verificationCode).
		Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email)
	if err != nil {
		return tools.User{}, err
	}

	return user, nil
}

func confirmUserEmail(userID int) error {
	// parametrized queries to deny injection attacks
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	// Connect to the database
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	// Update the user's email confirmation status in the database
	_, err = db.Exec("UPDATE users SET email_confirmed = true WHERE id = $1", userID)
	if err != nil {
		return err
	}

	return nil
}
