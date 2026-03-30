# Day 5: Memory & State

> *"Memory is the diary that we all carry about with us."* — Oscar Wilde

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Explain the three types of agent memory: short-term, long-term, and working
- Understand how vector databases store and retrieve memories
- Design a memory architecture for an agent
- Recognize the trade-offs between memory approaches
- Implement simple conversation memory in code

## 📚 Core Concepts

### Why This Matters

Imagine meeting someone every day who has no memory of your previous conversations. Every morning, you'd have to re-explain who you are, what you're working on, and what you discussed yesterday. Frustrating, right?

That's what using an LLM without memory feels like. Memory transforms a chatbot from a stranger you meet fresh every time into a colleague who **knows you** and **builds on previous work**.

Memory is what separates a useful agent from a magical one.

### The Three Types of Agent Memory

#### 1. Short-Term Memory (Conversation Buffer)

**What:** The current conversation history — messages exchanged in this session.

**How it works:** Simply append every message to a list and include it in the prompt.

**Analogy:** Your working memory — what you're currently thinking about in a meeting.

```python
# Simplest form of short-term memory
conversation = []

def chat(user_message):
    conversation.append({"role": "user", "content": user_message})
    
    response = llm.generate(messages=conversation)
    
    conversation.append({"role": "assistant", "content": response})
    return response
```

**Problem:** LLMs have a context window limit (e.g., 128K tokens for GPT-4). Long conversations fill it up.

**Solutions:**
- **Sliding window:** Keep only the last N messages
- **Summary memory:** Periodically summarize older messages
- **Token-aware truncation:** Remove oldest messages when approaching the limit

```python
# Summary memory: compress old conversations
def compress_memory(messages, max_messages=20):
    if len(messages) <= max_messages:
        return messages
    
    # Summarize the older half
    old_messages = messages[:len(messages)//2]
    summary = llm.generate(f"Summarize this conversation:\n{old_messages}")
    
    # Return summary + recent messages
    return [{"role": "system", "content": f"Previous conversation summary: {summary}"}] + messages[len(messages)//2:]
```

#### 2. Long-Term Memory (Persistent Storage)

**What:** Information that persists across sessions — user preferences, learned facts, past interactions.

**How it works:** Store important information in a database (vector DB, SQL, files) and retrieve relevant pieces when needed.

**Analogy:** Your long-term memory — knowing your friend's birthday, your way to work, facts you learned years ago.

**Common storage approaches:**

| Approach | Best For | Example |
|----------|----------|---------|
| **Vector Database** | Semantic search over memories | "Find memories about user's preferences" |
| **Key-Value Store** | Structured facts | `user_name: "Alex"`, `timezone: "US/Pacific"` |
| **File System** | Rich, structured knowledge | Markdown files, JSON logs |
| **SQL Database** | Relational data | Task history, conversation logs |

**Vector databases** are the most common for agent memory because they support **semantic search** — finding memories by meaning, not exact match.

```python
# Store a memory
memory_store.add(
    text="User prefers Python over JavaScript for backend development",
    metadata={"type": "preference", "date": "2024-03-15"}
)

# Retrieve relevant memories (semantic search)
relevant = memory_store.search(
    query="What programming language does the user prefer?",
    top_k=3
)
# Returns: "User prefers Python over JavaScript for backend development"
```

#### 3. Working Memory (Scratchpad)

**What:** Temporary storage for the current task — intermediate results, plans, and notes the agent makes while working.

**How it works:** A dedicated space (often a variable or temporary file) where the agent stores things it needs for the current task but won't need later.

**Analogy:** A whiteboard you use while solving a problem. You write formulas, intermediate steps, and scratch notes — then erase it when done.

```python
# Working memory for a research task
working_memory = {
    "task": "Research AI regulation in EU",
    "sources_found": [],
    "key_facts": [],
    "draft_sections": [],
    "status": "searching"
}

# Agent updates working memory as it works
working_memory["sources_found"].append("EU AI Act article from Reuters")
working_memory["key_facts"].append("EU AI Act entered force August 2024")
working_memory["status"] = "drafting"
```

### How Vector Databases Work (Simplified)

Vector databases are crucial for agent memory. Here's how they work:

**Step 1: Embedding**
Convert text into a numerical vector (a list of numbers) that captures meaning.
```
"Python is great for data science" → [0.23, -0.45, 0.87, ...]  (1536 numbers)
"JavaScript is popular for web dev" → [0.12, -0.33, 0.91, ...]
```

**Step 2: Storage**
Store the vectors alongside the original text in a database.

**Step 3: Retrieval**
When you search, your query is also converted to a vector, and the database finds the most similar stored vectors.

```
Query: "What language for ML?" → [0.25, -0.42, 0.85, ...]
Closest match: "Python is great for data science" (similarity: 0.94)
```

**Popular vector databases:**
- **Chroma** — Simple, runs locally, great for prototyping
- **Pinecone** — Cloud-hosted, scalable
- **Weaviate** — Open-source, self-hosted
- **FAISS** — Facebook's library, very fast
- **Qdrant** — Open-source, production-ready

### Memory Architecture Patterns

#### Pattern 1: Simple Buffer (Chatbot-Level)
```
User messages ←→ LLM (all messages in context)
```
- **Pros:** Simple, no infrastructure
- **Cons:** Forgets after context window fills up

#### Pattern 2: Buffer + Summary (Smart Chatbot)
```
[Summary of old messages] + [Recent messages] ←→ LLM
```
- **Pros:** Handles longer conversations
- **Cons:** Summaries lose detail

#### Pattern 3: RAG Memory (Agent-Level)
```
User message → Search memories → [Relevant memories] + [Recent messages] ←→ LLM
                     ↑
              Vector Database (all past interactions)
```
- **Pros:** Scales to unlimited history, retrieves relevant context
- **Cons:** Requires vector DB infrastructure, search quality varies

#### Pattern 4: Structured + Unstructured (Production Agent)
```
User message → Search memories → [Relevant memories]  
            → Lookup user profile → [User preferences]    → LLM
            → Check task state → [Current task context]   
```
- **Pros:** Rich context, fast lookups for structured data
- **Cons:** Complex to build and maintain

### Real-World Example: How Claude Code Handles Memory

Alex (the agent assistant in this repo) uses a layered memory system:

1. **Session memory:** Current conversation (short-term)
2. **Daily notes:** `memory/YYYY-MM-DD.md` files capturing what happened each day
3. **Long-term memory:** `MEMORY.md` — curated insights, preferences, important facts
4. **Working state:** `SESSION-STATE.md` — survives context compaction
5. **User profile:** `USER.md` — structured information about the user

This is a real production pattern. Not every agent needs this complexity, but it shows how the concepts come together.

### Common Gotchas

⚠️ **Storing too much:** Not everything should be remembered. An agent that remembers every trivial detail is slower and more confused than one with curated memory.

⚠️ **Stale memories:** Old information can mislead. "User lives in Melbourne" might be outdated. Add timestamps and implement memory expiry.

⚠️ **Memory conflicts:** "User likes Python" and "User recently switched to Rust" — which is current? Newer memories should override older ones.

⚠️ **Privacy:** Memory means storing personal data. Be thoughtful about what you store, how long you keep it, and who can access it.

⚠️ **Embedding quality:** If your embeddings are bad, your retrieval will be bad. Use a good embedding model (OpenAI's `text-embedding-3-small` is a solid choice).

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Short-term Memory** | Current conversation history, stored in the prompt |
| **Long-term Memory** | Persistent storage across sessions (vector DB, files) |
| **Working Memory** | Temporary scratchpad for the current task |
| **Vector Database** | Database that stores and searches embeddings by similarity |
| **Embedding** | Numerical representation of text that captures semantic meaning |
| **Semantic Search** | Finding information by meaning, not exact keyword match |
| **Context Window** | Maximum amount of text an LLM can process at once |
| **Memory Compaction** | Summarizing or compressing old memories to save space |

## 💻 Code Example: Building a Memory System

```python
# A simple but functional memory system using Chroma

# pip install chromadb openai

import chromadb
from openai import OpenAI

client = OpenAI()
chroma_client = chromadb.Client()
memory_collection = chroma_client.create_collection(name="agent_memory")

# ===== Store a memory =====
def remember(text: str, metadata: dict = None):
    """Store a piece of information in long-term memory"""
    memory_collection.add(
        documents=[text],
        metadatas=[metadata or {}],
        ids=[f"mem_{memory_collection.count()}"]
    )
    print(f"💾 Remembered: {text[:50]}...")

# ===== Recall relevant memories =====
def recall(query: str, n_results: int = 3) -> list[str]:
    """Retrieve memories relevant to the query"""
    results = memory_collection.query(
        query_texts=[query],
        n_results=n_results
    )
    memories = results["documents"][0] if results["documents"] else []
    print(f"🧠 Recalled {len(memories)} memories for: {query[:50]}...")
    return memories

# ===== Agent with memory =====
def agent_with_memory(user_message: str, conversation: list) -> str:
    # 1. Recall relevant long-term memories
    memories = recall(user_message)
    
    # 2. Build context
    memory_context = "\n".join([f"- {m}" for m in memories]) if memories else "No relevant memories."
    
    system_prompt = f"""You are a helpful assistant with memory.
    
Relevant memories from past interactions:
{memory_context}

Use these memories to personalize your response. If you learn something
new about the user, tell me what to remember by saying [REMEMBER: ...]."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        *conversation[-10:],  # Last 10 messages (short-term memory)
        {"role": "user", "content": user_message}
    ]
    
    # 3. Generate response
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages
    )
    
    reply = response.choices[0].message.content
    
    # 4. Extract and store new memories
    if "[REMEMBER:" in reply:
        # Parse out memory items
        import re
        new_memories = re.findall(r'\[REMEMBER: (.*?)\]', reply)
        for mem in new_memories:
            remember(mem, {"source": "conversation"})
        # Clean the reply
        reply = re.sub(r'\[REMEMBER: .*?\]', '', reply).strip()
    
    return reply


# ===== Example Usage =====
conversation = []

# First interaction
remember("User's name is Alex")
remember("User is learning about AI agents")
remember("User prefers Python for coding")

# Later conversation
response = agent_with_memory(
    "Can you help me write some code for a web scraper?", 
    conversation
)
# Agent recalls: "User prefers Python" → suggests Python solution
print(response)
```

## ✏️ Hands-On Exercise

### Exercise 1: Design a Memory Schema (15 min)

You're building a personal AI assistant. Design a memory system:

1. **What should go in short-term memory?** (List 5 things)
2. **What should go in long-term memory?** (List 5 things)
3. **What should go in working memory?** (List 3 things)
4. **What should NOT be stored?** (List 3 things)

**Example start:**
- Short-term: Current conversation, recent tool results, ...
- Long-term: User's name, preferred language, past task outcomes, ...
- Working: Current task plan, intermediate research results, ...
- Don't store: Sensitive passwords, temporary errors, ...

### Exercise 2: Memory Retrieval Challenge (10 min)

Given these stored memories:
```
1. "User works at Acme Corp in Portland"
2. "User has a dog named Max and a cat named Luna"
3. "User is learning Python and AI agents"
4. "User prefers short, concise responses"
5. "User's morning study time is 7-9am"
```

What memories would be retrieved (top 2) for each query?
- "What should I know about the user before responding?"
- "The user asked for help with a coding project"
- "The user sent a message at 6:15am"

### Exercise 3: Run Chroma Locally (15 min, optional)

```bash
pip install chromadb
python -c "
import chromadb
client = chromadb.Client()
collection = client.create_collection('test')
collection.add(documents=['Python is great', 'JavaScript runs in browsers'], ids=['1','2'])
results = collection.query(query_texts=['backend programming'], n_results=1)
print(results['documents'])
"
```

## 📖 Curated Resources

### Videos
- 🎥 [Chatbot Memory for Chat-GPT, Davinci + other LLMs](https://www.youtube.com/watch?v=X05uK0TZozM) — James Briggs — Clear overview of memory types (20 min)
- 🎥 [Vector databases are so hot right now. WTF are they?](https://www.youtube.com/watch?v=klTvEwg3oJ4) — Fireship (8 min) — Quick, visual explanation
- 🎥 [DeepLearning.AI: Persistence and Memory](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — LangGraph memory lesson

### Reading
- 📄 [Lilian Weng: LLM Agents — Memory Section](https://lilianweng.github.io/posts/2023-06-23-agent/#memory) — Deep dive into memory architectures
- 📄 [Chroma Documentation](https://docs.trychroma.com/) — Get started with vector storage
- 📄 [Pinecone: What are Vector Embeddings?](https://www.pinecone.io/learn/vector-embeddings/) — Excellent visual explainer

### Papers
- 📑 [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560) — Fascinating paper on OS-inspired memory management for agents
- 📑 [Generative Agents: Interactive Simulacra](https://arxiv.org/abs/2304.03442) — Stanford's famous paper on agents with memory that form societies

## 🤔 Reflection Questions

1. **Why can't we just give the LLM all memories at once?** What are the technical and practical limits?

2. **How is agent memory similar to human memory?** What's the equivalent of forgetting, and is it useful?

3. **What privacy concerns arise from agents that remember everything?** How would you design a "forget me" feature?

4. **How would you handle conflicting memories?** ("User likes coffee" from January vs "User switched to tea" from March)

5. **What makes MemGPT's approach interesting?** How does treating memory like an OS change things?

## ➡️ Next Steps

Tomorrow: **Planning & Reasoning** — how agents break down complex tasks, think step by step, and recover when things go wrong. We'll cover Chain of Thought, ReAct, Tree of Thought, and more advanced reasoning strategies.

**Come prepared with:** Think of a complex task (like "plan a vacation") and try to break it into steps. How many sub-tasks does it have? Which ones depend on others?

---

*Day 5 of 21 • [← Day 4](day-04-tools-function-calling.md) • [Course Overview](../README.md) • [Day 6 →](day-06-planning-reasoning.md)*
