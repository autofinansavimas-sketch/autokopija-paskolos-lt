
-- Drop existing overly permissive policies
DROP POLICY "Users can view all reminders" ON call_reminders;
DROP POLICY "Users can create reminders" ON call_reminders;
DROP POLICY "Users can update reminders" ON call_reminders;
DROP POLICY "Users can delete reminders" ON call_reminders;

-- Create user-scoped policies
CREATE POLICY "Users can view own reminders"
  ON call_reminders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own reminders"
  ON call_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved());

CREATE POLICY "Users can update own reminders"
  ON call_reminders FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete own reminders"
  ON call_reminders FOR DELETE
  USING (auth.uid() = user_id OR is_admin());
