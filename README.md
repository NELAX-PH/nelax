# Nelax

Nelax is a SaaS POS (Point of Sale) and inventory management platform designed specifically for small shop owners in the Philippines. It provides an intuitive interface for managing products, tracking sales, and monitoring inventory levels with powerful analytics to help businesses grow.

## Features

### Completed Features

- **Authentication System**
  - Email-based sign up and login
  - Secure password reset with token expiration
  - IP-based rate limiting for auth endpoints

- **Dashboard**
  - Overview dashboard with key metrics
  - Analytics for sales and inventory
  - Profile management

- **Inventory Management**
  - Product catalog management
  - Stock tracking and alerts

- **Sales Recording**
  - Quick sales entry
  - Real-time inventory updates

- **Payment Integration**
  - PayMongo integration for payments
  - Support for multiple payment methods (GCash, Maya, credit/debit cards)

- **Plans & Pricing**
  - Lite and Pro subscription tiers
  - Flexible payment options

- **Email System**
  - Transactional emails via Resend
  - Welcome, password reset, and notification emails

- **Error Tracking**
  - Sentry integration for error monitoring
  - Detailed error reporting and alerting

- **Security**
  - Content Security Policy (CSP) headers
  - HTTPS enforcement with HSTS
  - OWASP compliance

- **Developer Experience**
  - Full TypeScript support
  - ESLint and Prettier with pre-commit hooks
  - Comprehensive testing setup (Jest + Playwright)
  - CI/CD pipeline with GitHub Actions

### Planned Features

- Mobile app with offline support
- Multi-store management
- Advanced reporting and analytics
- Barcode scanning
- Bulk import/export (CSV, Excel)
- Multi-language support (English, Tagalog)
- PWA capabilities
- SMS notifications
- Integration with accounting software

## Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner (toast notifications)

### Backend & Infrastructure

- **Database**: Supabase (PostgreSQL with auth)
- **Authentication**: Supabase Auth
- **Payments**: PayMongo (Philippines payment gateway)
- **Email**: Resend
- **Monitoring**: Sentry (error tracking)

### Development Tools

- **Testing**: Jest (unit), Playwright (E2E)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky with lint-staged
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd nelax
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ci` - Run E2E tests in CI mode

## Project Status

**Overall Completion**: ~45% (Phase 1 & 2 in progress)

### Current Phase Focus

- **Phase 1**: Critical Security & Stability - ~55% complete
- **Phase 2**: Core Production Features - ~50% complete
- **Phase 3**: Quality & Performance - ~40% complete
- **Phase 4**: Enhanced Features - ~10% complete
- **Phase 5**: Compliance & Scalability - ~25% complete

### Roadmap

1. **Week 1-2**: Complete testing infrastructure and security hardening
2. **Week 3-4**: Implement core production features (email, payments, CI/CD)
3. **Week 5-6**: Performance optimization, SEO, accessibility
4. **Week 7-8**: PWA implementation, advanced analytics
5. **Week 9-10**: Compliance improvements and scalability

## Documentation

- [Production Readiness Checklist](docs/NOTE.md) - Detailed checklist and implementation status
- [Database Documentation](docs/database.md) - Database schema and structure
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute to the project
- [Security Policy](docs/SECURITY.md) - Security measures and vulnerability reporting
- [Privacy Policy](docs/privacy.md) - Privacy policy and data handling

## Deployment

The easiest way to deploy this app is on [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

For manual deployment:

1. Build the application

```bash
npm run build
```

2. Start the production server

```bash
npm run start
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) to get started.

## License

This project is currently private.

## Support

For issues, feature requests, or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for small businesses in the Philippines
