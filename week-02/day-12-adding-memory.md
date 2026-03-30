# Day 12: Adding Memory to Your Agent

> *"A person without memory is a person without a self."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Add conversation memory to your research agent
- Implement persistent memory using a vector database
- Store and retrieve research findings across sessions
- Understand LangGraph's built-in memory features
- Design a memory strategy that balances cost and usefulness

## 📚 Core Concepts

### Why This Matters

Right now, your research agent starts fresh every time. It doesn't remember what you asked 5 minutes ago. Adding memory transforms it from a tool you use to an assistant that **grows with you**.

### Three Memory Layers We'll Add

```
Layer 1: Conversation Memory (within a session)
  → "Remember what we just discussed"

Layer 2: Research Memory (across sessions)
  → "Recall findings from past research"

Layer 3: User Preferences (permanent)
  → "Remember I prefer concise summaries"
```

### Layer 1: Conversation Memory with LangGraph

LangGraph has built-in checkpointing that handles conversation memory:

```python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# Create a memory saver
memory = MemorySaver()

# Create agent WITH memory
agent = create_react_agent(
    llm, 
    tools,
    checkpointer=memory  # This enables conversation memory!
)

# Use a thread_id to track the conversation
config = {"configurable": {"thread_id": "research-session-1"}}

# First message
result1 = agent.invoke(
    {"messages": [{"role": "user", "content": "Research AI agents"}]},
    config=config
)

# Follow-up — the agent remembers the previous exchange!
result2 = agent.invoke(
    {"messages": [{"role": "user", "content": "Now compare that with traditional chatbots"}]},
    config=config  # Same thread_id = same conversation
)
```

**Key insight:** The `thread_id` is like a conversation ID. Same thread = agent remembers. Different thread = fresh start.

### Layer 2: Research Memory with ChromaDB

Let's add a vector database so the agent can recall past research:

```python
# Install: pip install chromadb

import chromadb
from datetime import datetime
from langchain_core.tools import tool

# Initialize the database (persists to disk)
chroma_client = chromadb.PersistentClient(path="./memory_db")
research_collection = chroma_client.get_or_create_collection(
    name="research_findings",
    metadata={"description": "Past research findings"}
)

@tool
def save_to_memory(topic: str, findings: str) -> str:
    """Save research findings to long-term memory for future reference.
    
    Use this when you've completed research and want to remember the results.
    These findings will be available in future conversations.
    
    Args:
        topic: The research topic (e.g., "AI agent market size 2024")
        findings: Key findings to remember (concise, factual)
    """
    research_collection.add(
        documents=[findings],
        metadatas=[{
            "topic": topic,
            "date": datetime.now().isoformat(),
            "type": "research"
        }],
        ids=[f"research_{research_collection.count()}"]
    )
    return f"💾 Saved to memory: '{topic}' ({len(findings)} chars)"


@tool
def recall_research(query: str) -> str:
    """Search your memory for past research related to a query.
    
    Use this BEFORE searching the web to check if you already have
    relevant information from previous research sessions.
    
    Args:
        query: What you're looking for (e.g., "AI market size")
    """
    if research_collection.count() == 0:
        return "No past research found. This is a fresh start."
    
    results = research_collection.query(
        query_texts=[query],
        n_results=3
    )
    
    if not results["documents"][0]:
        return f"No relevant past research found for '{query}'."
    
    memories = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        memories.append(
            f"📝 Topic: {meta.get('topic', 'Unknown')}\n"
            f"   Date: {meta.get('date', 'Unknown')[:10]}\n"
            f"   Findings: {doc[:300]}"
        )
    
    return f"Found {len(memories)} relevant past findings:\n\n" + "\n\n".join(memories)
```

### Layer 3: User Preferences

A simple key-value store for remembering user preferences:

```python
import json
import os

PREFERENCES_FILE = "memory_db/preferences.json"

def load_preferences() -> dict:
    if os.path.exists(PREFERENCES_FILE):
        with open(PREFERENCES_FILE) as f:
            return json.load(f)
    return {}

def save_preferences(prefs: dict):
    os.makedirs(os.path.dirname(PREFERENCES_FILE), exist_ok=True)
    with open(PREFERENCES_FILE, 'w') as f:
        json.dump(prefs, f, indent=2)

@tool
def set_preference(key: str, value: str) -> str:
    """Remember a user preference for future sessions.
    
    Use when the user tells you their preferences or working style.
    
    Args:
        key: What to remember (e.g., "output_style", "focus_area")
        value: The preference value (e.g., "concise bullet points")
    """
    prefs = load_preferences()
    prefs[key] = {"value": value, "updated": datetime.now().isoformat()}
    save_preferences(prefs)
    return f"✅ Preference saved: {key} = {value}"

@tool
def get_preferences() -> str:
    """Retrieve all stored user preferences.
    
    Call this at the start of a conversation to personalize your responses.
    """
    prefs = load_preferences()
    if not prefs:
        return "No preferences stored yet."
    
    lines = []
    for key, data in prefs.items():
        lines.append(f"- {key}: {data['value']}")
    return "User preferences:\n" + "\n".join(lines)
```

### Updated Agent with All Memory Layers

```python
# agent_with_memory.py
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# Import all tools
from tools.search import search_web
from tools.reader import read_webpage
from tools.writer import save_report
from tools.calculator import calculate
# New memory tools
from tools.memory import save_to_memory, recall_research, set_preference, get_preferences

load_dotenv()

SYSTEM_PROMPT = """You are a Senior Research Analyst with persistent memory.

## Memory Protocol
1. At the START of each conversation, use get_preferences() to check user preferences
2. BEFORE web searching, use recall_research() to check if you already have relevant findings
3. AFTER completing research, use save_to_memory() to store key findings for future use
4. When the user states a preference, use set_preference() to remember it

## Research Standards
- Search BEFORE making factual claims
- Build on past research when relevant
- Cite sources with URLs
- Use calculator for math

## Response Format
Summary → Key Findings → Analysis → Sources → Confidence Level
"""

def create_agent_with_memory():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    tools = [
        # Research tools
        search_web, read_webpage, save_report, calculate,
        # Memory tools
        save_to_memory, recall_research, set_preference, get_preferences
    ]
    
    memory = MemorySaver()
    
    agent = create_react_agent(
        llm, tools,
        prompt=SYSTEM_PROMPT,
        checkpointer=memory
    )
    
    return agent
```

### Memory Strategy Tips

**What to remember:**
- ✅ Key research findings and data points
- ✅ User preferences and working style
- ✅ Important decisions and their reasoning
- ✅ Sources that were particularly useful

**What NOT to remember:**
- ❌ Every search query (too noisy)
- ❌ Full article text (too much data)
- ❌ Temporary thoughts (working memory, not long-term)
- ❌ Sensitive information (passwords, private data)

**Balancing cost and recall:**
- Vector search costs tokens to embed. Keep memories concise.
- Retrieve 3-5 memories max. More isn't always better.
- Periodically review and prune outdated memories.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Checkpointer** | LangGraph's mechanism for persisting conversation state |
| **Thread ID** | Unique identifier for a conversation session |
| **ChromaDB** | Open-source vector database for embedding storage |
| **Persistent Client** | ChromaDB mode that saves data to disk (survives restarts) |
| **Memory Protocol** | Rules for when to save and recall memories |
| **Memory Pruning** | Removing outdated or irrelevant memories |

## ✏️ Hands-On Exercise

### Exercise 1: Add Memory to Your Agent (30 min)

1. Install ChromaDB: `pip install chromadb`
2. Add the memory tools from this lesson to your research agent
3. Update the system prompt with the Memory Protocol
4. Test: Research a topic, then in a new session, ask about the same topic — does it recall?

### Exercise 2: Test Memory Across Sessions (15 min)

Run these queries in sequence:
1. "Research the latest developments in quantum computing"
2. (New session) "What do you remember about quantum computing?"
3. "I prefer detailed technical reports with code examples" → test set_preference
4. (New session) → check if the agent retrieves preferences at start

### Exercise 3: Memory Inspection (10 min)

Write a small script to inspect your ChromaDB:

```python
import chromadb
client = chromadb.PersistentClient(path="./memory_db")
collection = client.get_collection("research_findings")
print(f"Total memories: {collection.count()}")
all_data = collection.get(include=["documents", "metadatas"])
for doc, meta in zip(all_data["documents"], all_data["metadatas"]):
    print(f"\n📝 {meta.get('topic', '?')}: {doc[:100]}...")
```

## 📖 Curated Resources

### Videos
- 🎥 [LangGraph: Multi-Agent Workflows](https://www.youtube.com/watch?v=hvAPnpSfSGo) — LangChain
- 🎥 [DeepLearning.AI: Agent Memory](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Memory lesson

### Reading
- 📄 [LangGraph: Persistence Guide](https://docs.langchain.com/oss/python/langgraph/overview) — Official docs
- 📄 [ChromaDB Getting Started](https://docs.trychroma.com/getting-started) — Quick setup guide
- 📄 [MemGPT Paper](https://arxiv.org/abs/2310.08560) — Advanced memory management for agents

## 🤔 Reflection Questions

1. **How would you decide what's worth remembering?** Not everything should be stored. What criteria would you use?
2. **What happens when memories conflict?** How should the agent handle "AI market was $5B" from January and "$8B" from June?
3. **How is this similar to how YOU remember things?** What can we learn from human memory for agent design?
4. **What privacy concerns does persistent memory raise?** How would you implement a "forget" feature?

## ➡️ Next Steps

Tomorrow: **Testing & Debugging Agents** — how to trace agent reasoning, find bugs, handle edge cases, and build confidence that your agent works correctly.

---

*Day 12 of 21 • [← Day 11](day-11-research-agent-project.md) • [Course Overview](../README.md) • [Day 13 →](day-13-testing-debugging.md)*
