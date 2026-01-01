-- Create profiles table with approval status
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (is_admin());

-- Admin can update all profiles (approve/reject)
CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_admin());

-- Admin can delete profiles
CREATE POLICY "Admin can delete profiles"
ON public.profiles
FOR DELETE
USING (is_admin());

-- Allow insert for new signups (via trigger)
CREATE POLICY "Allow profile creation on signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, approved)
  VALUES (
    NEW.id, 
    NEW.email,
    -- Auto-approve admin email
    CASE WHEN NEW.email = 'autofinansavimas@gmail.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if current user is approved
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND approved = true
  )
$$;