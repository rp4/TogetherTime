# Together Time

A visualization tool that shows parents how much time they have left with their children as they grow up.

## Supabase Setup Instructions

This application uses Supabase for storing email subscriptions for milestone alerts. The application is configured to use Supabase via CDN, so no npm installation is required.

Follow these steps to set up Supabase:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the SQL Editor, create a new table with the following SQL:

```sql
CREATE TABLE milestone_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  child_birth_month TEXT NOT NULL,
  child_birth_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE milestone_subscribers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserts from the client
CREATE POLICY "Allow anonymous inserts" ON milestone_subscribers
  FOR INSERT WITH CHECK (true);
```

4. Get your Supabase URL and anon key from the project settings
5. Update the `src/supabaseClient.js` file with your Supabase URL and anon key:

```javascript
const supabaseUrl = 'your_supabase_url';
const supabaseAnonKey = 'your_supabase_anon_key';
```

## Running the Application

Since the application uses Supabase via CDN, you don't need to install any additional npm packages. You can simply open the `index.html` file in a browser or use a local server to run the application.

If you have PowerShell execution policy issues with npm, you can try one of these approaches:

1. Run PowerShell as administrator and execute:
```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

2. Or use this command to bypass the execution policy for a single command:
```
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

[by: DadYears](https://dadyears.art/)