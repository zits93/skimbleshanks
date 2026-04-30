# Security Policy

## Supported Versions

Below are the versions of Skimbleshanks that are currently receiving security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes              |
| < 1.0   | ❌ No               |

## Reporting a Vulnerability

We take the security of Skimbleshanks and your personal data seriously. If you discover a security vulnerability, please follow these steps:

1. **Do not disclose it publicly.** Public disclosure could put other users at risk.
2. **Contact the maintainer.** Please send an email to the repository owner or use the private reporting feature if available on GitHub.
3. **Provide details.** Include a description of the vulnerability, steps to reproduce, and potential impact.

We aim to acknowledge receipt of your report within 48 hours and provide a fix or mitigation plan as soon as possible.

## Best Practices for Users

- **Personal Data Security**: Your rail credentials and card information are stored securely using the project's configuration system.
- **Card Information**: The Web GUI stores card information only in your browser's `localStorage`. However, we recommend clearing your browser cache if you are using a public or shared computer.
- **Backend Access**: If you host the backend server on the internet, ensure you use HTTPS (e.g., via a proxy like Nginx or cloud services) to protect your credentials during transit.
- **Updates**: Always use the latest version of Skimbleshanks to ensure you have the latest security patches.
