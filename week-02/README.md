# Week 2: Building 🔨

> Get your hands dirty. Build your first AI agent.

## Daily Schedule

### Day 8: LangChain Fundamentals
**Time:** 60 min (45 min course + 15 min setup)

**Watch:**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents with LangChain](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — Lessons 1-2

**Setup:**
```bash
pip install langchain langchain-openai python-dotenv
echo "OPENAI_API_KEY=your-key-here" > .env
```

**Key Concepts:**
- LangChain is a framework for building LLM applications
- Chains: sequences of calls (prompt → LLM → output)
- Agents: LLMs that choose which tools to use
- Tools: functions the agent can call

---

### Day 9: Prompt Engineering for Agents
**Time:** 60 min (40 min video + 20 min practice)

**Watch:**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — Lesson 3
- 🎥 [AI Prompt Engineering: A Deep Dive](https://www.youtube.com/watch?v=T9aRN5JkmL8) — Anthropic (20 min)

**Key Concepts:**
- System prompts define the agent's personality and constraints
- ReAct prompting: Thought → Action → Observation loop
- Few-shot examples help agents understand tool usage
- Guard rails: what the agent should and shouldn't do

**Practice:** Write a system prompt for a research assistant agent

---

### Day 10: Tool Calling Deep Dive
**Time:** 60 min (30 min video + 30 min code)

**Watch:**
- 🎥 [DeepLearning.AI: Functions, Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — Lesson 4-5

**Code Along:**
```python
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Your search implementation
    return f"Results for: {query}"

@tool
def calculate(expression: str) -> str:
    """Calculate a math expression."""
    return str(eval(expression))

# Create agent with tools
llm = ChatOpenAI(model="gpt-4")
tools = [search_web, calculate]
```

---

### Day 11: Building a Search Agent 💻
**Time:** 60 min (project start)

**Project:** Build a research agent that can search the web and summarize findings.

See `projects/week-02/` for the full project guide.

**Today's Goal:**
1. Set up the project structure
2. Define tools (web search, summarize)
3. Create the agent with LangChain
4. Test with a simple query

---

### Day 12: Adding Memory to Your Agent
**Time:** 60 min (project continue)

**Watch:**
- 🎥 [DeepLearning.AI: AI Agents in LangGraph](https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/) — Lesson on Persistence

**Today's Goal:**
1. Add conversation memory (remember past queries)
2. Add a note-taking tool (save findings)
3. Test multi-turn research conversations

---

### Day 13: Testing & Debugging Agents
**Time:** 60 min (project polish)

**Watch:**
- 🎥 [LangSmith Tutorial - LLM Evaluation for Beginners](https://www.youtube.com/watch?v=tFXm5ijih98) — Dave Ebbelaar (15 min)

**Today's Goal:**
1. Add error handling (what if a tool fails?)
2. Add logging (trace the agent's reasoning)
3. Test edge cases
4. Document what you built

---

### Day 14: Week 2 Review + Share 📱
**Time:** 60 min (30 min review + 30 min post)

**Review:**
- Demo your research agent
- What worked? What was harder than expected?
- What would you improve?

**Share on RedNote:**
Use the template in `build-in-public/week-02-post.md`

---

## 📚 Week 2 Resources

- [LangChain Python Docs](https://docs.langchain.com/oss/python/langchain/overview)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [Tavily Search API](https://tavily.com/) (free tier for search tool)
