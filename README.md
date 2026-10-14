# SAVIA — University Library

SAVIA is a university library web application that I created as my Capstone project. It allows students to search for books, manage a personal wishlist, borrow or reserve books, track their reading progress, and receive library notifications.

## Live Demo

[Open SAVIA on Netlify](https://savialy.netlify.app/)

## About the Project

The goal of SAVIA is to make common university library tasks easier from a single application. A user can create an account, explore the catalog, check whether a book is available, manage loans and reservations, and keep track of saved books.

The application uses Open Library for book information and Firebase for authentication and application data.

## Main Features

- User registration and login.
- Protected application routes.
- Book search through the Open Library API.
- Category filters and result sorting.
- Detailed book information.
- Wishlist management.
- Book loans and returns.
- Reservations and reservation cancellation.
- Reading progress tracking.
- Personal library with active loans, reservations, and loan history.
- Notifications when a reserved book becomes available.
- User profile.
- Light and dark themes.
- Responsive design.
- Lazy-loaded pages.
- Unit and integration tests.

## Application Flow

After creating an account or logging in, the user enters the book catalog.

The user can:

1. Search for a book by title, author, or keyword.
2. Filter results by category.
3. Sort results by popularity, author, or publication date.
4. Open a book to view its details and availability.
5. Add the book to the wishlist.
6. Borrow the book when it is available.
7. Reserve the book when it is unavailable.
8. Track reading progress as To Read, Reading, or Completed.
9. Return a borrowed book after marking it as Completed.
10. Review loans, reservations, and history in My Library.
11. Read notifications about reserved books.
12. Change the application theme or log out.

SAVIA avoids sending search requests for terms containing only one or two characters. This reduces unnecessary API requests while the user is typing.

## Authentication and Data

### Registration

When a user creates an account:

1. Firebase Authentication creates the account using the email and password.
2. SAVIA stores the user's profile in Cloud Firestore.
3. The authenticated user can access the protected pages.

The profile contains:

- Full name.
- Username.
- Email.
- University code.

If the profile cannot be saved after creating the authentication account, SAVIA removes the incomplete account so the user can try again safely.

### Login and Session Restoration

When a user logs in, Firebase verifies the credentials and SAVIA loads the corresponding profile from Firestore. The profile is stored in Redux and the user is redirected to the catalog.

Firebase keeps the authentication session active. When the application starts again, SAVIA verifies the session and restores the user profile. If the profile cannot be restored, the loading screen finishes and the application displays an error instead of remaining blocked.

### Protected Routes

The following pages require an authenticated user:

- Home.
- Book details.
- My Library.
- Wishlist.
- Profile.
- Settings.
- Notifications.

Users without an active session are redirected to the login page.

## Technologies

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Static typing |
| Vite | Development server and production build |
| React Router | Navigation and protected routes |
| Redux Toolkit | Global authentication and catalog state |
| Axios | Open Library API requests |
| Firebase Authentication | Registration, login, and sessions |
| Cloud Firestore | User profiles, loans, reservations, wishlist, and notifications |
| Jest | Test runner |
| React Testing Library | Component and integration testing |
| Netlify | Production deployment |

## Project Structure

```text
savia/
├── public/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── features/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── types/
├── Unit Tests/
├── Integration Tests/
├── .env.example
├── index.html
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Requirements

Before running the project, install:

- Node.js 22.
- npm.
- A Firebase project with Authentication and Cloud Firestore enabled.

## Installation

Clone the repository:

```bash
git clone https://gitlab.com/jala-university1/cohort-3/ES.CO.CSWB-366.GA.T2.26.M2/SC/maria-escobar/capstone/savia.git
```

Enter the project folder:

```bash
cd savia
```

Install the dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root. The repository includes `.env.example` as a reference.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Add the configuration values from the Firebase project. The `.env` file should not be committed to GitLab.

## Running the Project

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal. By default, Vite normally uses:

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Checks the project with ESLint |
| `npm run test:unit` | Runs the unit tests |
| `npm run test:integration` | Runs the integration tests |
| `npm run test:run` | Runs the complete test suite |

## Tests

The project uses Jest and React Testing Library. External services are mocked, so the tests do not modify real Firebase data.

### Unit Tests

Run only the unit tests:

```bash
npm run test:unit
```

The 17 unit tests cover:

- Button rendering and variants.
- Book cards and fallback information.
- Header navigation.
- Authentication state.
- Book catalog state.
- Search debounce behavior.

### Integration Tests

Run only the integration tests:

```bash
npm run test:integration
```

The 8 integration tests cover:

- Login behavior.
- Protected routes.
- Home page rendering.
- Catalog search, filters, and Redux state.

### Complete Test Suite

Run all tests:

```bash
npm run test:run
```

Expected result:

```text
Test Suites: 9 passed, 9 total
Tests:       25 passed, 25 total
Snapshots:   0 total
```

## Production Build

Create the production build:

```bash
npm run build
```

The optimized files are generated inside the `dist` folder. The build configuration separates the main dependencies into smaller chunks to avoid sending the entire application in one large JavaScript file.

Preview the production build locally:

```bash
npm run preview
```

## Performance Decisions

To improve performance and user experience, I used:

- `React.lazy` to load pages only when they are needed.
- `Suspense` to display a loading screen during page loading.
- `React.memo` to reduce unnecessary component renders.
- `useMemo` for calculated and sorted data.
- `useCallback` for reusable callback references.
- `useDebounce` to reduce unnecessary search requests.
- `AbortController` to cancel outdated API requests.
- Vite code splitting to separate large third-party dependencies.

## Deployment

The application is deployed on Netlify with the following configuration:

```text
Build command: npm run build
Publish directory: dist
Node version: 22
```

The project includes an SPA redirect rule so React Router routes continue working after a page reload. The Netlify domain must also be included in the authorized domains in Firebase Authentication.

## Possible Future Improvements

Some improvements I would consider in a future version are:

- End-to-end tests for complete user flows.
- Profile editing.
- A reservation queue with borrowing priority.
- More detailed availability information.
- Administrative tools for library staff.

## Author

Fernanda Escobar

