# FitHub — Member Portal

Luxury fitness onboarding for Peak Performance Gym.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and copy the Project URL and anon public key.

3. Create a `.env.local` at the project root and add:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Replace your-url and your-anon-key with project api creds. 
you will find the url and anon key in api settings in supabase, which you can access as the member of the org. 

5. Start the dev server:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser.

### Auth Flow IMPORTANT NOTE: 
- email confirmations are enabled (default), the app will prompt the user to verify their email first. After they confirm and log in, the dashboard ensures the profile and membership tables are populated from the stored metadata.
- The dashboard at `/dashboard` shows the logged-in user’s profile, membership tier, and gives a sign-out button so members can confirm their session state quickly.


