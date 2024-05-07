package tools

import (
	"crypto/rand"
	"math/big"
	"net/smtp"
)

func SendConfirmationEmail(email, confirmationCode string) error {
	// Sends an email using ethereal email service. No domain or https so using this mockup service to send emails.
	from := "lyric.kassulke@ethereal.email"
	password := "BApZS1RRjXfxzG21MW"
	to := email

	// SMTP server configuration for Ethereal
	smtpHost := "smtp.ethereal.email"
	smtpPort := "587"

	// send the email
	message := []byte(
		"To: " + to + "\r\n" +
			"Subject: Email Confirmation\r\n" +
			"Content-Type: text/html; charset=UTF-8\r\n" + // Set content type to HTML
			"\r\n" +
			"<p>Click the following link to confirm your email: <a href=\"http://localhost:8080/verify?token=" + confirmationCode + "\">Confirm Email</a></p>",
	)

	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message)
	if err != nil {
		return err
	}

	return nil
}

func GenerateConfirmationCode() (string, error) {
	// 6 mark crypto safe code generation using crypto/rand from go
	const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	charsetLen := big.NewInt(int64(len(charset)))

	code := make([]byte, 6)
	for i := range code {
		randomIndex, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}
		code[i] = charset[randomIndex.Int64()]
	}

	return string(code), nil
}
