# Architecture rules

- Staff email sender choices are allowlisted server-side in the email function's branding module; the UI submits a brand identifier, never an arbitrary From address, to prevent sender spoofing.
- Client handoffs reuse assignment and next-action fields plus operator-tagged comments; authenticated update subscriptions refresh coworkers' boards without changing client stages.