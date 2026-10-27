# Source and accuracy notes (review draft v1)

Three kinds of material are kept apart here: what was checked against a primary source, what is made-up teaching data, and what is still undecided. None of these sources appears in the narration.

## 1. Claims checked against sources (read 2026-10-27)

| Claim in the film | Scene | Source and what it says |
|---|---|---|
| The model returns a structured tool call. For client tools, **your application** runs it and sends back a result. A proposed call is not an executed one. | S3, S4a | Anthropic, *Tool use with Claude* (platform.claude.com/docs/en/agents-and-tools/tool-use/overview): Claude "returns a structured call that your application runs (client tools)…"; "Claude responds with `stop_reason: "tool_use"`… Your code runs the operation and sends back a `tool_result`." |
| An agent is a system that uses results from its environment to choose further steps. A fixed sequence of predetermined steps is a different design. | S4b | Anthropic, *Building effective agents* (anthropic.com/research/building-effective-agents): "Workflows are systems where LLMs and tools are orchestrated through predefined code paths." Agents: "LLMs dynamically direct their own processes and tool usage". Also: "typically just LLMs using tools based on environmental feedback in a loop", and they gain "'ground truth' from the environment at each step". |
| On an error, record it, try an allowed alternative, then hand it to a person. | S6 | Same article: "Agents can then pause for human feedback at checkpoints or when encountering blockers." The tool-use docs also describe how to signal tool errors back to the model. |
| A delete can be blocked by a rule enforced **outside the model**. It holds only if it is configured, and pattern rules have gaps. | S7, S11 | Claude Agent SDK, *Configure permissions* (platform.claude.com/docs/en/agent-sdk/permissions, now redirecting to code.claude.com/docs/en/agent-sdk/permissions): "When Claude requests a tool, the SDK checks permissions in this order…". Deny rules apply "even in `bypassPermissions` mode". A `Bash(rm *)` deny rule still lets `/bin/rm` fall through, and critical-path detection "can miss some commands". **That is why the film says "前提是这条规则真的配置了" and never calls the gate a guarantee.** |
| Context is limited, a new session starts with no memory, and a saved progress file lets work resume. | S8 | Anthropic, *Effective harnesses for long-running agents* (anthropic.com/engineering/effective-harnesses-for-long-running-agents): "each new session begins with no memory of what came before"; "context windows are limited"; it describes "a claude-progress.txt file that keeps a log of what agents have done", plus feature lists and git history for recovery. |
| "Saved" is not "correct". Verify against inputs and don't claim everything is done. | S9 | Same article: agents may "declare the job done" too early; "Claude's tendency to mark a feature as complete without proper testing"; giving the model testing tools "dramatically improved performance". |

**About the word "harness".** None of these sources formally defines it. The long-running-agents article only calls the Claude Agent SDK "a powerful, general-purpose agent harness". The film's definition (makes tools available, executes allowed requests, feeds results back, keeps state, enforces limits) is **one useful teaching model, not an industry-standard taxonomy**. The film doesn't present it as a fixed list of universal parts.

**Wording kept deliberately cautious:**
- "模型可能照做，也可能理解偏" (it may comply, or it may misread): a prompt is guidance, not enforcement. No claim about how often models ignore it.
- No claim that any particular product ships with safe defaults.
- No claim of perfect or unlimited memory ("只有写下来的才找得回": only what's written down can be recovered).
- No numbers about agent success rates, speed or cost.

## 2. Synthetic example data (not a recording of a real run)

- The 20 files `报告/01.pdf`–`20.pdf`, the unreadable `08.pdf`, the failed OCR retry, the proposed `delete("08.pdf")`, the `进度.md` file and the 19/20 result are **all invented** for teaching. The frames say "示意数据" (illustrative data) above the folder.
- Tool names `list_files`, `read_pdf`, `OCR`, `delete`, `read` are generic labels, not any vendor's real API.
- The "AI lists five steps" moment in S2 is an illustration, not a quote from a specific product.

## 3. The existing courses: what was used and what was left out

- `/Users/ceci/Repos/courses/...` paths are not on this machine. **This cloud session only has the `ai-agent-learning` repo.** I read its relevant lessons (day 1 What is an agent, day 4 Tools, day 5 Memory, day 6 Explore agents, day 17 Production patterns, headings only).
- **`harness-engineering` is not available here.** I did not read it and made no claims based on it.
- Taken from the course: the ideas "loop vs single reply", "your code executes the tool call", and short-term vs persistent memory. All three were re-checked against the primary sources above.
- Left out on purpose:
  - The "four pillars" fixed list (day 1) and the pizza-driver analogy. The brief asks for one worked example, not a list or an unrelated analogy.
  - Day 5's "How Claude Code Handles Memory" (MEMORY.md, SESSION-STATE.md, daily notes). It describes a custom setup, not documented Claude Code behaviour. **Unverified, so it is not used.**
  - Day 6's list of Claude Code tool names. It is vendor-specific and the film doesn't need it.
- I found no claims in this repo about Claude Code source files, line counts or open-source status. Any such claims would be in `harness-engineering`, which I couldn't open. The film makes **no vendor-specific claims** either way.
- The courses were not changed.

## 4. Unresolved production choices (need your input or a test)

1. **Voice (not tested yet).** The plan is the local Kokoro model through `npx hyperframes tts`. It is free, runs on the machine and has Mandarin voices; `zf_xiaobei` is the one HyperFrames documents. **No voice sample exists yet.** In this session the permission system blocked running the downloaded HyperFrames CLI, and Kokoro also needs `pip install kokoro-onnx soundfile` plus model files. Expect weaker Mandarin quality than cloud voices, and possibly odd pronunciation of Harness, Agent and Model. If it sounds bad, the fallback options are: read only the Chinese terms aloud, or have you record the narration yourself. A cloud voice such as MiniMax (used by the reference creator) or HeyGen would **only** happen with your explicit OK. HyperFrames' own skill suggests HeyGen sign-in first; I'm skipping that because of the brief's "no paid/cloud switch" rule.
2. **Subtitles.** These will be burned in from the narration text, timed with word timestamps from the TTS output. HyperFrames' default transcription model (`small.en`) is English-only, so it is not used for Chinese timing.
3. **Music and sound effects.** HyperFrames recommends them for films over 15 s. The proposal is a quiet music bed under the voice, plus three short sounds: a request sent, a gate denying, a file saved. All CC-licensed or locally generated. Or no music at all, if you prefer.
4. **Font.** The frames use Noto Sans SC and JetBrains Mono (both SIL OFL). For the video they'll be embedded as local font files, because HyperFrames only resolves bundled fonts by name.
5. **Reference video** (xhslink): not opened, since it needs RedNote login. It wasn't needed, and nothing was copied from it.
6. **Timing.** All times are estimates at 4.4 characters per second, total about 3:10. Scenes will be re-timed to the real narration.
