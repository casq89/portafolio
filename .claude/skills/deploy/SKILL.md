---
name: deploy
description: Commit, push to main and report on the production deploy of this portfolio. Use whenever the user asks for a deploy, a push, "sube los cambios", "despliega", "haz push" or similar. Handles the full flow - checks, lint/build, commit, push, watching the GitHub Actions runs and writing a deploy report.
---

# Deploy

The user asking for a deploy or a push through this skill IS the explicit permission to push to `main` (which deploys to production). Do not ask again for that, but do stop and ask if any check below fails.

Talk to the user in Spanish. Commit messages are in Spanish.

## 1. Pre-flight

Run from the repo root:

```bash
git status --short
git branch --show-current
git fetch origin
git log --oneline -1 origin/main
```

- Nothing to commit and nothing ahead of `origin/main` → tell the user there is nothing to deploy and stop.
- Look at every changed file (`git diff --stat`, plus `git status --short` for untracked). Read the diff of anything you did not change yourself in this session, so the report can describe it.
- Never commit secrets: `.env*`, credentials, tokens, private keys, VPS IPs or passwords. If one shows up, stop and ask.
- `origin/main` must be an ancestor of `HEAD` (`git merge-base --is-ancestor origin/main HEAD`). If it is not, stop and explain; never force-push.

## 2. Checks per affected folder

Work out which top-level folders changed (`frontend/`, `backend/`) — they decide which workflows will run.

- `frontend/` changed → `cd frontend && npm run lint && npm run build`
- `backend/` changed → `cd backend && npm run build`

If any fails, stop, show the error and do not commit.

## 3. Commit

- Use the message the user gave. If they gave none, write a short Spanish message describing the change and use it (no need to ask).
- `git add -A`, then commit. End the message with the attribution line from the system reminder, if there is one.

## 4. Push

```bash
git push origin HEAD:main
```

If the current branch is not `main`, also push it to keep it in sync: `git push origin HEAD`.

## 5. Watch the deploy

`gh` may not be on PATH in this shell; fall back to `"/c/Program Files/GitHub CLI/gh.exe"`.

```bash
gh run list --branch main --limit 4 --json databaseId,workflowName,headSha,status,conclusion,createdAt
```

- Keep only the runs whose `headSha` is the commit just pushed. They can take a few seconds to appear; re-check rather than assume.
- Expected: `Deploy frontend` if `frontend/` changed, `Deploy backend` if `backend/` changed. If an expected run never shows up, say so in the report.
- Wait for each one: `gh run watch <id> --exit-status` (run it in the background if it is slow).
- On failure: `gh run view <id> --log-failed`, and quote the relevant lines in the report.

## 6. Report

Finish with a report in Spanish, in chat, shaped like this:

```markdown
## Informe de deploy · <fecha y hora>

**Commit:** `<sha corto>` — <mensaje>
**Rama:** <rama local> → `main`

### Cambios
- <resumen por área: frontend / backend / config>

### Checks locales
| Carpeta | Lint | Build |
|---|---|---|

### Workflows
| Workflow | Resultado | Duración | Link |
|---|---|---|---|

### Notas
- <breaking changes (rutas, eventos de Socket.IO, variables de entorno), pasos manuales, o "Sin incidencias">
```

- State outcomes plainly: if a workflow failed, the report says it failed and why; if something was skipped, say so.
- Include the run URL (`gh run view <id> --json url`).
