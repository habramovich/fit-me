# FitMe

Personal project built with [Spec-Driven Development](https://github.com/github/spec-kit).

Planned stack: Vite + React + TypeScript, local-first (browser storage). See
[.specify/memory/constitution.md](.specify/memory/constitution.md) for project principles.

## Workflow (Claude Code)

| Step | Skill | Output |
|------|-------|--------|
| 1 | `/speckit-specify <feature idea>` | `specs/NNN-feature/spec.md` |
| 2 | `/speckit-clarify` *(optional)* | Resolves open questions in the spec |
| 3 | `/speckit-plan <tech notes>` | `plan.md`, `data-model.md`, `research.md` |
| 4 | `/speckit-tasks` | `tasks.md` |
| 5 | `/speckit-analyze` *(optional)* | Consistency check across artifacts |
| 6 | `/speckit-implement` | Code + tests |

Update principles with `/speckit-constitution`.
