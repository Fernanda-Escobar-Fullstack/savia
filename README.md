# SAVIA — University Library

SAVIA is a university library application that I created as my Capstone project.

In this application, users can create an account, log in, search for books, view book details, save books in a wishlist, make reservations, borrow books, and check their notifications.

## Live Demo

I deployed my project at:

```text
https://savialy.netlify.app

```

## Main Features

In SAVIA, I implemented:

- User registration and login.
- Protected routes.
- Book search.
- Category and sorting filters.
- Book details.
- Wishlist management.
- Book reservations and loans.
- Reservation cancellation and book returns.
- Personal library.
- Notifications.
- User profile.
- Light and dark themes.
- Responsive design.
- Lazy loading.
- Unit and integration tests.

## Authentication Flow

For authentication, I used Firebase Authentication.

### Registration

When a user creates an account:

1. I send the email and password to Firebase Authentication.
2. Firebase creates the account.
3. I save the rest of the user information in Firestore.
4. The user can access the protected pages.

The additional information includes:

- Full name.
- Username.
- University code.
- Email.

### Login

When a user logs in:

1. I send the email and password to Firebase.
2. Firebase verifies the credentials.
3. I get the user's profile from Firestore.
4. I save the user information in Redux.
5. I redirect the user to the home page.

Firebase manages the authentication token and keeps the session active automatically.

### Protected Routes

I protected the main pages of the application.

If a user is not logged in, I redirect them to the login page.

The protected pages include:

- Home.
- Book details.
- My Library.
- Wishlist.
- Profile.
- Settings.
- Notifications.

### Logout

When the user logs out, I close the Firebase session and redirect the user to the login page.

## Application Flow

After logging in, the user enters the book catalog.

The user can:

1. Search for a book.
2. Filter books by category.
3. Sort the results.
4. Open a book to see its details.
5. Add the book to the wishlist.
6. Reserve or borrow an available book.
7. Check loans and reservations in My Library.
8. Read notifications about library activity.
9. Change the application theme.
10. Log out.

For book information, I connected my application to the Open Library API.

Open Library requires at least three characters for a search. I added a validation to prevent requests with only one or two characters.

## Technologies

I used the following technologies:

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- Axios
- Firebase Authentication
- Cloud Firestore
- Open Library API
- Jest
- React Testing Library
- Netlify

## Project Structure

I organized my project in the following way:

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
│   ├── store/
│   └── types/
├── Unit Tests/
├── Integration Tests/
├── .env.example
├── netlify.toml
├── package.json
└── vite.config.ts
```

## Installation

First, I clone the repository:

```bash
git clone https://gitlab.com/jala-university1/cohort-3/ES.CO.CSWB-366.GA.T2.26.M2/SC/maria-escobar/capstone/savia.git
```

Then, I enter the project folder:

```bash
cd savia
```

I install the dependencies:

```bash
npm install
```

## Environment Variables

To connect the project to Firebase, I create a `.env` file in the root of the project.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

I add the Firebase configuration values to this file.

I do not upload the `.env` file to GitLab.

## Running the Project

To start the application, I run:

```bash
npm run dev
```

Then, I open the local URL displayed in the terminal.

It is normally:

```text
http://localhost:5173
```

## Tests

For testing, I used Jest and React Testing Library.

### Unit Tests

To run only the unit tests:

```bash
npm run test:unit
```

I created 17 unit tests for:

- Button.
- BookCard.
- Header.
- Authentication state.
- Book catalog state.
- Search debounce.

Expected result:

```text
Test Suites: 6 passed, 6 total
Tests:       17 passed, 17 total
```

### Integration Tests

To run only the integration tests:

```bash
npm run test:integration
```

I created 8 integration tests for:

- Login.
- Protected routes.
- Home page.
- Catalog.
- Search and filters.
- Redux state.

Expected result:

```text
Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

### All Tests

To run all tests:

```bash
npm run test:run
```

Expected result:

```text
Test Suites: 9 passed, 9 total
Tests:       25 passed, 25 total
Snapshots:   0 total
```

The tests do not modify real Firebase data because I simulate the external services.

## Production Build

To prepare the application for production, I run:

```bash
npm run build
```

The production files are generated inside the `dist` folder.

To preview the production version locally, I run:

```bash
npm run preview
```

## Performance

To improve the performance of my application, I used:

- `React.lazy` to load pages only when they are needed.
- `Suspense` to show a loading screen.
- `React.memo` to prevent unnecessary renders.
- `useMemo` to avoid repeated calculations.
- `useCallback` to reuse functions.
- `useDebounce` to reduce unnecessary searches.
- `AbortController` to cancel old requests.

## Deployment

I prepared my application for deployment on Netlify.

My Netlify configuration uses:

```text
Build command: npm run build
Publish directory: dist
```

I also added a redirect rule so React Router works correctly when a page is reloaded.

After deploying the project, I add the Netlify domain to the authorized domains in Firebase Authentication.

## Author

Fernanda Escobar