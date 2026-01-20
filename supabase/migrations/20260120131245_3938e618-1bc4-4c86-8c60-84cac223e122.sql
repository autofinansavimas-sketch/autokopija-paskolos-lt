-- Create call reminders table for scheduling callbacks
CREATE TABLE public.call_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  call_date DATE NOT NULL,
  call_time TIME NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.call_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all reminders" 
ON public.call_reminders 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create reminders" 
ON public.call_reminders 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update reminders" 
ON public.call_reminders 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Users can delete reminders" 
ON public.call_reminders 
FOR DELETE 
TO authenticated
USING (true);

-- Create index for faster date queries
CREATE INDEX idx_call_reminders_date ON public.call_reminders(call_date);
CREATE INDEX idx_call_reminders_submission ON public.call_reminders(submission_id);

-- Add trigger for updated_at
CREATE TRIGGER update_call_reminders_updated_at
BEFORE UPDATE ON public.call_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();