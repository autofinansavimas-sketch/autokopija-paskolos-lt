# Architecture rules

- Staff email sender choices are allowlisted server-side in the email function's branding module; the UI submits a brand identifier, never an arbitrary From address, to prevent sender spoofing.
- Client handoffs reuse assignment and next-action fields plus operator-tagged comments; authenticated update subscriptions refresh coworkers' boards without changing client stages.
- The homepage exit offer uses top-edge mouse intent only, waits for cookie choice, avoids open dialogs, and is capped once per tab session; its CTA reuses ContactFormDialog.