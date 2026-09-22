# Changelog

All notable changes to this project are documented in this file, generated from the git history.

## September 2026

### Added
- Account deletion (soft delete) from the profile page, marking the user record as deleted instead of removing it.
- Mobile device check to block/warn unsupported mobile usage.
- SEO support with robots meta tags and a sitemap.
- Option to view the password while confirming it during signup.
- Server health check API endpoint.

### Changed
- Refactored authentication and data fetching on the client to use React Query.
- Included credentials in fetch requests for improved authentication and authorization.
- Updated username references.

## June 2026

### Added
- Docker configuration and Kubernetes deployment setup.

## April 2026

### Added
- Topic/subtopic selection when browsing the question bank.
- Topic- and subtopic-wise viewing in the question bank.
- SEO optimization with dynamic metadata across all pages.

### Fixed
- Verification token sent in the wrong field in emails.
- CORS error by adding the `cors` package.

## March 2026

### Added
- Login activity monitor for admins.
- Documentation pages.
- MIT License.
- Husky for client build checks.
- Analytics.
- Question bank page.

### Changed
- Redesigned the test result page.
- Refactored and cleaned up code across the app (multiple passes).
- Removed Redis in favor of a simpler approach.
- Removed mock data files.
- Updated the landing page UI.

### Fixed
- Test status showing "in progress" instead of "completed" after auto-submit.

## February 2026

### Added
- Redis-backed caching for saving answers before test submission.
- Test session persistence.
- Help page.
- Privacy policy and terms & conditions pages.
- Logout flow and test history.
- Resources section.
- Enhanced test-taking page UI.
- Subjects and question upload functionality.
- Forget/reset password routes.
- Profile page.
- Admin routes for uploading/adding questions.
- Login and signup flows.
- Coding model and user routes.
- Password reset APIs.
- Authentication APIs.
- MVC architecture for the backend.
- Landing page and dashboard.

### Changed
- Connected the frontend and backend via APIs.

### Fixed
- Missing header removed from the dashboard.
- Unused code removed and a function name typo fixed.
- Test route registration.
- CORS error caused by the frontend URL configuration.
- Various auth bugs.

## January 2026

### Added
- Initial project setup.
