# Admin MFA reset runbook

Use only for a verified locked-out Eventies administrator. A superadmin/operator must confirm the requester through the owner-approved offline channel before changing factors.

1. Keep `ADMIN_MFA_ROLLOUT` unchanged while investigating; do not disable MFA globally for one user.
2. In the **staging** Supabase dashboard, open Authentication → Users and locate the verified user ID. Never identify the user from an unverified email request alone.
3. Review recent `auth.mfa_enrolled`, factor-removal, role, and sign-in events. Escalate unexplained activity before reset.
4. Remove only the affected TOTP factor using the dashboard-native factor controls. Do not change the profile role or password.
5. Revoke the user’s other sessions. Ask them to sign in again, enroll a new TOTP factor, store backup access according to owner policy, and complete an AAL2 challenge.
6. Record an audit event containing user ID hash, operator ID hash, reason code, and timestamp—never the TOTP secret or QR payload.
7. Confirm the admin route works at AAL2 and that AAL1/direct privileged calls remain denied.

Production execution requires owner authorization and the production change window. Phase 6 code-side work does not execute this runbook.

