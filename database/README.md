# Rovyn Web Design — Database & Auth Setup

## Setup

1. Start XAMPP (Apache + MySQL)
2. Run: `http://localhost/RovynWebDesign/api/setup.php`
3. Restart the Vite dev server after changing `.env`

## Google Sign-In

Configured in `.env` with your Google OAuth client ID. Add `http://localhost:8443` as an authorized origin in Google Cloud Console.

## Sign up (manual)

1. User fills out the registration form (password must include uppercase, lowercase, number, and symbol)
2. A **6-digit verification code** is emailed
3. User enters the code on the Verify Email page
4. Account is created and the user is signed in

In development (`APP_DEBUG=true`), the code is also shown on screen if email delivery fails.

## Sign up (Google — new users only)

1. User signs in with Google
2. A verification code is sent to their Google email
3. User enters the code and chooses:
   - **Auto-generate** — a secure random password is created
   - **Set manually** — same password rules as manual sign-up
4. Account is created

Returning Google users skip this step.

## Forgot password

1. User enters their email
2. A **6-digit verification code** is sent
3. User enters the code + new password on the Reset Password page

## Hidden portal (admin / staff)

There are no visible links. Two-step access:

**Step 1** — On the regular Sign In page:
- Username: `portal`
- Password: `portal123`

**Step 2** — On the Portal Access page, enter either:

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |
| Staff | `staff`  | `staff123` |

You are then taken to the Administration or Operations dashboard.

## Email delivery

By default PHP `mail()` is used. For production, configure your SMTP server or mail relay. Set `APP_DEBUG=false` in `api/config.php` to hide verification codes from API responses.
