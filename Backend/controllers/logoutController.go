package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func LogoutController(w http.ResponseWriter, r *http.Request) {
	// Get token from Authorization header
	authorizationHeader := r.Header.Get("Authorization")
	if authorizationHeader == "" {
		http.Error(w, "No token", http.StatusUnauthorized)
		return
	}
	parts := strings.Split(authorizationHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
		return
	}
	tokenString := parts[1]

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid token signing method")
		}
		return []byte("1234"), nil // secret key
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Set the token expiration time to a past date to invalidate it
	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = time.Now().Unix() - 100

	// Generate a new token with the updated claims
	newToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	newTokenString, err := newToken.SignedString([]byte("1234")) // secret key
	if err != nil {
		http.Error(w, "Failed to generate new token", http.StatusInternalServerError)
		return
	}

	// Return the new token in the response
	w.Header().Set("Authorization", "Bearer "+newTokenString)
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Logout successful")
}
