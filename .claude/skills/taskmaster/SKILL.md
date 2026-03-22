---
name: taskmaster
description: Manage tasks via task-master-ai CLI — update tasks, add subtasks, list, set status, expand, and more
user-invocable: true
---

# Task Master CLI Skill

Manage project tasks using the `task-master-ai` CLI when MCP tools are insufficient or error out.

## Project Root

All commands must include `--project-root /mnt/data/projects/devbox/hostel_pro_new`

## Available Operations

When the user invokes `/taskmaster`, determine what they need:

### Task Management
- **`/taskmaster list`** — List all tasks with status
  ```bash
  bunx task-master-ai list --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster list --status <status>`** — Filter by status (pending, in-progress, done, blocked, deferred, cancelled, review)
  ```bash
  bunx task-master-ai list --status pending --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster show <id>`** — Get task details
  ```bash
  bunx task-master-ai show <id> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster next`** — Find next task to work on based on dependencies
  ```bash
  bunx task-master-ai next --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

### Status Updates
- **`/taskmaster status <id> <status>`** — Set task status
  ```bash
  bunx task-master-ai set-status --id <id> --status <status> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```
  Valid statuses: `pending`, `in-progress`, `done`, `blocked`, `deferred`, `cancelled`, `review`

- **`/taskmaster done <id>`** — Mark task as done (shorthand)
  ```bash
  bunx task-master-ai set-status --id <id> --status done --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

### Task Modification
- **`/taskmaster update <id> <description>`** — Update a task's details
  ```bash
  bunx task-master-ai update-task --id <id> --prompt "<what to change>" --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster expand <id>`** — Expand a task into subtasks
  ```bash
  bunx task-master-ai expand --id <id> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster expand <id> --num <N>`** — Expand with specific number of subtasks
  ```bash
  bunx task-master-ai expand --id <id> --num <N> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster add-subtask <parentId> <title>`** — Add a subtask to existing task
  ```bash
  bunx task-master-ai add-subtask --parent <parentId> --title "<title>" --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

### Task Creation
- **`/taskmaster add <title>`** — Add a new task
  ```bash
  bunx task-master-ai add-task --prompt "<task description>" --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster add <title> --depends <id1,id2>`** — Add task with dependencies
  ```bash
  bunx task-master-ai add-task --prompt "<task description>" --depends <id1,id2> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

### Bulk Operations
- **`/taskmaster move <id> --after <otherId>`** — Reorder task dependencies
  ```bash
  bunx task-master-ai move --id <id> --after <otherId> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster remove <id>`** — Remove a task
  ```bash
  bunx task-master-ai remove-task --id <id> --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

### Analysis
- **`/taskmaster analyze`** — Analyze task complexity
  ```bash
  bunx task-master-ai analyze-complexity --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

- **`/taskmaster generate`** — Generate task files from tasks.json
  ```bash
  bunx task-master-ai generate --project-root /mnt/data/projects/devbox/hostel_pro_new
  ```

## Important Rules

1. **NEVER edit `.taskmaster/tasks/tasks.json` directly** — always use CLI or MCP tools
2. Always include `--project-root /mnt/data/projects/devbox/hostel_pro_new`
3. If an MCP tool fails, fall back to the CLI equivalent
4. When updating a task, use `--prompt` to describe the changes in natural language
5. Task IDs can be simple numbers (1, 2) or subtask format (1.1, 1.2)

## Available MCP Tools

| Action | MCP Tool |
|--------|----------|
| List all tasks | `mcp__taskmaster-ai__get_tasks` |
| Get task details | `mcp__taskmaster-ai__get_task` |
| Set task status | `mcp__taskmaster-ai__set_task_status` |
| Expand into subtasks | `mcp__taskmaster-ai__expand_task` |
| Update subtask | `mcp__taskmaster-ai__update_subtask` |
| Parse PRD into tasks | `mcp__taskmaster-ai__parse_prd` |
| Find next task | `mcp__taskmaster-ai__next_task` |

## Limitations

- `task-master-ai` is MCP-only — `bunx task-master-ai` starts the MCP server, NOT a CLI
- No MCP tool exists for: update task title/description, add new task, remove task, add subtask
- For operations not supported by MCP tools, the workaround is to use `expand_task` with a `prompt` describing changes, or `parse_prd` with `append: true` to add new tasks
