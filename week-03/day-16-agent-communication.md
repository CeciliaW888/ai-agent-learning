# Day 16: Agent Communication Patterns

> *"The single biggest problem in communication is the illusion that it has taken place."* — George Bernard Shaw

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Implement message passing between agents
- Design shared state that agents can read and write
- Build handoff protocols for passing control between agents
- Understand LangGraph's state management approach
- Handle errors in multi-agent communication

## 📚 Core Concepts

### Why This Matters

Yesterday you designed multi-agent systems. Today you solve the hardest part: how do agents actually **talk to each other?** Communication is where multi-agent systems succeed or fail. Bad communication = agents duplicating work, misunderstanding each other, or losing important context.

### Communication Method 1: Shared State

All agents read and write to a common data structure. Think of it as a shared whiteboard.

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph
import operator

# Define shared state
class ResearchState(TypedDict):
    topic: str                          # The research topic
    research_notes: list[str]           # Research findings
    draft: str                          # Written draft
    feedback: list[str]                 # Editor feedback
    final_output: str                   # Final result
    iteration: int                      # Track how many revision rounds

# Each agent reads from and writes to this state
def research_agent(state: ResearchState) -> dict:
    """Researcher adds findings to state."""
    topic = state["topic"]
    # Do research...
    findings = f"Research findings about {topic}: [key facts here]"
    return {
        "research_notes": state.get("research_notes", []) + [findings]
    }

def writer_agent(state: ResearchState) -> dict:
    """Writer reads research, produces draft."""
    notes = state.get("research_notes", [])
    draft = f"Article based on {len(notes)} research notes..."
    return {"draft": draft}

def editor_agent(state: ResearchState) -> dict:
    """Editor reads draft, provides feedback or approves."""
    draft = state.get("draft", "")
    # Evaluate the draft...
    return {
        "feedback": ["Looks good! Approved."],
        "final_output": draft
    }
```

**Advantages:**
- Simple to implement
- All agents see the full picture
- Easy to debug (inspect the state)

**Disadvantages:**
- State can get large
- No privacy between agents
- Potential conflicts if agents write to same fields

### Communication Method 2: Message Passing

Agents send messages directly to each other, like email or chat.

```python
from dataclasses import dataclass
from typing import Any

@dataclass
class AgentMessage:
    sender: str           # Who sent it
    receiver: str         # Who it's for
    content: str          # The message
    message_type: str     # "request", "response", "handoff"
    metadata: dict = None # Extra context

class MessageBus:
    """Central hub for agent communication."""
    
    def __init__(self):
        self.messages: list[AgentMessage] = []
        self.handlers: dict[str, callable] = {}
    
    def register(self, agent_name: str, handler: callable):
        """Register an agent to receive messages."""
        self.handlers[agent_name] = handler
    
    def send(self, message: AgentMessage):
        """Send a message to the target agent."""
        self.messages.append(message)
        if message.receiver in self.handlers:
            response = self.handlers[message.receiver](message)
            if response:
                self.send(response)
    
    def get_history(self, agent_name: str = None) -> list[AgentMessage]:
        """Get message history, optionally filtered by agent."""
        if agent_name:
            return [m for m in self.messages 
                    if m.sender == agent_name or m.receiver == agent_name]
        return self.messages


# Usage
bus = MessageBus()

def researcher_handler(msg: AgentMessage) -> AgentMessage:
    research = f"I found info about: {msg.content}"
    return AgentMessage(
        sender="researcher",
        receiver="writer",
        content=research,
        message_type="response"
    )

bus.register("researcher", researcher_handler)
bus.send(AgentMessage(
    sender="supervisor",
    receiver="researcher",
    content="Research AI agents in healthcare",
    message_type="request"
))
```

### Communication Method 3: Handoffs

One agent explicitly transfers control to another, like passing a baton in a relay race.

```python
# LangGraph handoff pattern
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

# Define handoff tools
@tool
def transfer_to_writer(research_summary: str) -> str:
    """Transfer control to the Writer agent with your research findings.
    
    Use this when you've completed your research and have enough information
    for the writer to create content.
    
    Args:
        research_summary: Summary of research findings for the writer
    """
    return f"[HANDOFF TO WRITER] {research_summary}"

@tool
def transfer_to_editor(draft: str) -> str:
    """Transfer control to the Editor agent with a draft to review.
    
    Use this when you've finished writing and need editorial review.
    
    Args:
        draft: The written draft to be reviewed
    """
    return f"[HANDOFF TO EDITOR] {draft}"

# Each agent has handoff tools to pass work along
researcher_tools = [search_web, read_webpage, transfer_to_writer]
writer_tools = [transfer_to_editor]
editor_tools = [transfer_to_writer]  # Can send back for revision
```

### Building a Multi-Agent Graph with LangGraph

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class ContentState(TypedDict):
    topic: str
    research: str
    draft: str
    review: str
    final: str
    needs_revision: bool

def research_node(state: ContentState) -> dict:
    """Research agent gathers information."""
    response = llm.invoke(
        f"Research this topic thoroughly. Provide 5 key facts with details:\n{state['topic']}"
    )
    return {"research": response.content}

def write_node(state: ContentState) -> dict:
    """Writer agent creates content from research."""
    prompt = f"""Write a well-structured article based on this research:

{state['research']}

{f"Previous feedback to address: {state.get('review', '')}" if state.get('review') else ""}

Write clearly, cite facts from the research, and use headers."""
    
    response = llm.invoke(prompt)
    return {"draft": response.content}

def review_node(state: ContentState) -> dict:
    """Editor reviews and decides: approve or revise."""
    response = llm.invoke(
        f"""Review this article critically. 

Article:
{state['draft']}

Rate 1-10. If 7+, say "APPROVED" and suggest minor tweaks.
If below 7, explain what needs fixing."""
    )
    
    needs_revision = "APPROVED" not in response.content.upper()
    return {
        "review": response.content,
        "needs_revision": needs_revision,
        "final": state["draft"] if not needs_revision else ""
    }

def should_revise(state: ContentState) -> str:
    """Route: should the draft go back for revision?"""
    return "revise" if state.get("needs_revision", False) else "done"

# Build the graph
workflow = StateGraph(ContentState)

# Add nodes
workflow.add_node("research", research_node)
workflow.add_node("write", write_node)
workflow.add_node("review", review_node)

# Add edges
workflow.set_entry_point("research")
workflow.add_edge("research", "write")
workflow.add_edge("write", "review")
workflow.add_conditional_edges("review", should_revise, {
    "revise": "write",  # Loop back
    "done": END         # Finish
})

# Compile and run
app = workflow.compile()
result = app.invoke({"topic": "How AI agents are transforming software development"})
print(result["final"])
```

### Error Handling Between Agents

When Agent A sends work to Agent B and Agent B fails, what happens?

```python
def safe_agent_call(agent_fn, state, max_retries=2):
    """Call an agent with retry logic."""
    for attempt in range(max_retries + 1):
        try:
            result = agent_fn(state)
            
            # Validate the output
            if not result or result.get("error"):
                raise ValueError(f"Agent returned invalid output: {result}")
            
            return result
            
        except Exception as e:
            if attempt < max_retries:
                print(f"⚠️ Agent failed (attempt {attempt+1}): {e}. Retrying...")
            else:
                print(f"❌ Agent failed after {max_retries+1} attempts: {e}")
                return {
                    "error": str(e),
                    "fallback": "Agent could not complete its task."
                }
```

### Common Gotchas

⚠️ **Losing context between agents:** When Agent A passes to Agent B, make sure enough context is included. Don't assume Agent B knows what Agent A was thinking.

⚠️ **Infinite revision loops:** Writer → Editor → Writer → Editor → ... Set a max revision count.

⚠️ **State bloat:** As agents add to shared state, it grows. Summarize or trim periodically.

⚠️ **Agent disagreements:** Two agents might produce conflicting information. Design a resolution strategy.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Shared State** | Common data structure all agents can read/write |
| **Message Passing** | Agents send discrete messages to each other |
| **Handoff** | One agent explicitly transfers control to another |
| **State Graph** | A graph structure defining agent workflow and transitions |
| **Conditional Edge** | A transition that depends on the current state |
| **Message Bus** | Central hub that routes messages between agents |

## ✏️ Hands-On Exercise

### Exercise 1: Build a Pipeline with Shared State (25 min)

Implement a 3-agent content pipeline using the LangGraph pattern:
1. **Researcher** → finds facts
2. **Writer** → creates article
3. **Editor** → reviews (approve or send back)

Use the code template from this lesson as a starting point.

### Exercise 2: Add a Revision Loop (15 min)

Extend your pipeline so:
- The editor can reject up to 2 times
- On 3rd submission, auto-approve with notes
- Track the revision count in shared state

### Exercise 3: Error Injection (10 min)

Deliberately make one agent fail (e.g., return empty string) and verify:
- Does the system crash or handle it?
- Does the next agent receive useful error info?
- Would a user understand what went wrong?

## 📖 Curated Resources

### Videos
- 🎥 [DeepLearning.AI: Multi-Agent Workflows](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Multi-agent lesson
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain

### Reading
- 📄 [LangGraph: State Management](https://docs.langchain.com/oss/python/langgraph/overview) — How LangGraph handles shared state
- 📄 [LangGraph: Multi-Agent Guide](https://docs.langchain.com/oss/python/langchain/multi-agent) — Full multi-agent tutorial
- 📄 [Anthropic: Orchestrator-Workers](https://www.anthropic.com/engineering/building-effective-agents) — Handoff patterns

## 🤔 Reflection Questions

1. **Shared state vs message passing:** When would you choose each?
2. **How do you prevent one slow agent from blocking the whole pipeline?**
3. **What information should always be in a handoff?** Think: what does the next agent need to succeed?
4. **How is agent communication similar to microservice communication?** What patterns transfer?

## ➡️ Next Steps

Tomorrow: **Production Patterns & Safety** — how to deploy agents responsibly with guardrails, monitoring, human-in-the-loop, and cost controls.

---

*Day 16 of 21 • [← Day 15](day-15-multi-agent-architectures.md) • [Course Overview](../README.md) • [Day 17 →](day-17-production-patterns.md)*
