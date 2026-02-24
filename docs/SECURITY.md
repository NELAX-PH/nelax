# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2.0 | :x:                |

## Security Vulnerability Reporting

The Nelax development team takes security seriously and is committed to protecting the security of our users' data. If you discover a security vulnerability, please follow these steps to report it responsibly.

### How to Report a Vulnerability

To report a security vulnerability, please:

1. **Do NOT** create a public issue on GitHub
2. Send an email to: `nelax.mail@protonmail.com`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Screenshots or code examples (if applicable)
4. Your report will be acknowledged within 48 hours

### What to Expect

After receiving a vulnerability report:

- **Initial Response**: You will receive an acknowledgment within 48 hours
- **Investigation**: We will investigate the issue thoroughly
- **Resolution**: We will work to fix the vulnerability and release a patch
- **Disclosure**: We will coordinate public disclosure with you

### Disclosure Timeline

- **Vulnerabilities requiring immediate action (Critical)**: Disclosed within 7-14 days of fix deployment
- **Vulnerabilities requiring scheduled patching**: Disclosed within 30 days of fix deployment
- **Design issues or future improvements**: Disclosed at the next major release

## Security Measures

### Authentication & Authorization

- **Email-based authentication**: Secure email verification for new users
- **Password reset flow**: Time-limited tokens with secure expiration
- **Rate limiting**: IP-based rate limiting for authentication endpoints
- **Session management**: Secure session handling with timeout controls
- **Row Level Security**: Supabase RLS policies for database access control

### Data Protection

- **Encryption**: All data encrypted in transit using HTTPS/TLS
- **CSP headers**: Content Security Policy to prevent XSS attacks
- **HSTS**: HTTP Strict Transport Security enabled
- **Input validation**: Zod schema validation for all API inputs
- **SQL injection prevention**: Parameterized queries via Supabase ORM
- **XSS prevention**: Proper escaping and sanitization of user content

### Infrastructure Security

- **Secret management**: Environment-based secret management
- **Error monitoring**: Sentry integration for error tracking and alerting
- **Dependency scanning**: Regular security audits of dependencies
- **Security headers**: OWASP-recommended security headers
- **CI/CD security**: Automated security checks in deployment pipeline

### Monitoring & Logging

- **Error tracking**: Real-time error monitoring with Sentry
- **Audit logging**: User action logging for security audits
- **Performance monitoring**: Core Web Vitals and API response times
- **Alerting**: Critical security issue alerts via email

## Security Best Practices

### For Users

1. **Use strong passwords**: Minimum 12 characters with mixed case, numbers, and symbols
2. **Enable email verification**: Verify your email address during registration
3. **Beware of phishing**: Always verify the URL before entering credentials
4. **Report suspicious activity**: Use the "Suspicious Activity" feature if available
5. **Keep your account secure**: Enable two-factor authentication when available (coming soon)

### For Developers

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Follow security guidelines**: Adhere to OWASP Top 10 security practices
3. **Review dependencies**: Regularly audit and update third-party packages
4. **Test security**: Include security testing in CI/CD pipeline
5. **Follow disclosure policy**: Responsibly handle security vulnerabilities

### For Contributors

When contributing to Nelax:

- Follow secure coding standards
- Add tests for security-sensitive code
- Review all code for potential vulnerabilities
- Report security concerns privately
- Participate in security audits

## Security Incident Response

### Incident Classification

- **Critical**: Immediate threat to data integrity or availability
- **High**: Potential data breach or service disruption
- **Medium**: Vulnerable component without immediate threat
- **Low**: Non-exploitable or theoretical vulnerability

### Response Process

1. **Detection**: Vulnerability discovered
2. **Confirmation**: Verify the vulnerability and assess impact
3. **Containment**: Limit the scope of the vulnerability
4. **Remediation**: Develop and test a fix
5. **Deployment**: Deploy the fix to production
6. **Communication**: Notify affected users (if applicable)
7. **Post-mortem**: Analyze and improve processes

### Communication Channels

- **Public announcements**: Security advisories on our website
- **Direct notifications**: Email notifications to affected users
- **Security updates**: Patch notes and upgrade guides
- **Developer updates**: GitHub security advisories

## Compliance & Privacy

### Legal Compliance

- **Data Privacy Act (Philippines)**: Compliance with RA 10173
- **GDPR**: Compliance with EU General Data Protection Regulation
- **Terms of Service**: Full terms and conditions of use
- **Privacy Policy**: How we collect, use, and protect your data

### Data Protection

- **Data minimization**: Collect only necessary information
- **Right to access**: Users can request their data
- **Right to deletion**: Users can delete their accounts
- **Right to export**: Users can export their data
- **Data retention**: Clear data retention policies

## Security Testing

### Automated Testing

- **Dependency scanning**: npm audit for vulnerable dependencies
- **Static analysis**: ESLint and TypeScript analysis
- **OWASP ZAP**: Automated security scanning (coming soon)
- **Snyk**: Continuous security monitoring

### Manual Testing

- **Penetration testing**: Regular security assessments
- **Code review**: Security-focused code reviews
- **Threat modeling**: Identify potential attack vectors
- **Security audits**: Third-party security reviews

### Testing Tools

- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **Sentry**: Error tracking and monitoring
- **Lint-staged**: Pre-commit security checks

## Supported Cryptography

### Encryption Standards

- **TLS 1.3**: For all HTTPS connections
- **AES-256**: For data at rest (via Supabase)
- **SHA-256**: For password hashing (via Supabase Auth)
- **HMAC**: For request signing and verification

### Future Enhancements

- **End-to-end encryption**: For sensitive user data (roadmap)
- **Client-side encryption**: For additional security (roadmap)
- **Hardware tokens**: For 2FA support (roadmap)

## Third-Party Services

### Security of External Services

The following third-party services are integrated and have their own security measures:

- **Supabase**: PostgreSQL database with built-in security
- **PayMongo**: PCI-DSS compliant payment processing
- **Resend**: Secure email delivery with HTTPS
- **Sentry**: Secure error tracking with encryption
- **Vercel**: Secure hosting with HTTPS and DDoS protection

### Provider Security Policies

Each service provider maintains their own security policies which can be reviewed on their respective websites.

## Security Roadmap

### Planned Security Enhancements

- [ ] Multi-factor authentication (MFA/2FA)
- [ ] Intrusion detection system
- [ ] Advanced threat monitoring
- [ ] Automated security testing in CI/CD
- [ ] Security headers optimization
- [ ] CSP report-only mode testing
- [ ] API rate limiting and throttling
- [ ] Web Application Firewall (WAF)
- [ ] Bug bounty program

### Current Security Status

**Overall Security Maturity**: Level 3 (Advanced)

- Authentication: :white_check_mark: Implemented
- Data Protection: :white_check_mark: Implemented
- Infrastructure Security: :white_check_mark: Implemented
- Monitoring: :white_check_mark: Implemented
- Compliance: :warning: In Progress
- Testing: :warning: In Progress

## Contact

### Security Team

For security-related inquiries:

- **Email**: [Security Team Mail](<mailto:nelax.mail@protonmail.com?subject=Priority%20-%20Security%20|%20(Don't%20remove%20this%20subject%20unknown%20subject%20will%20be%20declined)>)
- **GitHub Security Advisory**: [Create security advisory]
- **PGP Key**: Available on request (for sensitive communications)

### Non-Security Issues

For bugs, feature requests, or non-security issues:

- **GitHub Issues**: [Create an issue](https://github.com/NELAX-PH/nelax/issues)
- **Support**: [General Inquiries](<mailto:nelax.mail@protonmail.com?subject=General%20Inquiries%20|%20(Don't%20remove%20this%20subject%20unknown%20subject%20will%20be%20declined)>)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

---

Last Updated: 2026-02-24
Version: 0.2.1
