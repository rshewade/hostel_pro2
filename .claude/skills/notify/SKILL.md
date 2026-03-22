---
name: notify
description: Send progress notifications to the user via Slack DM — phase updates, verification results, blockers, and milestones
user-invocable: true
---

# Slack Notification Skill

Send progress updates to the user via Slack DM during development.

## Slack Details

- **User DM Channel**: `D08FLCTGSQP`
- **Tool**: `mcp__claude_ai_slack__slack_send_message`

## Available Operations

When the user invokes `/notify`, or when agents need to send progress updates:

### Manual Notifications
- **`/notify <message>`** — Send a custom message to Slack DM
- **`/notify status`** — Send current migration progress summary

### Automatic Notification Triggers

Agents should send Slack notifications at these milestones:

#### Phase Lifecycle
- **Phase started** — When beginning work on a new phase
  ```
  🚀 *Phase {N} — {Name}* started
  Lead: `{agent}` | Support: `{agent}`
  ```

- **Phase completed** — When all verification passes for a phase
  ```
  ✅ *Phase {N} — {Name}* completed
  Files created: {count} | Tests: {pass}/{total}
  ```

#### Migration Verification
- **Verification passed** — When `/verify-migration` passes
  ```
  ✅ `/verify-migration {target}` — PASSED ({N}/{N} checks)
  ```

- **Verification failed** — When `/verify-migration` fails
  ```
  ❌ `/verify-migration {target}` — NEEDS WORK
  Failures: {list of failed checks}
  ```

#### Blockers & Escalations
- **Blocker found** — When an agent is blocked
  ```
  🚧 *BLOCKER* — {agent} blocked on {description}
  Needs: {what's needed to unblock}
  ```

- **Escalation** — When escalating to architect
  ```
  ⬆️ *ESCALATION* to architect — {reason}
  Context: {brief context}
  ```

#### Testing Milestones
- **Test suite results** — After running full test suite
  ```
  🧪 *Test Results* — {phase/context}
  Unit: {pass}/{total} | Integration: {pass}/{total} | E2E: {pass}/{total}
  ```

- **Visual baseline captured** — After visual testing
  ```
  📸 *Visual baselines captured* — {page}
  Viewports: desktop, tablet, mobile | Browsers: {list}
  ```

#### Waiting for User Action
- **User input needed** — When blocked and waiting for the user to do something
  ```
  ⏳ *ACTION NEEDED* — {what you need}
  Context: {why it's needed}
  Waiting on: {specific action the user should take}
  ```

  Examples of when to send this:
  - Need user to provide environment variable values or secrets
  - Need user to create an external resource (Slack channel, DNS record, third-party account)
  - Need user to approve a destructive or irreversible operation
  - Need user to clarify ambiguous requirements before proceeding
  - Need user to grant access or permissions outside Claude Code
  - Need user to restart a session (e.g., after env var changes)
  - Stuck on an issue that requires human judgment or domain knowledge

  **IMPORTANT**: Always send this notification immediately when blocked. Do not silently wait.

## Implementation

To send a notification, use the Slack MCP tool:

```
mcp__claude_ai_slack__slack_send_message
  channel_id: "D08FLCTGSQP"
  message: "<formatted message>"
```

## Message Formatting Rules

1. **Keep messages concise** — 2-4 lines max
2. **Use emoji prefixes** for quick scanning:
   - 🚀 Phase started
   - ✅ Success/passed
   - ❌ Failed
   - 🚧 Blocker
   - ⬆️ Escalation
   - 🧪 Test results
   - 📸 Visual testing
   - 🔄 In progress
   - 📋 Summary
3. **Bold phase names and key terms** with `*text*`
4. **Use backticks** for commands, file names, agent names
5. **Thread replies** — For detailed follow-ups, reply in thread to the phase-start message using `thread_ts`

## When NOT to Notify

- Routine file reads/writes (too noisy)
- Individual test passes within a suite
- Minor code fixes within a verification loop
- Agent-to-agent coordination messages (handled by teams)

Only notify on **milestones, results, and blockers** — not every action.
