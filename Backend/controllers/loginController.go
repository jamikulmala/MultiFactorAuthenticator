package controllers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"mfauthenticator/tools"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/time/rate"
)

var limiter = rate.NewLimiter(rate.Every(time.Minute), 5)

func LoginController(w http.ResponseWriter, r *http.Request) {
	var user tools.User

	// rate limiting to deny brute force attacks
	if !limiter.Allow() {
		http.Error(w, "Too many requests", http.StatusTooManyRequests)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Failed to decode request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Sanitize and validate
	user.Email = tools.SanitizeInput(user.Email)

	if !tools.IsValidEmail(user.Email) {
		http.Error(w, "Invalid email address", http.StatusBadRequest)
		return
	}

	// Retrieve user by email
	dbUser, err := getUserByEmail(user.Email)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Verify password
	if !verifyPassword(user.Password, dbUser.Password) {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check if email is confirmed
	if !dbUser.EmailConfirmed {
		http.Error(w, "Email not confirmed", http.StatusUnauthorized)
		return
	}

	// Generate token
	token, err := generateToken(dbUser)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func getUserByEmail(email string) (tools.User, error) {
	// parametrized queries to deny injection attacks
	connectionString := "host=" + dbHost + " port=" + strconv.Itoa(dbPort) +
		" user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	// Connect to the database
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return tools.User{}, err
	}
	defer db.Close()

	var user tools.User
	err = db.QueryRow("SELECT id, first_name, last_name, email, password, email_confirmed FROM users WHERE email = $1", email).
		Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.EmailConfirmed)
	if err != nil {
		return tools.User{}, errors.New("user not found")
	}

	return user, nil
}

func verifyPassword(inputPassword, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(inputPassword))
	return err == nil
}

func generateToken(user tools.User) (string, error) {
	// Create a new JWT token with user claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour / 2).Unix(), // Token expiration time expires in 30 minutes
	})

	// Sign the token with a secret key
	tokenString, err := token.SignedString([]byte("1234")) // secret key here
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
