package tools

import "net/smtp"

func SendPasswordResetEmail(email, resetToken string) error {

	from := "lyric.kassulke@ethereal.email"
	password := "BApZS1RRjXfxzG21MW"
	to := email

	smtpHost := "smtp.ethereal.email"
	smtpPort := "587"

	message := []byte(
		"To: " + to + "\r\n" +
			"Subject: Password Reset\r\n" +
			"Content-Type: text/html; charset=UTF-8\r\n" + // Set content type to HTML
			"\r\n" +
			"<p>Click the following link to reset your password: <a href=\"http://localhost:8080/password-reset-form?token=" + resetToken + "\">Reset Password</a></p>",
	)

	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message)
	if err != nil {
		return err
	}

	return nil
}
