# Security Specification: Multi-Tenant Practitioner & Patient Data Isolation

## 1. Data Invariants
1. **Therapists Collection (`/therapists/{therapistId}`)**:
   - Therapists can read their own profile if authenticated (`request.auth.uid == resource.data.authUid` or `request.auth.uid == therapistId`).
   - Unauthenticated or client registration allows initial document creation.
   - Updates to therapist documents require ownership.
2. **Cases Collection (`/cases/{caseId}`)**:
   - Every patient case has an `ownerUid` or `therapistId`.
   - A practitioner can only read or query cases belonging to them (`resource.data.ownerUid == request.auth.uid || resource.data.therapistId == request.auth.uid`).
   - Writes (create, update, delete) must match the caller's identity (`request.resource.data.ownerUid == request.auth.uid`).
3. **Public / Config Collections (`/packages/{packageId}`)**:
   - Readable by everyone (public subscription offerings).
   - Writeable only by admin / server.
4. **Therapist Balances (`/therapist_balances/{therapistId}`)**:
   - Read/write restricted to the therapist themselves (`request.auth.uid == therapistId`).

## 2. Dirty Dozen Payloads Handled
1. Case write without authenticated user.
2. Case query without `where("ownerUid", "==", auth.uid)` filter.
3. Attacker modifying another therapist's patient records.
4. Attacker attempting to read all cases from Firestore.
5. Tampering with tariff definitions in `/packages`.
6. Impersonating another therapistId during case creation.
7. Unassigned legacy case access leak.
8. Modifying another practitioner's stripe balance.
9. Deleting another practitioner's cases.
10. Reading all registered therapist profiles.
11. Overwriting therapist `authUid` with a rogue UID.
12. Injecting malicious un-sanitized fields into cases.
