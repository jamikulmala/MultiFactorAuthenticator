package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"mfauthenticator/tools"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const userKey contextKey = "user"

func AuthMiddleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

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

		// Validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("invalid token signing method")
			}
			return []byte("1234"), nil // secret key here
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Error parsing token: %s", err.Error()), http.StatusUnauthorized)
			return
		}
		if !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Extract user information from token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Wrong token", http.StatusUnauthorized)
			return
		}
		email, ok := claims["email"].(string)
		if !ok || email == "" {
			http.Error(w, "Invalid user data", http.StatusUnauthorized)
			return
		}

		user, err := getUserByEmail(email)
		if err != nil {
			http.Error(w, "Could not retrieve email", http.StatusUnauthorized)
			return
		}

		// Set user information in request context for further processing
		ctx := context.WithValue(r.Context(), userKey, user)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserProfileHandler(w http.ResponseWriter, r *http.Request) {
	// Retrieve user information from request context and send the response
	user, ok := r.Context().Value(userKey).(tools.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
