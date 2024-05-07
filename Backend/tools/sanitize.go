package tools

import (
	"regexp"
)

// WhitelistRegex defines a regular expression pattern for allowed characters
var WhitelistRegex = regexp.MustCompile(`^[a-zA-Z0-9@.-_]+$`)

// SanitizeInput sanitizes user input against SQL injection using a whitelist approach
func SanitizeInput(input string) string {
	// Remove all characters not in the whitelist
	sanitizedInput := ""
	for _, char := range input {
		if WhitelistRegex.MatchString(string(char)) {
			sanitizedInput += string(char)
		}
	}
	return sanitizedInput
}
