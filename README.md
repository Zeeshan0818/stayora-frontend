# Stayora

A full-stack hotel booking platform's frontend — built in React to connect to an existing Spring Boot backend (`Airbnbapp`). This README documents the real API contract used, how to run everything locally, what's implemented, and — importantly — a list of backend issues discovered while integrating, several of which must be fixed for parts of the app to work correctly.

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons
**Backend (not modified by this project):** Java, Spring Boot, Spring Security, JWT, Spring Data JPA, PostgreSQL, Razorpay

```
React Frontend  →  REST APIs  →  Spring Boot  →  Spring Data JPA  →  PostgreSQL
```

## Getting started

### 1. Backend

Start PostgreSQL, then run the Spring Boot app as usual. It listens on `http://localhost:8080` with `server.servlet.context-path=/api/v1` — **every endpoint is actually under `/api/v1/...`.**

Before it will work with this frontend, apply the backend fixes in [Required backend fixes](#required-backend-fixes-not-applied-by-this-project) below — at minimum, add CORS configuration, or every request from the frontend will be blocked by the browser.

### 2. Frontend

```bash
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:8080,
# and set VITE_RAZORPAY_KEY_ID to your Razorpay key id (see below)
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL **including the `/api/v1` context path**. Default: `http://localhost:8080/api/v1`. Never hardcoded elsewhere in the app. |
| `VITE_RAZORPAY_KEY_ID` | Razorpay **Key ID** (not the secret) used to open the Razorpay Checkout modal client-side. Public by design — safe to ship in frontend code, unlike `razorpay.key.secret` in the backend's `application.properties`, which must never appear here. |

## Implemented features

- JWT authentication (signup, login, silent session restore via refresh)
- Hotel discovery: search by city/dates/room count, pagination, hotel details with gallery and rooms
- Full booking flow: initialize → add guests → pay (Razorpay Checkout) → server-verified confirmation
- Booking cancellation with confirmation modal, subject to the backend's own rules (must be `CONFIRMED`, and more than 24h before check-in)
- Trips dashboard and booking detail/timeline view
- Profile page
- Host/admin dashboard: create/edit/activate/delete hotels, add/delete rooms
- Route guards for authenticated and host-only pages
- Loading skeletons, empty states, friendly error messages, toast notifications
- Fully responsive, keyboard-accessible UI

## Architecture

```
src/
├── api/            axiosClient, authApi, hotelApi, bookingApi, adminApi
├── components/     Navbar, SearchBar, HotelCard, RoomCard, GuestForm, RouteGuards, ...
├── pages/          Home, SearchResults, HotelDetails, Login, Signup, Profile,
│   ├── booking/    BookingStart, BookingGuests, BookingPayment, BookingConfirmation
│   ├── trips/      Trips, TripDetails
│   └── admin/      AdminLayout, AdminOverview, AdminHotels, AdminHotelForm, ...
├── context/        AuthContext, ToastContext
├── utils/          format, status, jwt, razorpay, bookingStore, adminStore, profileCache
└── App.jsx, main.jsx
```

API logic never leaks into components — every backend call goes through `src/api/*`, all pointed at `VITE_API_BASE_URL`.

## The real API contract (as implemented, not assumed)

| Endpoint | Notes |
|---|---|
| `POST /auth/signup` | Body: `{ name, email, password }` → returns `UserDto` |
| `POST /auth/login` | Body: `{ email, password }` → `{ accessToken }`; also sets a `RefreshToken` cookie |
| `POST /auth/refresh` | Reads a cookie — see [refresh token bug](#2-refresh-token-cookie-name-mismatch) below |
| `GET /hotels/search` | **GET with a JSON body** (`HotelSearchRequest`) — not query params. Implemented with `axios.request({ method: 'get', data })`. |
| `GET /hotels/{id}/info` | Returns `{ hotel, room[] }` |
| `POST /bookings/init` | Body: `BookingRequest` → returns `BookingDto` (includes computed `amount`) |
| `POST /bookings/{id}/addGuests` | Body: `GuestDto[]` → returns updated `BookingDto` |
| `POST /bookings/{id}/payments` | Returns `{ sessionUrl }` — see [Razorpay integration](#3-sessionurl-is-not-a-url) below |
| `POST /bookings/verify-payment` | Body: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }` |
| `DELETE /bookings/{id}` | Only allowed when `CONFIRMED` and >24h before check-in (backend rule) |
| `POST/GET/PUT/DELETE/PATCH /admin/hotels...` | Host-only hotel CRUD + activation |
| `POST/GET/DELETE /admin/hotels/{id}/rooms...` | Host-only room CRUD |

## Backend limitations worked around in the frontend

These are **not bugs I introduced** — they're gaps in the current backend's controllers that I did not paper over by inventing endpoints. Instead, the frontend keeps a small, clearly-labeled local (per-browser) cache built entirely from real API responses, and every screen using it says so in the UI.

1. **No `GET /bookings` or `GET /bookings/{id}`.** `HotelBookingController` only exposes `init`, `addGuests`, `payments`, `verify-payment`, and `DELETE`. "My Trips" (`src/utils/bookingStore.js`) is therefore a device-local history, populated from the real `BookingDto` responses returned by those calls (not fabricated data). **To replace this properly, add `GET /bookings/me` and `GET /bookings/{id}` to the backend**, scoped to the authenticated user.
2. **No `GET /users/me`.** The login response is just `{ accessToken }`, and the JWT payload only carries `email` and `roles` — no name. The signup response *does* include the name once, so `src/utils/profileCache.js` caches it locally at signup time. If a user logs in on a browser that never saw their signup, their name won't display (only email will). **Add a `GET /users/me` endpoint** returning `UserDto` to fix this properly.
3. **No "list my hotels" endpoint.** `HotelController` has create/get-by-id/update/delete/activate, but no list. The host dashboard (`src/utils/adminStore.js`) remembers hotel ids created in the current browser and re-fetches each one with the real `GET /admin/hotels/{id}`. **Add a `GET /admin/hotels` scoped to the authenticated owner.**

## Required backend fixes (not applied by this project)

I was asked to build the frontend only and not touch the backend automatically. The following are real defects found while integrating, and the frontend cannot fully work in local development until at least #1 is fixed.

### 1. CORS is not configured at all

No `CorsConfigurationSource` bean or `@CrossOrigin` exists anywhere in the backend, and `WebSecurityFilter` doesn't call `.cors(...)`. With the frontend on a different port (Vite's `5173`) than the backend (`8080`), the browser will block every request. Add something like:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true); // required — the frontend sends the refresh cookie
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```
...and add `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` to the `securityFilterChain` in `WebSecurityFilter`. This is not something the frontend can work around — it must be fixed server-side.

### 2. Refresh-token cookie name mismatch

`AuthController.login()` sets a cookie named **`RefreshToken`**:
```java
Cookie cookie = new Cookie("RefreshToken", tokens[1]);
```
but `AuthController.refresh()` looks for **`refreshToken`** (lowercase r):
```java
.filter(cookie -> "refreshToken".equals(cookie.getName()))
```
Cookie names are case-sensitive, so `/auth/refresh` will always fail to find the cookie and throw `AuthenticationServiceException`. The frontend calls `/auth/refresh` correctly (with `withCredentials: true`) and handles the failure gracefully (treats it as "not logged in"), but silent session restore and token refresh will not actually work until the two names match. **Fix: make both use the same casing** (e.g. both `refreshToken`).

Related: both the access token and refresh token are generated with the same 10-minute expiry (`JWTService`), which defeats the purpose of having a separate longer-lived refresh token — worth revisiting once the cookie name is fixed.

### 3. `sessionUrl` is not a URL

The spec describes `POST /bookings/{id}/payments` as returning a `sessionUrl` "to use as intended." In the actual implementation, `CheckoutServiceImpl.getCheckoutSession()` returns `order.toString()` — the **JSON string of a Razorpay Order object** (`{"id":"order_...","amount":...,"currency":"INR",...}`), not a redirect URL. Because of this, the frontend uses Razorpay's embedded **Checkout.js modal** (`src/utils/razorpay.js`), parsing the order id/amount/currency out of that JSON and opening the modal client-side, rather than redirecting the browser anywhere. Consider renaming the field to `razorpayOrder` or similar so it isn't mistaken for a URL by future integrators.

One consequence: `BookingServiceImpl.initiatePayments()` requires the booking to be in `GUEST_ADDED` status and flips it to `PENDING` on success — so it can only be called **once** per booking. If the user dismisses or fails the Razorpay modal, the frontend reopens the *same* order client-side rather than calling `/payments` again (which would now fail with "Guests must be added before initiating payment."). If the user navigates away and loses that in-memory order, there is currently no way to resume payment for that booking — this is a real gap worth addressing backend-side (e.g. allow re-initiating payment while `PENDING`).

### 4. Admin authorization path typo

`WebSecurityFilter` restricts hotel-manager-only routes with:
```java
.requestMatchers("/admins/**").hasRole("HOTEL_MANAGER")
```
but the actual controllers are mapped under **`/admin/hotels/**`** (no trailing "s"). Because the pattern never matches, this rule currently does nothing to protect the real admin endpoints. **The frontend's `RequireHost` route guard only hides the dashboard in the UI — it is not a substitute for server-side authorization.** Fix the typo (`/admin/**`) so Spring Security actually enforces the `HOTEL_MANAGER` role on these endpoints.

### 5. No way to become a `HOTEL_MANAGER`

`AuthService.signUp()` always assigns `Set.of(Role.GUEST)`, and there's no endpoint to change a user's role. To test the host dashboard locally, update the role manually in the `app_user` table (or add an admin-only role-management endpoint).

### 6. `Hotel.Owner` is a lazy-loaded `User` entity, serialized as-is

`HotelPriceDto.hotel` is the raw `Hotel` **entity** (not `HotelDto`), which has a `@ManyToOne(fetch = FetchType.LAZY) private User Owner`. Serializing this without a Hibernate-aware Jackson module can throw a `LazyInitializationException`, or — if eagerly loaded — leak the owner's hashed password field in the search response. The frontend does not read or display `hotel.Owner` for this reason. Worth fixing backend-side (map to a DTO, or exclude the field with `@JsonIgnore`).

## Login → authenticated Navbar (and the bug that was fixed here)

`AuthContext` used to derive `isAuthenticated` from whether a *decoded* JWT payload existed (`Boolean(user)`, where `user` was only set if client-side JWT decoding succeeded). That meant a successful login — the backend issued a valid token, `login()` resolved without throwing, the toast and redirect fired — could still leave the Navbar showing the logged-out state if the claims-decoding step had any hiccup, since `user` (and therefore `isAuthenticated`) would silently stay `null` even though a perfectly valid token was sitting in memory.

**Fix:** `isAuthenticated` is now derived from a separate `token` state value — the actual signal of "did the backend give us a session" — set synchronously inside `applySession()` the moment a token is received (from `login()` or a successful `/auth/refresh` restore). Decoding the JWT to read `email`/`roles` is now wrapped in its own `try/catch` purely for **display purposes**; if it fails, the user is still correctly treated as authenticated (just without a role hint, which only affects whether Host Dashboard shows — the core Profile/My Trips/Logout menu is unaffected).

Traced end to end:
1. `Login.jsx` calls `await login({ email, password })` → `AuthContext.login()` calls `POST /auth/login`, gets `{ accessToken }`.
2. `applySession(accessToken)` runs **synchronously** within that same call: `setAccessToken()` (axios header), `setToken(accessToken)` (drives `isAuthenticated`), then best-effort `setUser({ id, email, roles })`.
3. React re-renders `AuthContext.Provider` with `isAuthenticated: true` before `Login.jsx`'s `navigate()` call even runs.
4. `Navbar.jsx` (mounted once at the app root, never unmounted by route changes) re-renders on the same pass, sees `isAuthenticated === true`, and swaps the Log in/Sign up buttons for the account menu — Profile → My Trips → (Host Dashboard, if `isHotelManager`) → Logout.
5. `Login.jsx` then redirects to Home; the Navbar is already showing the authenticated menu by the time Home renders.

## Logout

Clicking Logout (from the desktop account menu or the mobile drawer, both in `Navbar.jsx`, or the button on the Profile page):

- Clears the access token from both the axios layer (`setAccessToken(null)`) and the React `token` state that drives `isAuthenticated`
- Clears the authenticated user/roles state in `AuthContext` (`user` → `null`, `isHotelManager` → `false`)
- Detaches this browser's local trips (`bookingStore.js`) and host hotel ids (`adminStore.js`) from the now-logged-out account by resetting the active "session scope" (`utils/sessionScope.js`) back to a guest namespace — see [per-account local caches](#per-account-local-caches-not-a-backend-fix) below
- Shows a "You've been logged out." toast
- Redirects to Home with `navigate('/', { replace: true })`

**The Navbar returns to Login/Sign up immediately** — same mechanism as login, in reverse: `logout()` sets `token` to `null` synchronously, `isAuthenticated` becomes `false` on the next render, and `Navbar.jsx` swaps back to the logged-out buttons in that same render pass, before the redirect even happens.

**Protected routes become inaccessible immediately.** `RequireAuth`/`RequireHost` (`components/RouteGuards.jsx`) read `isAuthenticated`/`isHotelManager` straight from `AuthContext` on every render — they don't cache a stale answer — so as soon as `logout()` clears that state, any protected route (mounted or navigated to via browser Back/Forward) re-evaluates the guard and redirects to `/login` in the same render pass. Using `replace` (not `push`) for the post-logout navigation also means the authenticated page the user was just on isn't left as a "forward" history entry to accidentally return to.

### There is no backend `/auth/logout` endpoint

This project does not call one, and does not invent one. Logging out only clears frontend state. **The `RefreshToken` cookie set at login is not revoked and remains in the browser** — the backend has no endpoint to invalidate it, so nothing client-side can truly "log out" the refresh token server-side. In practice this is largely masked by the cookie-name bug in [backend fix #2](#2-refresh-token-cookie-name-mismatch) (refresh already fails today regardless), but once that's fixed, note that a stolen/left-behind `RefreshToken` cookie would still be able to mint new access tokens after a user has "logged out" in the UI, until it naturally expires. **Add a `POST /auth/logout` endpoint that clears the cookie server-side (e.g. by re-setting it with `maxAge=0`) and, ideally, revokes/blacklists the refresh token value itself**, and have the frontend call it as part of `AuthContext.logout()`.

### Per-account local caches (not a backend fix)


`bookingStore.js` and `adminStore.js` are device-local stand-ins for missing backend list/detail endpoints (see below). They're namespaced by the signed-in account's email via `sessionScope.js`, so logging out and logging back in as a *different* user on the same browser never shows the previous user's trips, profile name, or hotels. Logging back in as the *same* user restores their own cached data — this is intentional (it mirrors how the rest of this local-cache workaround already behaves) and is not a data leak.

## Error handling

All API errors are translated to plain-language messages (`src/api/axiosClient.js#toFriendlyError`) based on HTTP status: 400/401/403/404/409 get tailored copy; 500s show the backend's own message when present, since `GlobalExceptionHandler` routes several legitimate business-rule exceptions (like "Only confirmed bookings can be cancelled.") through the generic 500 handler rather than a 4xx one. Network failures (no response at all) get their own message. No raw stack traces or exception class names are ever shown.

## Known non-goals / honest limitations

- Payment cannot be retried from a fresh page load once the Razorpay order is lost from memory (see backend fix #3).
- A user's name only displays correctly on the browser where they signed up (see backend limitation #2).
- The host dashboard only shows hotels created in the current browser (see backend limitation #3).
- No server round-trip exists to reconcile "my trips" across devices (see backend limitation #1).
- Logout clears all frontend session state but cannot revoke the `RefreshToken` cookie server-side, since no `/auth/logout` endpoint exists (see [Logout](#logout)).

None of the above are hidden from the person using the app — each screen that relies on a local cache says so in its own words.
