# Day 7: Week 1 Review

> *"Tell me and I forget. Teach me and I remember. Involve me and I learn."* — Benjamin Franklin

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Summarize all 6 core concepts from Week 1 in your own words
- Pass a self-assessment quiz on agent fundamentals
- Identify your strongest and weakest areas
- Connect the concepts together into a unified mental model
- Prepare for Week 2: Building

## 📚 Week 1 Recap

### The Big Picture

This week you learned the **foundations of AI agents**. Here's how everything connects:

```
                          ┌──────────────────┐
                          │   AI AGENT       │
                          │   (Day 1)        │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
              │   TOOLS   │ │  MEMORY   │ │ PLANNING  │
              │  (Day 4)  │ │  (Day 5)  │ │  (Day 6)  │
              └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                          ┌────────┴─────────┐
                          │   PDA LOOP       │
                          │   (Day 2)        │
                          │                  │
                          │  Perceive        │
                          │  ↓               │
                          │  Decide          │
                          │  ↓               │
                          │  Act → Loop!     │
                          └──────────────────┘
                                   │
                          ┌────────┴─────────┐
                          │  vs Chatbot/RAG  │
                          │   (Day 3)        │
                          └──────────────────┘
```

**The core insight:** An AI Agent is an LLM that runs in a **loop**, using **tools** to act on the world, **memory** to learn and persist, and **planning** to break down complex tasks. This is fundamentally different from chatbots (one response) and RAG (one retrieval + one response).

### Day-by-Day Summary

| Day | Topic | Key Takeaway |
|-----|-------|-------------|
| 1 | What is an AI Agent? | Agents are autonomous systems that perceive, decide, and act toward goals |
| 2 | The PDA Loop | The loop is the heartbeat — agents iterate until goals are met |
| 3 | Agent vs Chatbot vs RAG | Start simple; use agents only when complexity demands it |
| 4 | Tools & Function Calling | LLMs don't call functions — they generate JSON, your code executes |
| 5 | Memory & State | Three types: short-term (conversation), long-term (vector DB), working (scratchpad) |
| 6 | Planning & Reasoning | CoT, ReAct, ToT — different strategies for different problem types |

## 📝 Self-Assessment Quiz

Test yourself! Try answering without looking at your notes, then check.

### Concepts (answer in your own words)

**Q1:** Define "AI Agent" in one sentence.

<details>
<summary>Check your answer</summary>

An AI Agent is an autonomous system that uses an LLM to perceive its environment, decide on actions, and execute them using tools in a loop until a goal is achieved.

**Key elements your answer should include:** autonomy, loop/iteration, tools, goal-directed
</details>

**Q2:** What are the three phases of the PDA loop?

<details>
<summary>Check your answer</summary>

1. **Perceive** — gather context (user input, tool results, memory)
2. **Decide** — LLM reasons about what to do next
3. **Act** — execute a tool or return the final answer

The loop repeats until the goal is achieved or max iterations are hit.
</details>

**Q3:** When would you use RAG instead of an agent?

<details>
<summary>Check your answer</summary>

Use RAG when you need to answer questions from a specific knowledge base (company docs, manuals) and don't need multi-step reasoning or tool use. RAG is cheaper, faster, and more predictable than agents.

Use an agent when the task requires **multiple steps**, **real-time information**, or **taking actions** (not just answering questions).
</details>

**Q4:** Why doesn't the LLM execute tools directly?

<details>
<summary>Check your answer</summary>

Security and architecture reasons:
1. **Security:** If LLMs directly executed code, prompt injection could cause harmful actions
2. **Sandboxing:** Your code can validate, rate-limit, and control tool execution
3. **Flexibility:** The same LLM output works with any execution environment
4. **Logging:** You can trace and monitor every tool call
</details>

**Q5:** Name the three types of agent memory and give an example of each.

<details>
<summary>Check your answer</summary>

1. **Short-term memory** — current conversation history (the chat messages)
2. **Long-term memory** — persistent storage across sessions (vector DB storing user preferences)
3. **Working memory** — scratchpad for current task (intermediate research results, draft outlines)
</details>

**Q6:** What's the difference between Chain of Thought and ReAct?

<details>
<summary>Check your answer</summary>

- **Chain of Thought (CoT):** The LLM reasons step by step using only its internal knowledge. No tool use. "Let me think... step 1, step 2, step 3."
- **ReAct:** The LLM interleaves reasoning WITH tool use. "Thought → Action (use tool) → Observation → Thought → Action..." ReAct grounds reasoning in real data.

ReAct = CoT + Tool Use in an interleaved pattern.
</details>

### Scenario Questions

**Q7:** You're building a customer support bot for a shoe store. It needs to answer questions about products (from a catalog), check order status (from an API), and process returns (multi-step workflow). What architecture would you use?

<details>
<summary>Check your answer</summary>

**Hybrid approach:**
- **RAG** for product questions (search the catalog database)
- **Agent with tools** for order status (call the order API) and returns (multi-step workflow with validation, approval, refund)
- **Router** to classify incoming questions and direct them to the right system

A pure chatbot can't check orders. Pure RAG can't process returns. An agent for everything is overkill for simple product questions.
</details>

**Q8:** An agent keeps calling the same tool in a loop with slightly different queries, never reaching a final answer. What's probably wrong and how would you fix it?

<details>
<summary>Check your answer</summary>

Possible issues:
1. **Unclear goal criteria** — the agent doesn't know when to stop. Fix: better system prompt defining success.
2. **Poor tool results** — the tool isn't returning useful information. Fix: improve the tool or try a different one.
3. **Missing max iterations** — no safety limit. Fix: always set `max_iterations`.
4. **Vague task** — the user's request is ambiguous. Fix: ask for clarification.
5. **Context overflow** — old context is being truncated, losing the original goal. Fix: summarize periodically.
</details>

### Code Challenge

**Q9:** Write pseudocode for an agent that:
1. Takes a user's question
2. Searches the web
3. Reads the top result
4. Answers the question based on what it found

<details>
<summary>Check your answer</summary>

```python
def research_agent(question):
    messages = [
        {"role": "system", "content": "Answer questions using web search."},
        {"role": "user", "content": question}
    ]
    
    # Step 1: Search
    search_results = web_search(question)
    messages.append({"role": "tool", "content": search_results})
    
    # Step 2: Read top result
    top_url = extract_first_url(search_results)
    article_text = read_webpage(top_url)
    messages.append({"role": "tool", "content": article_text})
    
    # Step 3: Generate answer
    answer = llm.generate(messages)
    return answer
```

Note: A more sophisticated version would let the LLM decide whether to search more or whether the first result is sufficient (using a proper PDA loop).
</details>

## ✏️ Week 1 Reflection

### Personal Assessment

Rate your understanding (1-5 stars):

| Topic | Rating | Notes |
|-------|--------|-------|
| What is an AI Agent | ⭐⭐⭐⭐⭐ | |
| PDA Loop | ⭐⭐⭐⭐⭐ | |
| Agent vs Chatbot vs RAG | ⭐⭐⭐⭐⭐ | |
| Tools & Function Calling | ⭐⭐⭐⭐⭐ | |
| Memory & State | ⭐⭐⭐⭐⭐ | |
| Planning & Reasoning | ⭐⭐⭐⭐⭐ | |

### Reflection Prompts

Write a few sentences for each:

1. **My biggest "aha moment" this week was...**

2. **The concept I'm most confident about is...**

3. **I'm still a bit unclear on...**

4. **If I had to explain AI agents to a friend in 30 seconds, I'd say...**

5. **The agent I most want to build is...**

### Connect the Dots

Draw or describe how these concepts work together:
- How does **memory** make the **PDA loop** more effective?
- How do **tools** enable **planning** to work?
- Why is the **chatbot vs agent** distinction important for **choosing when to use planning**?

## 📖 Week 1 Resource Library

Everything from this week in one place:

### Essential Reading
- 📄 [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — The single best overview
- 📄 [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — Production patterns
- 📄 [OpenAI: A Practical Guide to Building Agents](https://platform.openai.com/docs/guides/agents) — OpenAI's perspective

### Key Papers
- 📑 [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629) — Foundation of modern agents
- 📑 [Chain of Thought Prompting](https://arxiv.org/abs/2201.11903) — Step-by-step reasoning
- 📑 [Tree of Thoughts](https://arxiv.org/abs/2305.10601) — Multi-path exploration
- 📑 [MemGPT](https://arxiv.org/abs/2310.08560) — OS-inspired memory management
- 📑 [Generative Agents](https://arxiv.org/abs/2304.03442) — Stanford's agent simulation

### GitHub Repos
- ⭐ [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) — Popular autonomous agent
- ⭐ [BabyAGI](https://github.com/yoheinakajima/babyagi) — Elegant task decomposition
- ⭐ [LangChain](https://github.com/langchain-ai/langchain) — Agent framework (Week 2!)
- ⭐ [LangGraph](https://github.com/langchain-ai/langgraph) — Graph-based agent workflows

### Free Courses
- 🎓 [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/)
- 🎓 [DeepLearning.AI: Functions, Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/)

## 🤔 Looking Ahead: Week 2 Preview

Next week, we move from **understanding** to **building**:

| Day | What You'll Do |
|-----|---------------|
| 8 | Set up LangChain and build your first chain |
| 9 | Master prompt engineering for agents |
| 10 | Build custom tools with error handling |
| 11 | Start building a Research Agent (project!) |
| 12 | Add memory to your agent |
| 13 | Test and debug your agent |
| 14 | Review + share what you built |

**To prepare:**
1. ✅ Install Python 3.10+ if you haven't already
2. ✅ Get an OpenAI API key (or Anthropic, or use a local model)
3. ✅ Familiarize yourself with `pip` and virtual environments
4. ✅ Review any concepts from this week that felt shaky

```bash
# Prep for next week
python --version  # Should be 3.10+
pip install langchain langchain-openai python-dotenv
```

## ➡️ Next Steps

Take a breath! You've built a solid foundation. Next week, you'll put all of this into practice by building a real agent with real tools.

**Optional weekend challenge:** Try to explain the PDA loop to someone who knows nothing about AI. Teaching is the best way to learn!

---

*Day 7 of 21 • [← Day 6](day-06-planning-reasoning.md) • [Course Overview](../README.md) • [Week 2, Day 8 →](../week-02/day-08-langchain-intro.md)*
