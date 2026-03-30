# Day 2: The Perceive-Decide-Act Loop

> *"Intelligence is the ability to adapt to change."* — Stephen Hawking

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Explain each phase of the PDA loop in detail
- Trace through a real agent interaction step by step
- Understand the ReAct (Reasoning + Acting) pattern
- Recognize how the loop handles errors and uncertainty
- Draw the PDA loop from memory

## 📚 Core Concepts

### Why This Matters

Yesterday you learned that agents **loop** — they don't just respond once. Today we unpack that loop. The Perceive-Decide-Act cycle is the heartbeat of every agent. Understanding it deeply is like understanding how an engine works before you build a car. Everything else — tools, memory, planning — plugs into this loop.

### The PDA Loop, Step by Step

```
┌─────────────────────────────────────────┐
│                                         │
│   ┌──────────┐                          │
│   │ PERCEIVE │ ← Gather context         │
│   └────┬─────┘                          │
│        │                                │
│        ▼                                │
│   ┌──────────┐                          │
│   │  DECIDE  │ ← LLM reasons           │
│   └────┬─────┘                          │
│        │                                │
│        ▼                                │
│   ┌──────────┐                          │
│   │   ACT    │ ← Execute tool/respond   │
│   └────┬─────┘                          │
│        │                                │
│        ▼                                │
│   Goal achieved? ──── Yes ──→ Done! ✅  │
│        │                                │
│        No                               │
│        │                                │
│        └────────────────────────────────┘
```

> 📊 **Diagram:** Open `diagrams/01-pda-loop.excalidraw` for an interactive version of this loop.

#### Phase 1: Perceive

The agent gathers all available information:

- **User input:** The original task or latest message
- **Tool results:** Output from tools called in previous steps
- **Memory:** Relevant information from past interactions
- **System context:** Current time, available tools, constraints

Think of it like a detective arriving at a scene. Before doing anything, they look around, read reports, talk to witnesses — gathering everything they need to make a good decision.

**In practice**, perceiving means assembling a **prompt** for the LLM. Everything the agent knows gets packed into context:

```python
context = f"""
System: You are a research assistant with these tools: {tool_descriptions}

Previous steps:
{conversation_history}

Latest tool result:
{last_tool_output}

User's original request:
{user_task}

What should you do next?
"""
```

#### Phase 2: Decide

This is where the LLM does its magic. Given all the context, it reasons about what to do next. This is the most complex phase, and different reasoning strategies produce very different results.

**Simple approach — Direct answer:**
> "The user asked for weather. I'll call the weather API."

**Better approach — Chain of Thought (CoT):**
> "The user asked about travel to Tokyo next week. I need to:
> 1. Check the weather forecast for Tokyo
> 2. Check current flight prices
> 3. Look up hotel availability
> Let me start with the weather..."

**Best approach — ReAct (Reasoning + Acting):**
> "**Thought:** I need to find Tokyo weather for next week. Let me search for a forecast.
> **Action:** search("Tokyo weather forecast next week")
> **Observation:** [search results]
> **Thought:** I got the forecast. Temperatures will be 15-22°C. Now I need flights..."

The Decide phase outputs one of two things:
1. **A tool call** — "I need to search for X" (loop continues)
2. **A final answer** — "Here's what I found" (loop ends)

#### Phase 3: Act

The agent executes its decision. This could mean:

- **Calling a tool:** Run a web search, query a database, write a file
- **Generating a response:** Send the final answer to the user
- **Updating state:** Save information to memory for later

After acting, the agent checks: **Is the goal achieved?**
- If yes → return the result
- If no → loop back to Perceive (with the new tool result as additional context)

### The ReAct Pattern: How Modern Agents Think

**ReAct** (Reasoning + Acting) is the most important pattern in modern agents. Published by Yao et al. in 2022, it interleaves reasoning with actions:

```
Thought: I need to find out when Python was created.
Action: search("when was Python programming language created")
Observation: Python was created by Guido van Rossum and first released in 1991.
Thought: I now have the answer. Python was created in 1991.
Action: finish("Python was first released in 1991, created by Guido van Rossum.")
```

**Why ReAct works so well:**

1. **Transparency:** You can see the agent's reasoning (debugging!)
2. **Grounding:** Actions provide real data (not hallucinations)
3. **Flexibility:** The agent can change plans based on what it learns
4. **Error recovery:** If a tool fails, the agent can reason about alternatives

### A Complete Trace: Research Agent

Let's trace through a complete agent interaction:

**User:** "What's the latest on AI regulation in the EU?"

```
[PERCEIVE] User wants info on EU AI regulation.
           Available tools: web_search, read_article, summarize
           No previous context.

[DECIDE]   Thought: I need recent information about EU AI regulation.
           I should search the web for the latest news.
           Action: web_search("EU AI regulation 2024 latest news")

[ACT]      Executing web_search...
           Result: "The EU AI Act entered into force on August 1, 2024..."
           
           Goal achieved? No — I have search results but haven't 
           read the articles or written a summary yet.

[PERCEIVE] Now I have search results. Let me read the top article
           for more detail.

[DECIDE]   Thought: The search results mention the EU AI Act. 
           Let me read the full article for details.
           Action: read_article("https://example.com/eu-ai-act-2024")

[ACT]      Executing read_article...
           Result: [full article text about EU AI Act provisions]
           
           Goal achieved? Almost — I have the info, now need to summarize.

[PERCEIVE] I have detailed information about the EU AI Act.

[DECIDE]   Thought: I have enough information to give a comprehensive
           answer. Let me synthesize what I've found.
           Action: final_answer(summary of findings)

[ACT]      Returning response to user.
           Goal achieved? Yes! ✅
```

**Three iterations of the loop** to complete the task. Each time, the agent gathered new information, reasoned about it, and decided what to do next.

### Error Handling in the Loop

What happens when things go wrong?

```
[DECIDE]   Action: web_search("latest AI papers arxiv")
[ACT]      ERROR: Search API returned 429 (rate limited)

[PERCEIVE] The search failed with a rate limit error.
[DECIDE]   Thought: Search is rate limited. I could:
           1. Wait and retry
           2. Try a different search engine
           3. Use my existing knowledge
           Let me try a different approach...
           Action: web_search("recent AI research papers 2024")
```

A well-designed agent **recovers gracefully**. It doesn't crash — it adapts, just like a human would.

### Common Gotchas

⚠️ **Infinite loops:** If the agent never decides the goal is achieved, it loops forever. Always set a maximum number of iterations.

⚠️ **Context window overflow:** Each loop iteration adds more text. Eventually you hit the LLM's context limit. Smart agents summarize or trim old context.

⚠️ **Tool errors cascading:** If the agent misinterprets a tool error, it might spiral into unproductive actions. Good error messages help.

⚠️ **Premature termination:** Sometimes agents declare "done" too early without fully completing the task. Clear goal definitions help.

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **PDA Loop** | Perceive-Decide-Act — the core agent cycle | Agent searches → reads result → decides what to do next |
| **ReAct** | Reasoning + Acting interleaved pattern | "Thought: I need X. Action: search(X). Observation: ..." |
| **Chain of Thought (CoT)** | Reasoning step by step before answering | "First I'll check A, then B, then combine them" |
| **Observation** | The result of an action, fed back into the loop | Search results, API responses, file contents |
| **Iteration** | One complete pass through the PDA loop | One search + one reasoning step |
| **Termination** | When the agent decides the goal is achieved | "I have enough info to answer the user's question" |
| **Max iterations** | Safety limit on how many times the loop can run | Set to 10 to prevent infinite loops |

## 💻 Code Example: Building a PDA Loop

```python
import openai
import json

def agent_loop(task: str, tools: dict, max_iterations: int = 10) -> str:
    """
    A minimal but complete agent loop.
    
    Args:
        task: The user's request
        tools: Dict of tool_name → callable function
        max_iterations: Safety limit
    """
    messages = [
        {"role": "system", "content": f"""You are a helpful assistant.
You have access to these tools: {list(tools.keys())}
When you need to use a tool, respond with JSON:
{{"tool": "tool_name", "args": {{"arg1": "value"}}}}
When you have the final answer, respond with JSON:
{{"answer": "your final answer"}}"""},
        {"role": "user", "content": task}
    ]
    
    for i in range(max_iterations):
        # DECIDE: Ask the LLM what to do
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        
        reply = response.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        
        # Parse the LLM's decision
        try:
            decision = json.loads(reply)
        except json.JSONDecodeError:
            # LLM didn't return valid JSON — treat as final answer
            return reply
        
        # Check if we're done
        if "answer" in decision:
            return decision["answer"]  # ✅ Goal achieved!
        
        # ACT: Execute the tool
        if "tool" in decision:
            tool_name = decision["tool"]
            tool_args = decision.get("args", {})
            
            if tool_name in tools:
                # Run the tool
                result = tools[tool_name](**tool_args)
                
                # PERCEIVE: Feed result back into context
                messages.append({
                    "role": "user", 
                    "content": f"Tool '{tool_name}' returned: {result}"
                })
            else:
                messages.append({
                    "role": "user",
                    "content": f"Error: Tool '{tool_name}' not found."
                })
    
    return "Max iterations reached. Here's what I found so far..."


# Example usage:
def search(query: str) -> str:
    return f"Search results for '{query}': Python was released in 1991..."

def calculate(expression: str) -> str:
    import ast
    return str(ast.literal_eval(expression))  # Safer than eval()

result = agent_loop(
    task="When was Python created and how many years ago is that?",
    tools={"search": search, "calculate": calculate}
)
print(result)
```

## ✏️ Hands-On Exercise

### Exercise 1: Trace the Loop (20 min)

Pick one of these tasks and manually trace the PDA loop on paper or in a markdown file:

**Task A:** "Find the cheapest flight from Sydney to Tokyo next Friday"
**Task B:** "Summarize the top 3 stories on Hacker News right now"
**Task C:** "Calculate my monthly expenses from this bank statement"

For your chosen task, write out:
1. What tools would the agent need?
2. Walk through each iteration of the loop (at least 3 iterations)
3. What could go wrong at each step?
4. How does the agent know it's done?

### Exercise 2: Spot the Pattern (10 min)

Read through this agent trace and identify the **Perceive**, **Decide**, and **Act** phases:

```
Agent receives: "What's 15% tip on a $47.50 dinner bill?"

Step 1: "I need to calculate 15% of $47.50. I'll use the calculator tool."
        → calculator("47.50 * 0.15")
        → Result: 7.125

Step 2: "The tip is $7.13 (rounded up). The total would be $54.63.
         Let me verify: $47.50 + $7.13 = $54.63."
        → calculator("47.50 + 7.13")
        → Result: 54.63

Step 3: "A 15% tip on $47.50 is $7.13, making the total $54.63."
        → Returns final answer
```

**Questions:**
- How many iterations of the loop occurred?
- Was the second calculation necessary? Why did the agent do it?
- What would a chatbot (no tools) have done differently?

## 📖 Curated Resources

### Videos
- 🎥 [Understanding ReACT with LangChain](https://www.youtube.com/watch?v=Eug2clsLtFs) — Sam Witteveen (20 min) — Excellent breakdown of the ReAct pattern
- 🎥 [What are AI Agents?](https://www.youtube.com/watch?v=F8NKVhkZZWI) — IBM Technology — Focus on the loop section (5:00-12:00)
- 🎥 [Build an AI Agent From Scratch in Python](https://www.youtube.com/watch?v=bTMPwUgLZf0) — Tech With Tim — Code with practical loop implementation

### Reading
- 📄 [ReAct Paper (Yao et al., 2022)](https://arxiv.org/abs/2210.03629) — The original paper. Read the abstract and Section 2.
- 📄 [Lilian Weng: LLM Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — Section on "Task Decomposition" and "ReAct"
- 📄 [Anthropic: Agent Patterns](https://www.anthropic.com/engineering/building-effective-agents) — Focus on "Augmented LLM" and "Agent Loop" sections

### Papers
- 📑 [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — The foundational paper
- 📑 [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761) — How LLMs learn tool use

## 🤔 Reflection Questions

1. **Why is the "loop" so important?** What can an agent do in 5 iterations that it can't do in 1?

2. **What's the difference between Chain of Thought and ReAct?** When would you use each?

3. **How does an agent decide when to stop?** What are the risks of stopping too early vs too late?

4. **Think about a task you did today.** Can you break it into Perceive-Decide-Act steps? How many iterations did it take you?

5. **What happens if a tool returns wrong information?** How would a well-designed agent handle it?

## ➡️ Next Steps

Tomorrow: **Agent vs Chatbot vs RAG** — a detailed comparison of three major AI architectures. You'll learn when to use each one and understand the trade-offs. This is critical for making smart architecture decisions when you start building.

**Come prepared with:** Think of an AI product you use. Try to figure out whether it's a chatbot, RAG system, or agent.

---

*Day 2 of 21 • [← Day 1](day-01-what-is-ai-agent.md) • [Course Overview](../README.md) • [Day 3 →](day-03-agent-vs-chatbot-vs-rag.md)*
