# Day 1: What is an AI Agent?

> *"The best way to predict the future is to build it."* — Alan Kay

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Define what makes something an "AI Agent" vs just an AI tool
- Explain the Perceive-Decide-Act (PDA) cycle at a high level
- Identify the four key properties of agents: autonomy, tools, memory, and goals
- Recognize agents in products you already use
- Articulate why agents are the next frontier of AI

## 📚 Core Concepts

### Why This Matters

You've probably used ChatGPT, Claude, or Gemini. You type something, it replies. That's powerful — but it's a **conversation**, not **action**. 

An AI Agent is different. It doesn't just talk — it **does things**. It searches the web, writes files, calls APIs, checks your calendar, books flights. It has a goal, and it works toward that goal using tools, making decisions along the way.

This is the difference between having a smart friend you can ask questions, and having a smart assistant who actually handles your to-do list.

### What is an AI Agent?

An **AI Agent** is a system that uses a Large Language Model (LLM) as its "brain" to autonomously:

1. **Perceive** its environment — receives input (user queries, tool results, sensor data)
2. **Decide** what to do — reasons about the best next action
3. **Act** on the world — executes tools, calls APIs, generates output
4. **Repeat** — loops until the goal is achieved

**Real-world analogy: The Pizza Delivery Driver**

Think of a pizza delivery driver. They're an agent:
- **Perceive:** Read the order, check GPS, notice traffic
- **Decide:** Pick the fastest route, decide whether to take the highway
- **Act:** Drive to the customer, hand over the pizza
- **Goal:** Customer gets their pizza, hot and on time

The driver doesn't call the restaurant for every turn. They make decisions independently based on what they see. That's **autonomy** — the defining feature of an agent.

Now compare this to a **conveyor belt** in a factory. It moves items from point A to point B. It doesn't perceive, decide, or adapt. If something falls off, it keeps going. That's a **script** — the opposite of an agent.

### The Four Pillars of AI Agents

#### 1. Autonomy
The agent decides its own actions. You give it a goal ("research the latest AI news and write a summary"), and it figures out the steps. You don't have to say "first search Google, then read the top 3 results, then summarize."

#### 2. Tool Use
Agents can call external functions — search engines, calculators, databases, APIs, file systems. This is what separates agents from chatbots. A chatbot can only generate text. An agent can **act on the world**.

#### 3. Memory
Agents remember things. Not just within a conversation, but across sessions. They can store notes, recall past interactions, and build on previous work. Memory makes agents smarter over time.

#### 4. Goal-Directed Behavior
Agents work toward a specific objective. They don't just respond — they **plan** and **execute**. If one approach fails, they try another. They're not reactive (waiting for input) — they're **proactive** (pursuing a goal).

### The Spectrum of AI Systems

Not everything is either "dumb chatbot" or "fully autonomous agent." Think of it as a spectrum:

```
Script → Chatbot → RAG → Simple Agent → Autonomous Agent
  |         |        |         |              |
Fixed    One-turn  Retrieval  Tool use    Full autonomy
rules    Q&A       + Q&A      + loops     + planning
                                          + memory
```

- **Script:** `if X then Y` — no intelligence
- **Chatbot:** LLM generates a response — intelligent but passive
- **RAG (Retrieval-Augmented Generation):** Chatbot + knowledge lookup — smarter answers
- **Simple Agent:** LLM + tools + a loop — can take actions
- **Autonomous Agent:** Full PDA loop + memory + planning — pursues goals independently

Most real-world systems sit somewhere in the middle. Even "agents" vary in how much autonomy they have.

### Common Misconceptions

❌ **"Agents are just chatbots with extra features"**
No. The fundamental difference is the **loop**. A chatbot takes input → generates output. An agent takes input → reasons → acts → observes result → reasons again → acts again → ... until done.

❌ **"Agents are always fully autonomous"**
Many production agents have human-in-the-loop checkpoints. You might build an agent that drafts emails but asks for approval before sending. Autonomy is a dial, not a switch.

❌ **"You need a massive model to build agents"**
Smaller models can be effective agents for specific tasks. The model is the brain, but the tools, prompts, and architecture matter just as much.

## 🔑 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Agent** | An autonomous system that perceives, decides, and acts toward a goal | A research agent that searches the web and writes reports |
| **LLM** | Large Language Model — the "brain" of the agent | GPT-4, Claude, Gemini, Llama |
| **Tool** | An external function the agent can call | Web search, calculator, file writer, API call |
| **Autonomy** | The ability to choose actions independently | Agent decides to search 3 sources instead of 1 |
| **PDA Loop** | Perceive-Decide-Act — the core agent cycle | Receive query → Think → Call tool → Check result → Repeat |
| **Goal** | The desired outcome the agent is working toward | "Find and summarize the top 5 AI papers this week" |
| **Environment** | Everything the agent can perceive and act upon | User messages, tool outputs, files, databases |

## 💻 Example: Simple Agent in Pseudocode

```python
def simple_agent(task: str) -> str:
    """
    The simplest possible agent: a loop that keeps going
    until the task is complete.
    """
    goal_achieved = False
    context = task  # Start with the user's request
    
    while not goal_achieved:
        # 1. PERCEIVE: Gather current context
        current_state = gather_context(context)
        
        # 2. DECIDE: Ask the LLM what to do next
        action = llm.decide_next_action(
            task=task,
            context=current_state,
            available_tools=["search", "calculate", "write_file"]
        )
        
        # 3. ACT: Execute the chosen action
        if action.type == "tool_call":
            result = execute_tool(action.tool, action.arguments)
            context += f"\nTool result: {result}"
        elif action.type == "final_answer":
            return action.content
        
        # 4. CHECK: Is the goal achieved?
        goal_achieved = action.type == "final_answer"
    
    return "Task complete!"


# The key insight: this LOOP is what makes it an agent.
# A chatbot would just do: response = llm.generate(task)
# An agent KEEPS GOING until it's done.
```

The magic is in the **loop**. The LLM doesn't just respond once — it keeps working, calling tools, checking results, and deciding what to do next until the goal is met.

## ✏️ Hands-On Exercise

### Exercise 1: Classify AI Tools (15 min)

List 5 AI tools you've used or heard of. For each one, classify it:

| Tool | Classification | Why? |
|------|---------------|------|
| ChatGPT (basic) | Chatbot | Single-turn responses, no tool use |
| Perplexity | Agent | Searches web, synthesizes results, cites sources |
| GitHub Copilot | Chatbot/Tool | Generates code inline, no multi-step planning |
| Your turn... | | |

**Think about:**
- Does it use tools (search, browse, calculate)?
- Does it loop (try → check → try again)?
- Does it work toward a goal independently?

### Exercise 2: Design an Agent (15 min)

Pick a task you do regularly (research, planning, writing). Sketch out how an agent could do it:

1. **Goal:** What is the agent trying to achieve?
2. **Perceive:** What information does it need?
3. **Tools:** What actions would it take?
4. **Decide:** What decisions would it make?
5. **When is it done?** How does it know the goal is achieved?

**Example:**
- **Goal:** Write a weekly summary of AI news
- **Perceive:** Check top AI news sites, Twitter, ArXiv
- **Tools:** Web search, article reader, text summarizer
- **Decide:** Which stories are most important? How to structure the summary?
- **Done when:** Summary covers top 5 stories with sources

## 📖 Curated Resources

### Videos
- 🎥 [What are AI Agents?](https://www.youtube.com/watch?v=F8NKVhkZZWI) — IBM Technology (15 min) — Great visual overview of agent concepts
- 🎥 [AI Agents Explained - How They Actually Work](https://www.youtube.com/watch?v=g24tJk8Flsk) — LearnThatStack (12 min) — Simple explanations with real examples
- 🎥 [Build AI Agent Workforce - Multi Agent Framework](https://www.youtube.com/watch?v=pJwR5pv0_gs) — AI Jason (20 min) — Multi-agent systems with MetaGPT & ChatDev

### Reading
- 📄 [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — **Start here**. The definitive blog post on agents. Read sections 1-2 today.
- 📄 [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — Practical patterns from the makers of Claude. Read the introduction.
- 📄 [OpenAI: A Practical Guide to Building Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) — OpenAI's perspective on agent design.

### GitHub Repos to Explore
- ⭐ [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) — One of the first popular autonomous agents
- ⭐ [BabyAGI](https://github.com/yoheinakajima/babyagi) — Elegant task decomposition agent (read the code — it's only ~100 lines!)

## 🤔 Reflection Questions

1. **What's the key difference between using AI and AI that uses tools?** Think about what changes when an AI can *do things* beyond just generating text.

2. **Name a task that's better suited for a simple chatbot than an agent. Why?** Not everything needs an agent — when is simple better?

3. **What could go wrong with a fully autonomous agent?** Think about safety, cost, and unintended consequences.

4. **Where do you see agents fitting into your daily work or life?** What repetitive tasks could an agent handle for you?

5. **If you could build one agent right now, what would it do?** Dream big — we'll get to building soon!

## ➡️ Next Steps

Tomorrow we'll deep dive into the **Perceive-Decide-Act Loop** — the beating heart of every agent. We'll break down exactly how agents think, decide, and act, and look at the **ReAct pattern** that powers most modern agents.

**Come prepared with:** A task you'd want an agent to handle. We'll trace through the PDA loop using your example!

---

*Day 1 of 21 • [Course Overview](../README.md) • [Next: Day 2 →](day-02-pda-loop.md)*
