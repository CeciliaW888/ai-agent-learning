# Day 6: Planning & Reasoning

> *"Plans are worthless, but planning is everything."* — Dwight D. Eisenhower

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Explain Chain of Thought (CoT), ReAct, and Tree of Thought (ToT) reasoning
- Understand how agents decompose complex tasks into subtasks
- Compare different planning strategies and their trade-offs
- Recognize when to use planning vs when to just act
- Design a planning system for a multi-step task

## 📚 Core Concepts

### Why This Matters

Ask a chatbot "Plan a team offsite in Bali for 12 people" and you'll get a generic list. Ask an **agent** the same question and it will research flights, compare hotels, check budgets, create an itinerary, and coordinate with calendars.

The difference? **Planning.** Agents don't just respond — they break complex tasks into steps, prioritize them, execute them in order, and adapt when things change. This is the "intelligence" in artificial intelligence.

### Reasoning Strategies: From Simple to Advanced

#### 1. Direct Prompting (No Planning)

The simplest approach — just answer.

```
User: "What's the capital of France?"
LLM: "Paris."
```

**When to use:** Simple factual questions, creative generation, one-step tasks.

**Limitation:** Falls apart on multi-step problems. Ask "What's 47 * 83 + 156 / 12?" and the LLM often gets it wrong without reasoning through it.

#### 2. Chain of Thought (CoT)

**Key idea:** Get the LLM to show its work — think step by step before answering.

```
User: "If a store has a 25% off sale and an item costs $80, what's the final price?"

Without CoT: "$60" (LLM just guesses)

With CoT: 
"Let me think step by step:
1. The original price is $80
2. 25% of $80 = $80 × 0.25 = $20
3. Final price = $80 - $20 = $60
The final price is $60."
```

Both got $60, but with CoT the reasoning is **transparent** and **verifiable**. For harder problems, CoT dramatically improves accuracy.

**How to trigger CoT:**
- Add "Think step by step" to the prompt
- Provide few-shot examples that show reasoning
- Use system prompts that encourage explanation

```python
# CoT system prompt
system_prompt = """When solving problems, always think step by step:
1. Understand what's being asked
2. Identify the key information
3. Work through the logic
4. State your conclusion

Show your reasoning before giving the final answer."""
```

#### 3. ReAct (Reasoning + Acting)

We covered this in Day 2, but let's go deeper. ReAct interleaves **thinking** with **doing**:

```
Thought: I need to find the population of Tokyo.
Action: search("population of Tokyo 2024")
Observation: Tokyo has approximately 14 million people in the city proper.
Thought: Now I need to compare it with New York.
Action: search("population of New York City 2024")
Observation: NYC has approximately 8.3 million people.
Thought: Tokyo (14M) is larger than NYC (8.3M). I can now answer.
Answer: Tokyo has about 14 million residents compared to NYC's 8.3 million.
```

**Why ReAct beats pure reasoning:** It **grounds** the reasoning in real data. Pure CoT might hallucinate numbers. ReAct looks them up.

**Why ReAct beats pure acting:** It **explains** why each action is taken. Pure tool use without reasoning leads to confused agents that call random tools.

#### 4. Tree of Thought (ToT)

**Key idea:** Instead of one linear chain of reasoning, explore **multiple paths** and pick the best one.

```
Task: "Write a marketing tagline for an AI agent product"

Branch 1: Focus on productivity
  → "Your AI team member that never sleeps"
  → Score: 7/10

Branch 2: Focus on simplicity
  → "AI that just works"
  → Score: 8/10

Branch 3: Focus on power
  → "Unleash autonomous intelligence"
  → Score: 6/10

Winner: Branch 2 — "AI that just works"
```

**When to use ToT:** Creative tasks, strategy, decisions with multiple good options.

**Limitation:** Expensive — you're running the LLM multiple times per decision point.

#### 5. Plan-and-Execute

**Key idea:** First create a complete plan, then execute each step.

```
User: "Research competitors and create a comparison document"

PLANNING PHASE:
1. Search for top 5 competitors in the space
2. For each competitor, gather: pricing, features, pros/cons
3. Create a comparison table
4. Write analysis and recommendations
5. Format as a document

EXECUTION PHASE:
Step 1: search("top AI agent platforms 2024")
Step 2a: research("LangChain features pricing")
Step 2b: research("CrewAI features pricing")
... (continues through the plan)
```

**Advantage:** The agent has a roadmap. It knows what's coming and can allocate effort.

**Disadvantage:** Plans may need updating as new information emerges. Rigid plans can waste effort.

**Best approach: Plan-then-adapt.** Create an initial plan, but allow the agent to revise it based on what it learns.

### Task Decomposition

The secret weapon of effective agents is **breaking big tasks into small ones**:

```
Big Task: "Create a blog post about AI agents"

Decomposed:
├── Research
│   ├── Search for recent AI agent developments
│   ├── Find statistics and examples
│   └── Read 3 top articles for inspiration
├── Outline
│   ├── Define target audience
│   ├── Create 5-section outline
│   └── Identify key messages
├── Write
│   ├── Write introduction (hook + thesis)
│   ├── Write each section
│   └── Write conclusion + CTA
├── Edit
│   ├── Check facts
│   ├── Improve clarity
│   └── Add examples
└── Publish
    ├── Format for platform
    └── Create social media summary
```

**Why this works:**
- Each subtask is manageable for an LLM
- Dependencies are clear (can't write before research)
- Failures are isolated (if research fails, you know where to retry)
- Progress is trackable

### Reflection and Self-Correction

Advanced agents can **evaluate their own work** and improve:

```
Agent writes a summary → 
Agent reviews: "Wait, I missed the pricing information. Let me add that." →
Agent rewrites with pricing included →
Agent reviews: "Better. But the tone is too formal for our audience." →
Agent adjusts tone →
Final output
```

This **self-critique loop** is one of the most powerful patterns in modern agents. It's like having a writer who also acts as their own editor.

```python
# Self-correction pattern
def generate_with_reflection(task: str, max_revisions: int = 3) -> str:
    draft = llm.generate(f"Complete this task: {task}")
    
    for i in range(max_revisions):
        critique = llm.generate(
            f"Task: {task}\n\nDraft: {draft}\n\n"
            f"Critique this draft. What's missing? What could be better? "
            f"If it's good enough, say 'APPROVED'."
        )
        
        if "APPROVED" in critique:
            return draft
        
        draft = llm.generate(
            f"Task: {task}\n\nDraft: {draft}\n\n"
            f"Critique: {critique}\n\n"
            f"Rewrite the draft addressing the critique."
        )
    
    return draft
```

### Planning Under Uncertainty

Real-world tasks are messy. What if:
- A tool returns an error?
- The search doesn't find what you need?
- The plan turns out to be wrong?

**Strategies for handling uncertainty:**

1. **Retry with backoff:** Try again, maybe with different parameters
2. **Alternative paths:** "If search fails, try asking the user"
3. **Graceful degradation:** "I couldn't find X, but here's what I found"
4. **Ask for help:** "I'm stuck on this step. Can you provide more context?"
5. **Plan revision:** "Based on what I've learned, I need to change my approach"

### Common Gotchas

⚠️ **Over-planning:** Sometimes the best plan is no plan. For simple tasks, just act.

⚠️ **Plan rigidity:** Agents that follow a plan without adapting to new information perform poorly.

⚠️ **Infinite reflection:** Self-critique can loop forever if the agent never reaches "good enough." Always set a limit.

⚠️ **Decomposition depth:** Breaking a task into 50 subtasks creates overhead. 5-10 subtasks is usually ideal.

⚠️ **Planning overhead:** Creating a plan costs time and tokens. For urgent or simple tasks, skip it.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Chain of Thought (CoT)** | Prompting technique that makes LLMs reason step by step |
| **ReAct** | Pattern interleaving reasoning (thought) with actions (tools) |
| **Tree of Thought (ToT)** | Exploring multiple reasoning paths and selecting the best |
| **Task Decomposition** | Breaking a complex task into smaller, manageable subtasks |
| **Plan-and-Execute** | Creating a full plan before beginning execution |
| **Self-Correction** | Agent evaluating and improving its own output |
| **Reflection** | Agent reviewing its reasoning and results to find mistakes |
| **Backtracking** | Abandoning a failed approach and trying a different one |

## 💻 Code Example: Plan-and-Execute Agent

```python
from openai import OpenAI

client = OpenAI()

def create_plan(task: str) -> list[str]:
    """Ask the LLM to create a step-by-step plan."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": """Create a numbered step-by-step plan.
Each step should be a single, clear action.
Return ONLY the numbered steps, nothing else.
Keep to 3-7 steps."""},
            {"role": "user", "content": f"Create a plan for: {task}"}
        ]
    )
    
    # Parse numbered steps
    plan_text = response.choices[0].message.content
    steps = [line.strip() for line in plan_text.split('\n') 
             if line.strip() and line.strip()[0].isdigit()]
    
    print(f"📋 Plan created with {len(steps)} steps:")
    for step in steps:
        print(f"   {step}")
    
    return steps

def execute_step(step: str, context: str, tools: dict) -> str:
    """Execute a single step, possibly using tools."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"""Execute this step.
Available tools: {list(tools.keys())}
Previous context: {context}
If you need a tool, say TOOL: tool_name(args)
Otherwise, just complete the step."""},
            {"role": "user", "content": step}
        ]
    )
    return response.choices[0].message.content

def plan_and_execute(task: str, tools: dict = None) -> str:
    """Full plan-and-execute agent."""
    tools = tools or {}
    
    # Phase 1: Plan
    print(f"\n🎯 Task: {task}\n")
    steps = create_plan(task)
    
    # Phase 2: Execute
    context = ""
    results = []
    
    for i, step in enumerate(steps):
        print(f"\n⚡ Executing step {i+1}: {step}")
        result = execute_step(step, context, tools)
        results.append(result)
        context += f"\nStep {i+1} result: {result}"
        print(f"   ✅ Done: {result[:100]}...")
    
    # Phase 3: Synthesize
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Synthesize the results of all steps into a final answer."},
            {"role": "user", "content": f"Task: {task}\n\nStep results:\n{context}"}
        ]
    )
    
    final = response.choices[0].message.content
    print(f"\n🏁 Final result:\n{final}")
    return final

# Usage:
# plan_and_execute("Research the pros and cons of TypeScript vs JavaScript and write a recommendation")
```

## ✏️ Hands-On Exercise

### Exercise 1: Decompose a Task (15 min)

Pick one of these complex tasks and break it into a step-by-step plan:

**Option A:** "Organize a surprise birthday party for 20 people"
**Option B:** "Migrate a Python 2 codebase to Python 3"
**Option C:** "Create a weekly newsletter about AI developments"

For your chosen task:
1. Write 5-8 high-level steps
2. For each step, list 2-3 sub-steps
3. Identify dependencies (which steps must come before others?)
4. Mark which steps could be done in parallel
5. Identify which steps need tools (search, calculate, write)

### Exercise 2: Compare Reasoning Strategies (10 min)

For this task: "What's the best programming language for building a web API in 2024?"

Write out how each strategy would approach it:
1. **Direct answer** (just respond)
2. **Chain of Thought** (reason step by step)
3. **ReAct** (reason + use tools)
4. **Tree of Thought** (explore multiple perspectives)

Which strategy gives the best result? Why?

### Exercise 3: Self-Correction Practice (10 min)

Write a deliberately flawed summary of something you know well (a movie plot, a recipe, a process).

Then write a "critique" pointing out what's wrong.

Then write a corrected version.

This is exactly what self-correcting agents do — generate → critique → revise.

## 📖 Curated Resources

### Videos
- 🎥 [Understanding ReACT with LangChain](https://www.youtube.com/watch?v=Eug2clsLtFs) — Sam Witteveen (20 min) — Deep dive into ReAct
- 🎥 [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://www.youtube.com/watch?v=ut5kp56wW_4) — Yannic Kilcher (15 min) — Visual explanation of ToT
- 🎥 [Build AI Agent Workforce](https://www.youtube.com/watch?v=pJwR5pv0_gs) — AI Jason — Multi-agent planning with MetaGPT & ChatDev

### Reading
- 📄 [Lilian Weng: Planning Section](https://lilianweng.github.io/posts/2023-06-23-agent/#planning) — Comprehensive academic overview
- 📄 [Chain of Thought Prompting (Wei et al., 2022)](https://arxiv.org/abs/2201.11903) — The original CoT paper
- 📄 [Tree of Thoughts (Yao et al., 2023)](https://arxiv.org/abs/2305.10601) — Deliberate problem solving with LLMs
- 📄 [Anthropic: Workflows & Agents](https://www.anthropic.com/engineering/building-effective-agents) — Practical agent patterns including planning

### Papers
- 📑 [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629) — The foundational ReAct paper
- 📑 [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) — Agents that learn from their mistakes
- 📑 [Self-Refine: Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.17651) — The self-correction approach

## 🤔 Reflection Questions

1. **When is planning worth the overhead?** For what types of tasks would you skip planning entirely?

2. **How does Chain of Thought improve accuracy?** Why does "showing work" help an LLM get better answers?

3. **What's the risk of self-correction loops?** How do you prevent an agent from endlessly revising?

4. **How would you build an agent that learns from past plans?** If a planning strategy worked well last time, how could the agent reuse it?

5. **Compare human planning to agent planning.** What do humans do better? What do agents do better?

## ➡️ Next Steps

Tomorrow: **Week 1 Review** — we'll consolidate everything from this week, test your understanding with a quiz, and reflect on what you've learned. It's also your chance to revisit anything that felt unclear.

**Come prepared with:** Your biggest "aha moment" from this week and your biggest remaining question.

---

*Day 6 of 21 • [← Day 5](day-05-memory-state.md) • [Course Overview](../README.md) • [Day 7 →](day-07-week-review.md)*
