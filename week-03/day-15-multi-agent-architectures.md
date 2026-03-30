# Day 15: Multi-Agent Architectures

> *"Alone we can do so little; together we can do so much."* — Helen Keller

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Explain why multi-agent systems outperform single agents for complex tasks
- Describe the four core multi-agent patterns (supervisor, peer, pipeline, debate)
- Choose the right pattern for a given problem
- Understand how real-world multi-agent systems work (CrewAI, AutoGen, LangGraph)
- Design a multi-agent architecture on paper

## 📚 Core Concepts

### Why This Matters

Your research agent from Week 2 is impressive — but it's one agent trying to do everything: search, read, analyze, write. That's like asking one person to be the researcher, writer, editor, and fact-checker all at once.

Multi-agent systems split the work. Each agent specializes in one thing and does it really well. The result? Better quality, easier debugging, and more complex tasks handled elegantly.

> 📊 **Diagram:** Open `diagrams/04-multi-agent.excalidraw` for a visual overview of multi-agent patterns.

### When Single-Agent Falls Short

| Problem | Single Agent | Multi-Agent |
|---------|-------------|-------------|
| Long research report | One agent searches, reads, writes, edits — often loses focus | Research agent → Writer agent → Editor agent |
| Code generation | One agent writes and reviews its own code (blind spots) | Coder agent → Reviewer agent (catches bugs) |
| Complex decisions | One agent considers all angles alone | Multiple agents debate, strengthening the analysis |
| High-volume tasks | One agent bottlenecks on sequential processing | Multiple agents work in parallel |

### The Four Core Patterns

#### Pattern 1: Supervisor (Orchestrator)

One agent coordinates others. Think CEO → department heads.

```
                 ┌──────────────┐
                 │  SUPERVISOR   │
                 │  (Coordinator)│
                 └──────┬───────┘
                        │
           ┌────────────┼────────────┐
           │            │            │
     ┌─────┴─────┐┌────┴─────┐┌────┴─────┐
     │ Researcher ││  Writer  ││  Editor  │
     └───────────┘└──────────┘└──────────┘
```

**How it works:**
1. Supervisor receives the task
2. Breaks it down and assigns sub-tasks to specialists
3. Receives results from each specialist
4. Decides what to do next (or delegates more work)
5. Combines results into final output

**Best for:** Complex tasks with clear sub-tasks, quality control, tasks where order matters.

**Real-world analogy:** A project manager who assigns work, reviews progress, and coordinates between team members.

```python
# Pseudocode for supervisor pattern
class Supervisor:
    def __init__(self, agents: dict):
        self.agents = agents  # {"researcher": agent1, "writer": agent2, "editor": agent3}
    
    def run(self, task: str) -> str:
        # Step 1: Plan
        plan = self.decide(f"Break this task into steps: {task}")
        
        # Step 2: Delegate
        research = self.agents["researcher"].run("Research: " + task)
        draft = self.agents["writer"].run(f"Write based on: {research}")
        final = self.agents["editor"].run(f"Edit this draft: {draft}")
        
        return final
```

#### Pattern 2: Peer-to-Peer (Collaborative)

Agents work as equals, passing work between them without a central coordinator.

```
     ┌───────────┐     ┌───────────┐
     │ Agent A    │◄───►│ Agent B    │
     └─────┬─────┘     └─────┬─────┘
           │                  │
           └────────┬─────────┘
                    │
              ┌─────┴─────┐
              │ Agent C    │
              └───────────┘
```

**How it works:**
1. Each agent has a role and can message other agents
2. Agents decide when to pass work or request help
3. No single point of control

**Best for:** Brainstorming, creative tasks, situations where the workflow isn't predictable.

**Real-world analogy:** A team of colleagues working on a whiteboard, each contributing ideas and building on others' work.

#### Pattern 3: Pipeline (Sequential)

Agents pass work in a fixed sequence, like an assembly line.

```
     ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
     │ Research  │───►│  Draft   │───►│  Review  │───►│  Polish  │
     └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**How it works:**
1. Agent 1 does its job, passes output to Agent 2
2. Agent 2 transforms it, passes to Agent 3
3. Each step adds value until the final output

**Best for:** Content creation, data processing, any task with clear sequential stages.

**Real-world analogy:** A factory assembly line — each station adds something to the product.

```python
# Pipeline is the simplest multi-agent pattern
def pipeline(task: str, agents: list) -> str:
    result = task
    for agent in agents:
        result = agent.run(result)  # Each agent transforms the output
    return result

# Usage
output = pipeline(
    "Write a blog post about AI agents",
    agents=[researcher, writer, editor, formatter]
)
```

#### Pattern 4: Debate (Adversarial)

Agents argue different positions to reach a better conclusion.

```
     ┌──────────┐         ┌──────────┐
     │ Agent FOR │◄───────►│Agent AGAINST│
     └─────┬────┘         └────┬─────┘
           │                    │
           └────────┬──────────┘
                    │
              ┌─────┴─────┐
              │   JUDGE    │
              └───────────┘
```

**How it works:**
1. Two (or more) agents take opposing positions
2. They present arguments back and forth
3. A judge agent evaluates and makes a decision

**Best for:** Decision-making, analysis, quality assurance, risk assessment.

**Real-world analogy:** A debate competition, or a courtroom with prosecution and defense.

### Comparison of Patterns

| Pattern | Control | Best For | Complexity | Reliability |
|---------|---------|----------|------------|-------------|
| **Supervisor** | Centralized | Structured tasks | Medium | High |
| **Peer** | Distributed | Creative tasks | High | Medium |
| **Pipeline** | Sequential | Content processing | Low | High |
| **Debate** | Adversarial | Decision-making | Medium | High |

### Real-World Frameworks

#### CrewAI
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Research Analyst",
    goal="Find accurate, current information",
    backstory="You are a senior researcher with 10 years experience."
)

writer = Agent(
    role="Content Writer", 
    goal="Create engaging, clear content",
    backstory="You are a professional writer who makes complex topics accessible."
)

task1 = Task(description="Research AI agents in 2024", agent=researcher)
task2 = Task(description="Write a report from the research", agent=writer)

crew = Crew(agents=[researcher, writer], tasks=[task1, task2])
result = crew.kickoff()
```

#### LangGraph (Graph-Based)
```python
from langgraph.graph import StateGraph

# Define the workflow as a graph
workflow = StateGraph(State)
workflow.add_node("researcher", research_node)
workflow.add_node("writer", writer_node)  
workflow.add_node("reviewer", review_node)

# Define edges (who passes to whom)
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", "reviewer")
workflow.add_conditional_edges("reviewer", should_revise, {
    "revise": "writer",     # Send back for revision
    "approve": END          # Done!
})
```

#### Microsoft AutoGen
```python
from autogen import AssistantAgent, UserProxyAgent

researcher = AssistantAgent("researcher", system_message="You research topics thoroughly.")
writer = AssistantAgent("writer", system_message="You write clear reports.")

# Agents chat with each other
researcher.initiate_chat(writer, message="Research and write about AI agents.")
```

### Designing Multi-Agent Systems: A Framework

Ask these questions:

1. **What are the distinct roles?** (research, write, edit, validate)
2. **What's the workflow?** (sequential, parallel, conditional)
3. **Who decides what happens next?** (supervisor, or agents themselves)
4. **How do agents communicate?** (shared state, messages, tool results)
5. **What happens when things go wrong?** (retry, escalate, fallback)

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Multi-Agent System (MAS)** | Multiple AI agents working together on a task |
| **Supervisor** | A coordinating agent that delegates work to other agents |
| **Pipeline** | Sequential agent workflow (A → B → C) |
| **Orchestration** | Managing the flow of work between agents |
| **Handoff** | When one agent passes control to another |
| **Shared State** | Data that all agents can read and write |
| **Agent Specialization** | Each agent focuses on one domain or skill |

## ✏️ Hands-On Exercise

### Exercise 1: Design a Multi-Agent System (20 min)

Choose a scenario and design a multi-agent system on paper:

**Option A: Content Marketing Pipeline**
- Create blog posts: research → write → SEO optimize → edit → schedule

**Option B: Customer Support System**
- Handle tickets: classify → route → research solution → respond → follow up

**Option C: Code Review System**
- Review PRs: analyze code → check style → find bugs → suggest improvements → summarize

For your chosen scenario:
1. List the agents and their roles
2. Draw the communication flow
3. Decide: Supervisor, Pipeline, Peer, or Debate?
4. Define what data passes between agents
5. Plan error handling

### Exercise 2: Compare Frameworks (15 min)

Read the quick-start docs of two frameworks and compare:
- [CrewAI Quick Start](https://docs.crewai.com/quickstart)
- [LangGraph Introduction](https://docs.langchain.com/oss/python/langgraph/overview)

Questions to answer:
1. How does each define agents?
2. How is communication handled?
3. Which seems simpler for a beginner?
4. Which gives more control?

### Exercise 3: Implement a Simple Pipeline (20 min)

Build the simplest possible multi-agent pipeline:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def researcher(topic: str) -> str:
    response = llm.invoke(f"Research this topic and list 5 key facts: {topic}")
    return response.content

def writer(research: str) -> str:
    response = llm.invoke(f"Write a clear 3-paragraph article based on these facts:\n{research}")
    return response.content

def editor(draft: str) -> str:
    response = llm.invoke(f"Edit this article for clarity, fix any errors, and improve the flow:\n{draft}")
    return response.content

# Pipeline
topic = "How AI agents are changing software development"
facts = researcher(topic)
draft = writer(facts)
final = editor(draft)

print("=== RESEARCH ===")
print(facts)
print("\n=== DRAFT ===")
print(draft)
print("\n=== FINAL ===")
print(final)
```

## 📖 Curated Resources

### Videos
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain (15 min)
- 🎥 [CrewAI Tutorial: Complete Crash Course](https://www.youtube.com/watch?v=sPzc6hMg7So) — aiwithbrandon (20 min)

### Reading
- 📄 [Anthropic: Multi-Agent Patterns](https://www.anthropic.com/engineering/building-effective-agents) — "Orchestrator-workers" section
- 📄 [CrewAI Documentation](https://docs.crewai.com/) — Full framework docs
- 📄 [LangGraph Multi-Agent Tutorial](https://docs.langchain.com/oss/python/langchain/multi-agent) — Official tutorial

### Papers
- 📑 [CAMEL: Communicative Agents for "Mind" Exploration](https://arxiv.org/abs/2303.17760) — Role-playing agents
- 📑 [AutoGen: Enabling Next-Gen LLM Applications](https://arxiv.org/abs/2308.08155) — Microsoft's multi-agent framework

## 🤔 Reflection Questions

1. **When is a single agent better than multiple agents?** What are the downsides of multi-agent systems?

2. **How do you prevent agents from passing bad work downstream?** What quality gates would you add?

3. **What's the trade-off between supervisor and peer patterns?** When does central control help vs hinder?

4. **How does agent specialization mirror human team structures?** What can we learn from organizational design?

5. **What happens if agents disagree?** In the debate pattern, how should the judge decide?

## ➡️ Next Steps

Tomorrow: **Agent Communication Patterns** — how agents pass messages, share state, and coordinate handoffs. This is the plumbing that makes multi-agent systems work.

**Come prepared with:** Your multi-agent design from Exercise 1. We'll think about how the agents communicate.

---

*Day 15 of 21 • [← Day 14](../week-02/day-14-week-review.md) • [Course Overview](../README.md) • [Day 16 →](day-16-agent-communication.md)*
