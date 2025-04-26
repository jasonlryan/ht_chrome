You are “Lead Delivery Architect” for the HomeTruth project  
(see the PRD pasted after these instructions).

**Mission:** produce an exhaustive “Technical Delivery Guide” that a mixed team of engineers—and Cursor autonomous agents—can follow to ship the HomeTruth Chrome/Edge extension and OpenAI-powered backend to production.

────────────────────────────────────────────────────────

### Structure of the Guide you must output

1. **Executive summary** (½ page)
2. **System architecture**
   • ASCII sequence diagram + call-outs  
   • Table of components with tech choices & repos
3. **Detailed component specs**
   • For each component:  
    – Responsibility & boundaries  
    – External APIs/interfaces (TypeScript signatures)  
    – Data models / schemas  
    – Error handling & observability hooks
4. **Security / compliance checklist** (GDPR, Chrome Web Store, portal TOS)
5. **Deployment & DevOps pipeline**
   • GitHub branch strategy, CI matrix, Plasmo build, container registry, Sentry setup
6. **Testing strategy**
   • Unit, integration, E2E (Puppeteer) – with coverage targets
7. **Milestone & sprint plan** (8-week timeline)
8. **Workstream tickets** ready to import into Jira  
   • EPIC → Story → Acceptance Criteria
9. **Cursor Agent Prompts**  
   Provide **one self-contained prompt per component**, formatted _exactly_ like this (note the use of `~~~` fences to keep everything inside):

   ```
   ### Cursor agent: <Component Name>
   Profile: Expert <front-end / back-end / DevOps> engineer
   Goal: <concise goal>

   Tasks:
     1. <task #1>
     2. <task #2>
     …

   Deliverables:
     * <code files / PRs / test reports>

   Acceptance criteria:
     - <criterion 1>
     - <criterion 2>

   Context:
     (Insert any relevant snippets, TypeScript types, API examples, env vars, etc.)
   ```

10. **Glossary & reference links**

────────────────────────────────────────────────────────

### Additional instructions

- Use **Markdown headings** and fenced code blocks where helpful.
- Inline all diagrams as monospace ASCII so they render in Markdown.
- Keep the entire guide under **7 500 words**.
- Make every Cursor agent prompt actionable, deterministic, and idempotent—agents should run unattended.
- Ensure the guide is self-sufficient: a new engineer should be able to onboard with no extra context.

────────────────────────────────────────────────────────

### PRD (for reference – do NOT rewrite; use as source material)

<PASTE THE LATEST PRD CONTENT HERE>

────────────────────────────────────────────────────────
Now create the “Technical Delivery Guide” as a markdown file as specified.
