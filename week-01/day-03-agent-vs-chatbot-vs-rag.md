# Day 3: Agent vs Chatbot vs RAG

> *"Knowing when NOT to use a complex solution is as important as knowing how to build one."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Clearly distinguish between chatbots, RAG systems, and agents
- Explain the architecture of each approach with diagrams
- Choose the right approach for a given use case
- Understand the trade-offs: cost, latency, complexity, and reliability
- Identify hybrid approaches used in production

## 📚 Core Concepts

### Why This Matters

The biggest mistake beginners make is reaching for agents when a simpler solution works. Not every problem needs an agent. Understanding these three architectures — and when to use each — will save you weeks of over-engineering and make you a better system designer.

> 📊 **Diagram:** Open `diagrams/02-agent-vs-chatbot-vs-rag.excalidraw` for a visual comparison.

### Architecture 1: Chatbot

**What it is:** An LLM that receives a prompt and returns a response. One turn, one response.

```
User Question → [LLM] → Answer
```

**How it works:**
1. User sends a message
2. LLM generates a response based on its training data
3. Response is returned
4. **That's it.** No tools, no loops, no external data.

**Strengths:**
- ✅ Simple to build (literally one API call)
- ✅ Fast response times
- ✅ Low cost per interaction
- ✅ Predictable behavior

**Weaknesses:**
- ❌ Knowledge cutoff (only knows what it was trained on)
- ❌ Can't access real-time information
- ❌ No tool use — can't take actions
- ❌ Hallucination risk (makes things up confidently)

**Best for:** Creative writing, brainstorming, simple Q&A, summarization of provided text, code generation from a description.

**Real-world examples:** Basic ChatGPT, Claude without tools, simple customer support bots.

### Architecture 2: RAG (Retrieval-Augmented Generation)

**What it is:** An LLM that first retrieves relevant information from a knowledge base, then generates a response grounded in that information.

```
User Question → [Retriever] → Relevant Docs → [LLM + Docs] → Answer
```

**How it works:**
1. User sends a question
2. The question is converted to an embedding (a numerical representation)
3. A vector database is searched for similar documents
4. The most relevant documents are retrieved
5. These documents are injected into the LLM's prompt as context
6. The LLM generates an answer grounded in the retrieved documents

**Strengths:**
- ✅ Grounded in real data (reduces hallucination)
- ✅ Can work with your private documents
- ✅ Knowledge stays up-to-date (update the database, not the model)
- ✅ Relatively simple architecture

**Weaknesses:**
- ❌ Only as good as the retrieval step (garbage in, garbage out)
- ❌ Still one-shot — no multi-step reasoning
- ❌ Can't take actions or use tools
- ❌ Requires building and maintaining a vector database

**Best for:** Documentation Q&A, knowledge bases, customer support with specific docs, research over a fixed corpus, internal company knowledge.

**Real-world examples:** Notion AI, company-specific chatbots, legal document search.

### Architecture 3: Agent

**What it is:** An LLM with tools, memory, and a reasoning loop that works autonomously toward a goal.

```
User Task → [LLM] → Think → Use Tool → Observe → Think → Use Tool → ... → Answer
```

**How it works:**
1. User gives the agent a task
2. The agent reasons about what to do (Perceive-Decide-Act)
3. It calls tools (search, calculate, write, APIs)
4. It observes the results
5. It decides what to do next
6. Repeats until the task is complete

**Strengths:**
- ✅ Can handle complex, multi-step tasks
- ✅ Uses real-time tools (search, APIs, databases)
- ✅ Adapts based on what it discovers
- ✅ Can take actions (not just answer questions)
- ✅ Memory enables learning over time

**Weaknesses:**
- ❌ Complex to build and debug
- ❌ Expensive (multiple LLM calls per task)
- ❌ Slower (multiple steps = more latency)
- ❌ Less predictable (agent might take unexpected paths)
- ❌ Harder to test and evaluate

**Best for:** Research tasks, data analysis, workflow automation, content creation pipelines, coding assistants, personal assistants.

**Real-world examples:** Perplexity, Devin, Claude Code, AutoGPT, GitHub Copilot Workspace.

### Head-to-Head Comparison

| Feature | Chatbot | RAG | Agent |
|---------|---------|-----|-------|
| **Architecture** | LLM only | Retriever + LLM | LLM + Tools + Loop |
| **External Data** | ❌ None | ✅ Document retrieval | ✅ Tools + APIs |
| **Multi-step** | ❌ Single turn | ❌ Single turn | ✅ Iterative loop |
| **Tool Use** | ❌ None | ❌ None (search only) | ✅ Multiple tools |
| **Memory** | ❌ Session only | ❌ Docs only | ✅ Persistent |
| **Autonomy** | ❌ Reactive | ❌ Reactive | ✅ Proactive |
| **Cost** | 💰 Low | 💰💰 Medium | 💰💰💰 High |
| **Latency** | ⚡ Fast | ⚡⚡ Medium | ⚡⚡⚡ Slow |
| **Complexity** | Simple | Medium | Complex |
| **Reliability** | High | Medium-High | Medium-Low |
| **Hallucination** | High risk | Low risk | Low risk (grounded in tools) |

### Decision Framework: Which One to Use?

```
START HERE: What does the user need?
│
├── Just generate text/answer a question?
│   └── Is the answer in the LLM's training data?
│       ├── Yes → CHATBOT ✅
│       └── No → Does it require your private docs?
│           ├── Yes → RAG ✅
│           └── No → Does it need real-time info?
│               ├── Yes → AGENT ✅ (or RAG with live data)
│               └── No → CHATBOT ✅ (with better prompt)
│
├── Need to take ACTIONS (not just answer)?
│   └── AGENT ✅
│
├── Multi-step task (research, analysis, planning)?
│   └── AGENT ✅
│
└── Simple lookup in your documents?
    └── RAG ✅
```

**Rule of thumb:** Start with the simplest solution that could work. Upgrade complexity only when you need to.

### Hybrid Approaches: The Real World

Production systems rarely use just one approach. Most combine elements:

**Agentic RAG:** An agent that uses RAG as one of its tools. It retrieves documents when needed, but can also search the web, calculate, and take other actions.

**RAG with routing:** A system that classifies the user's question and routes it to either a simple chatbot, a RAG pipeline, or an agent, depending on complexity.

**Chatbot with tools:** Claude or ChatGPT with search/code execution enabled. It's technically an agent, but with limited autonomy — the user drives each interaction.

### Cost Analysis

Understanding cost is crucial for production systems:

| Approach | LLM Calls per Task | Typical Cost | Latency |
|----------|-------------------|--------------|---------|
| Chatbot | 1 | $0.001-0.01 | 1-3 sec |
| RAG | 1 (+ embedding) | $0.005-0.05 | 2-5 sec |
| Agent | 3-10+ | $0.05-1.00 | 10-60 sec |

An agent that makes 8 tool calls at $0.10 each costs 100x more than a simple chatbot response. That adds up at scale. This is why choosing the right architecture matters.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **RAG** | Retrieval-Augmented Generation — enhance LLM with retrieved documents |
| **Vector Database** | A database that stores and searches embeddings (numerical representations of text) |
| **Embedding** | A numerical representation of text that captures meaning (similar texts have similar embeddings) |
| **Retriever** | The component that finds relevant documents from a knowledge base |
| **Grounding** | Connecting LLM output to real data sources to reduce hallucination |
| **Agentic RAG** | RAG as a tool within an agent system |
| **Routing** | Directing queries to different systems based on their type/complexity |

## 💻 Code Example: Three Approaches Compared

```python
# ===== Approach 1: CHATBOT =====
# Simple, fast, but limited to training data

def chatbot(question: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": question}]
    )
    return response.choices[0].message.content

# Usage: chatbot("Explain quantum computing in simple terms")
# ✅ Great for: general knowledge, creative tasks
# ❌ Fails at: "What's the weather right now?"


# ===== Approach 2: RAG =====
# Retrieves relevant docs, then answers

def rag(question: str, knowledge_base) -> str:
    # Step 1: Find relevant documents
    relevant_docs = knowledge_base.search(question, top_k=3)
    
    # Step 2: Build context from retrieved docs
    context = "\n\n".join([doc.text for doc in relevant_docs])
    
    # Step 3: Generate answer grounded in documents
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"Answer based on these documents:\n{context}"},
            {"role": "user", "content": question}
        ]
    )
    return response.choices[0].message.content

# Usage: rag("What's our refund policy?", company_docs)
# ✅ Great for: company docs, specific knowledge
# ❌ Fails at: "Research competitor pricing and write a report"


# ===== Approach 3: AGENT =====
# Reasons, uses tools, loops until done

def agent(task: str, tools: dict) -> str:
    messages = [
        {"role": "system", "content": f"You have tools: {list(tools.keys())}"},
        {"role": "user", "content": task}
    ]
    
    for _ in range(10):  # Max 10 iterations
        response = get_llm_decision(messages)
        
        if response.is_final_answer:
            return response.content
        
        # Execute tool and feed result back
        tool_result = tools[response.tool_name](**response.tool_args)
        messages.append({"role": "tool", "content": tool_result})
    
    return "Reached max iterations"

# Usage: agent("Research AI regulation in EU and summarize key points", 
#              {"search": web_search, "read": read_article})
# ✅ Great for: complex, multi-step research
# ❌ Overkill for: "What's 2+2?"
```

## ✏️ Hands-On Exercise

### Exercise 1: Architecture Matching (15 min)

For each scenario, decide: **Chatbot**, **RAG**, or **Agent**? Explain your reasoning.

1. A customer asks "What's your return policy?" on your website
2. A user wants to "Find me the best hotel in Bali under $200/night for next week"
3. A developer asks "How do I use the `map()` function in Python?"
4. A manager says "Analyze our Q3 sales data and create a presentation"
5. A student asks "Quiz me on Chapter 5 of my biology textbook"
6. A user asks "Book a restaurant for 4 people tomorrow at 7pm near downtown"

**Suggested answers (don't peek first!):**
1. RAG — lookup in company docs
2. Agent — needs real-time search, comparison, filtering
3. Chatbot — general knowledge in training data
4. Agent — data analysis + content creation, multi-step
5. RAG — specific document (textbook), but chatbot-style interaction
6. Agent — needs to search, compare, and take action (book)

### Exercise 2: Design a Hybrid System (15 min)

You're building an AI assistant for a law firm. It needs to:
- Answer questions about case law (using the firm's database)
- Research new legal developments online
- Draft legal documents
- Schedule meetings

Design a hybrid system. Draw or describe:
1. Which queries go to which system (chatbot/RAG/agent)?
2. How does the router decide?
3. What tools does the agent need?

## 📖 Curated Resources

### Videos
- 🎥 [AI Agent vs Chatbot Explained](https://www.youtube.com/watch?v=Fh9Xvc6Eaj4) — SystemDR — Comparison with examples
- 🎥 [What is Retrieval-Augmented Generation (RAG)?](https://www.youtube.com/watch?v=T-D1OfcDW1M) — IBM Technology (8 min) — Excellent RAG explanation
- 🎥 [RAG vs Fine-Tuning vs Prompt Engineering](https://www.youtube.com/watch?v=zYGDpG-pTho) — IBM Technology — Great comparison for choosing approaches

### Reading
- 📄 [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — Section on "When to use agents" is gold
- 📄 [LangChain: RAG Concepts](https://docs.langchain.com/oss/python/langchain/overview) — Understand RAG architecture deeply
- 📄 [Chip Huyen: Building LLM Applications](https://huyenchip.com/2023/04/11/llm-engineering.html) — Excellent overview of LLM system architectures

## 🤔 Reflection Questions

1. **Why would you choose RAG over an agent for a company knowledge base?** Think about cost, reliability, and maintenance.

2. **Can a system be both RAG and an agent?** How would that work?

3. **What's the biggest risk of using an agent when a chatbot would suffice?** Think beyond just cost.

4. **You're building a customer support system for a bank.** Which architecture would you use? What are the safety considerations?

5. **How does Perplexity combine these approaches?** It searches the web (agent-like) but returns a single grounded response (RAG-like).

## ➡️ Next Steps

Tomorrow: **Tools & Function Calling** — the hands that let agents interact with the world. You'll learn exactly how LLMs call functions, what tool schemas look like, and see real examples of function calling in action.

**Come prepared with:** Think of 3 tools an agent would need for a task you care about. What inputs would each tool take? What would it return?

---

*Day 3 of 21 • [← Day 2](day-02-pda-loop.md) • [Course Overview](../README.md) • [Day 4 →](day-04-tools-function-calling.md)*
