# Contributing to Nelax Systems

Thank you for your interest in contributing to Nelax Systems! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Git
- Supabase account (for development)

### Development Setup

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/your-username/nelax.git
   cd nelax
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables in `.env.local`.

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Set Up Git Hooks (One-time Setup)**
   ```bash
   npm run prepare
   ```
   This sets up Husky for pre-commit hooks.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types when possible
- Use interfaces over type aliases for object shapes
- Add proper types for all functions and components

### Code Style

- Follow Prettier configuration (`.prettierrc`)
- Use ESLint (configured in `.eslintrc.json`)
- Run `npm run format` before committing
- Run `npm run type-check` to verify type safety

### Component Structure

```typescript
// Component example
'use client';

import { useState } from 'react';

interface Props {
  // Define props interface
}

export default function ComponentName({ prop }: Props) {
  // Component logic
}
```

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Tests: `.test.ts` or `.test.tsx` suffix

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

### Writing Tests

- Use Jest and React Testing Library
- Test behavior, not implementation
- Write meaningful test descriptions
- Aim for 80%+ code coverage

### Test Example

```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ComponentName />)
    expect(getByText(/text/i)).toBeInTheDocument()
  })
})
```

## Submitting Changes

### Branching Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Production hotfixes

### Create a Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Or a bug fix branch
git checkout -b bugfix/your-bug-fix
```

### Commit Guidelines

- Use conventional commit messages:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation
  - `style:` Code style (formatting, etc.)
  - `refactor:` Code refactoring
  - `test:` Test additions/changes
  - `chore:` Maintenance tasks

**Example:**

```bash
git commit -m "feat: add barcode scanning functionality"
```

### Pull Request Process

1. **Update Documentation**
   - Update any relevant documentation
   - Add comments for complex code

2. **Ensure Tests Pass**

   ```bash
   npm run type-check
   npm run lint
   npm test
   npm run build
   ```

3. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

4. **Fill PR Template**
   - Describe your changes
   - Link to related issues
   - Add screenshots if relevant
   - Mark checklist items

5. **Wait for Review**
   - Address reviewer comments
   - Make requested changes
   - Update PR as needed

## Code Review Process

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Performance implications
- Security considerations
- Breaking changes

### Reviewer Responsibilities

- Provide constructive feedback
- Suggest improvements
- Verify tests pass
- Check for potential issues

### Author Responsibilities

- Respond to all comments
- Make requested changes
- Update documentation
- Ensure all checks pass

## Additional Guidelines

### Performance

- Avoid unnecessary re-renders
- Use React.memo when appropriate
- Implement lazy loading for large components
- Optimize database queries

### Security

- Never commit secrets or API keys
- Validate all user inputs
- Use environment variables for sensitive data
- Keep dependencies updated

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

## Getting Help

If you need help:

- Check existing issues
- Create a new issue with details
- Ask questions in discussions
- Contact maintainers

## License

By contributing to Nelax Systems, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Nelax Systems!
