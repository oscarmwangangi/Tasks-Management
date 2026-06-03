- [ ] Add `TaskAssignee` model + relation in `prisma/schema.prisma`
- [ ] Update task creation action (where `createTask` is implemented) to insert assignees for all users in selected `team_id`
- [x] Update task listing to show team tasks for all members via `team_id` membership (bridge)
- [ ] Add `TaskAssignee` join table (true multi-assignee)
- [ ] Update task creation to insert assignees for all team members
- [ ] Update task listing to use `TaskAssignee` (instead of `team_id` bridge)

- [ ] Run Prisma migration + generate
- [ ] Smoke test: create task for a team and confirm all members see it

