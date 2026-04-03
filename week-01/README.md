🌐 English | [中文](README.zh.md)

# Week 1: Foundations 🧠

> Understanding what AI agents are, how they work, and why they matter.

## Daily Schedule

### Day 1: What is an AI Agent?
**Time:** 60 min (40 min video + 20 min notes)

**Watch:**
- 🎥 [What are AI Agents?](https://www.youtube.com/watch?v=F8NKVhkZZWI) — IBM Technology (15 min)
- 🎥 [AI Agents Explained - How They Actually Work](https://www.youtube.com/watch?v=g24tJk8Flsk) — LearnThatStack (12 min)
- 🎥 [DeepLearning.AI: What is an Agent?](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Lesson 1 (15 min)

**Key Concepts:**
- An agent is an AI system that can **perceive**, **decide**, and **act** autonomously
- Agents use LLMs as their "brain" but add tools, memory, and planning
- The difference between using AI (chatbot) vs AI that uses tools (agent)

**Notes Template:**
```markdown
## Day 1 Notes: What is an AI Agent?

### My Definition (in my own words):


### Key Takeaway:


### Something That Surprised Me:


### Question I Still Have:

```

---

### Day 2: The PDA Loop (Perceive-Decide-Act)
**Time:** 60 min (30 min video + 30 min diagram)

**Watch:**
- 🎥 [AI Agents Explained - How They Actually Work](https://www.youtube.com/watch?v=g24tJk8Flsk) — LearnThatStack — Focus on the reasoning loop
- 🎥 [Understanding ReACT with LangChain](https://www.youtube.com/watch?v=Eug2clsLtFs) — Sam Witteveen (20 min)

**Key Concepts:**
- **Perceive:** Agent receives input (user query, tool results, environment data)
- **Decide:** LLM reasons about what to do next (chain-of-thought, ReAct)
- **Act:** Agent executes an action (call a tool, respond, update memory)
- The loop repeats until the task is complete

**Activity:** Open `diagrams/01-pda-loop.excalidraw` and trace through the loop

---

### Day 3: Agent vs Chatbot vs RAG
**Time:** 60 min (40 min video + 20 min comparison)

**Watch:**
- 🎥 [AI Agent vs Chatbot Explained](https://www.youtube.com/watch?v=Fh9Xvc6Eaj4) — SystemDR (10 min)
- 🎥 [What is Retrieval-Augmented Generation (RAG)?](https://www.youtube.com/watch?v=T-D1OfcDW1M) — IBM Technology (8 min)

**Key Concepts:**

| Feature | Chatbot | RAG | Agent |
|---------|---------|-----|-------|
| Memory | Session only | Retrieved docs | Persistent |
| Tools | None | Search/retrieve | Multiple tools |
| Planning | None | None | Multi-step |
| Autonomy | Reactive | Reactive | Proactive |

**Activity:** Open `diagrams/02-agent-vs-chatbot-vs-rag.excalidraw`

---

### Day 4: Tools & Function Calling
**Time:** 60 min (40 min video + 20 min demo)

**Watch:**
- 🎥 [OpenAI GPT-4 Function Calling: Unlimited Potential](https://www.youtube.com/watch?v=0lOSvOoF2to) — sentdex (25 min)
- 🎥 [OpenAI Function Calling - Full Beginner Tutorial](https://www.youtube.com/watch?v=aqdWSYWC_LI) — Dave Ebbelaar (15 min)

**Key Concepts:**
- Function calling = how LLMs interact with external tools
- JSON schema defines what tools are available
- The LLM decides WHICH tool to call and with WHAT parameters
- Results come back and the LLM interprets them

**Activity:** Open `diagrams/03-tool-calling.excalidraw`

---

### Day 5: Memory & Context
**Time:** 60 min (40 min video + 20 min notes)

**Watch:**
- 🎥 [Chatbot Memory for Chat-GPT, Davinci + other LLMs](https://www.youtube.com/watch?v=X05uK0TZozM) — James Briggs (20 min)
- 🎥 [DeepLearning.AI: Persistence and Memory](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Lesson 3 (20 min)

**Key Concepts:**
- **Short-term memory:** Current conversation context
- **Long-term memory:** Stored knowledge across sessions (vector DB, files)
- **Working memory:** Intermediate results during a task
- Memory enables agents to learn and improve over time

---

### Day 6: Explore Existing Agents 💻
**Time:** 60 min (hands-on exploration)

**Activity:** See `projects/week-01/` for the full project guide.

1. **AutoGPT** (20 min) — Read the docs, watch a demo
2. **BabyAGI** (15 min) — Understand task decomposition
3. **Claude Code** (15 min) — You're already using one! Analyze how it works
4. **Write up** (10 min) — Compare architectures

---

### Day 7: Week 1 Review + Share 📱
**Time:** 60 min (30 min review + 30 min post)

**Review:**
- Revisit your notes from Days 1-5
- Update the concept map diagram
- Identify your biggest "aha moment"

**Share on RedNote:**
Use the template in `build-in-public/week-01-post.md`

---

## 📚 Week 1 Resources

- [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/)
- [LangChain Docs: Agents](https://docs.langchain.com/oss/python/langchain/overview)
- [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
