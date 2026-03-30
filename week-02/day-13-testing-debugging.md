# Day 13: Testing & Debugging Agents

> *"Debugging is twice as hard as writing the code in the first place."* — Brian Kernighan

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Trace an agent's reasoning step by step
- Debug common agent failures (loops, wrong tools, hallucinations)
- Write tests for agent tools and behavior
- Use logging and tracing to understand agent decisions
- Set up LangSmith for visual debugging (optional)

## 📚 Core Concepts

### Why This Matters

Agents are harder to debug than normal code because they're **non-deterministic**. The same input might produce different tool calls, different reasoning paths, and different outputs. You can't just set a breakpoint — you need to trace the agent's "thought process."

### The Five Most Common Agent Bugs

#### Bug 1: The Infinite Loop

**Symptom:** Agent keeps calling tools without ever returning a final answer.

**Common causes:**
- System prompt doesn't define when to stop
- Tool results don't give enough info to conclude
- Agent keeps rephrasing the same search

**Fix:**
```python
# Always set max iterations
agent = create_react_agent(llm, tools)

# In LangGraph, use recursion_limit
result = agent.invoke(
    {"messages": messages},
    config={"recursion_limit": 25}  # Limits total steps
)
```

#### Bug 2: Wrong Tool Selection

**Symptom:** Agent uses search when it should calculate, or vice versa.

**Common causes:**
- Tool descriptions overlap or are vague
- Tool names are confusing

**Fix:** Make descriptions mutually exclusive:
```python
# ❌ Overlapping descriptions
@tool
def search(query: str) -> str:
    """Find information."""  # Too vague — when to use this vs other tools?

# ✅ Clear, exclusive descriptions  
@tool
def search_web(query: str) -> str:
    """Search the INTERNET for current information. 
    Use ONLY when you need facts from the web.
    Do NOT use for math or file operations."""
```

#### Bug 3: Hallucinated Tool Calls

**Symptom:** Agent tries to call a tool that doesn't exist or passes wrong argument types.

**Fix:** Validate tool calls before execution:
```python
def safe_execute_tool(tool_name: str, args: dict, available_tools: dict):
    if tool_name not in available_tools:
        return f"Error: Tool '{tool_name}' does not exist. Available: {list(available_tools.keys())}"
    
    tool = available_tools[tool_name]
    try:
        return tool.invoke(args)
    except TypeError as e:
        return f"Error: Wrong arguments for '{tool_name}': {e}"
    except Exception as e:
        return f"Error executing '{tool_name}': {e}"
```

#### Bug 4: Context Window Overflow

**Symptom:** Agent starts forgetting earlier parts of the conversation, gives inconsistent answers.

**Fix:** Monitor and manage context size:
```python
def count_tokens(messages: list, model: str = "gpt-4o-mini") -> int:
    """Rough token count (1 token ≈ 4 chars for English)"""
    text = str(messages)
    return len(text) // 4

# Before each LLM call
token_count = count_tokens(messages)
if token_count > 100000:  # Getting close to limit
    # Summarize older messages
    messages = compress_messages(messages)
```

#### Bug 5: Silent Tool Failures

**Symptom:** Agent produces wrong results because a tool quietly returned bad data.

**Fix:** Always validate tool outputs:
```python
@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    result = api.search(query)
    
    # Validate the result
    if result is None:
        return "Error: Search returned no data. Try a different query."
    if len(str(result)) < 10:
        return f"Warning: Very short result for '{query}'. May need a better query."
    if "error" in str(result).lower():
        return f"Error in search result: {result}"
    
    return format_results(result)
```

### Debugging with Logging

Add logging to see what your agent is thinking:

```python
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('agent_debug.log'),
        logging.StreamHandler()  # Also print to console
    ]
)
logger = logging.getLogger("research_agent")

# Log tool calls
@tool
def search_web(query: str) -> str:
    """Search the web."""
    logger.info(f"🔍 SEARCH called with query: '{query}'")
    
    result = do_search(query)
    
    logger.info(f"📋 SEARCH returned {len(result)} chars")
    logger.debug(f"📋 SEARCH result: {result[:200]}")
    
    return result
```

### Tracing Agent Steps

Build a tracer that records every step:

```python
class AgentTracer:
    """Records every step of agent execution for debugging."""
    
    def __init__(self):
        self.steps = []
    
    def log_step(self, step_type: str, data: dict):
        self.steps.append({
            "step": len(self.steps) + 1,
            "type": step_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    
    def print_trace(self):
        print("\n" + "=" * 60)
        print("AGENT EXECUTION TRACE")
        print("=" * 60)
        for step in self.steps:
            print(f"\nStep {step['step']} [{step['type']}]")
            for key, value in step['data'].items():
                preview = str(value)[:200]
                print(f"  {key}: {preview}")
        print(f"\nTotal steps: {len(self.steps)}")
        print("=" * 60)
    
    def save_trace(self, filepath: str = "traces/latest.json"):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(self.steps, f, indent=2)

# Usage
tracer = AgentTracer()

# In your agent loop:
tracer.log_step("user_input", {"message": user_input})
tracer.log_step("tool_call", {"tool": "search", "query": query})
tracer.log_step("tool_result", {"result": result[:500]})
tracer.log_step("llm_response", {"content": response.content})

# After execution:
tracer.print_trace()
```

### Writing Tests for Agents

#### Level 1: Test Tools in Isolation

```python
def test_search_tool():
    """Test that search returns valid results."""
    result = search_web.invoke({"query": "Python programming"})
    assert isinstance(result, str), "Should return a string"
    assert len(result) > 50, "Should return substantial content"
    assert "Error" not in result, f"Search failed: {result}"

def test_search_error_handling():
    """Test that search handles bad input gracefully."""
    result = search_web.invoke({"query": ""})
    # Should return an error message, not crash
    assert isinstance(result, str)

def test_calculator():
    """Test basic math."""
    result = calculate.invoke({"expression": "2 + 2"})
    assert "4" in result

def test_calculator_division_by_zero():
    """Test error handling."""
    result = calculate.invoke({"expression": "1/0"})
    assert "Error" in result or "zero" in result.lower()
```

#### Level 2: Test Agent Behavior

```python
def test_agent_uses_search_for_factual_questions():
    """Agent should search the web for factual questions."""
    result = agent.invoke({
        "messages": [{"role": "user", "content": "What is the population of Japan?"}]
    })
    
    # Check that search was called
    tool_calls = [m for m in result["messages"] if hasattr(m, 'tool_calls') and m.tool_calls]
    assert len(tool_calls) > 0, "Agent should have used tools"
    
    tool_names = [tc['name'] for m in tool_calls for tc in m.tool_calls]
    assert "search_web" in tool_names, "Agent should have searched the web"

def test_agent_uses_calculator_for_math():
    """Agent should use calculator for math, not estimate."""
    result = agent.invoke({
        "messages": [{"role": "user", "content": "What is 847 * 293?"}]
    })
    
    tool_calls = [m for m in result["messages"] if hasattr(m, 'tool_calls') and m.tool_calls]
    tool_names = [tc['name'] for m in tool_calls for tc in m.tool_calls]
    assert "calculate" in tool_names, "Agent should have used calculator"

def test_agent_produces_structured_output():
    """Agent should follow the response format."""
    result = agent.invoke({
        "messages": [{"role": "user", "content": "Research Python vs JavaScript for backend"}]
    })
    
    final_msg = result["messages"][-1].content
    assert "Summary" in final_msg or "summary" in final_msg.lower(), "Response should have summary section"
```

#### Level 3: Test Edge Cases

```python
def test_agent_handles_empty_search():
    """Agent should handle when search returns nothing."""
    # Use a query that returns no results
    result = agent.invoke({
        "messages": [{"role": "user", "content": "Research xyzzy123abc456 topic"}]
    })
    final_msg = result["messages"][-1].content
    # Should NOT hallucinate — should say it couldn't find info
    assert "not found" in final_msg.lower() or "couldn't find" in final_msg.lower()

def test_agent_respects_max_iterations():
    """Agent should not loop forever."""
    import time
    start = time.time()
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "Research everything about AI"}]},
        config={"recursion_limit": 15}
    )
    elapsed = time.time() - start
    assert elapsed < 120, f"Agent took {elapsed:.0f}s — possible infinite loop"
```

### LangSmith (Optional but Powerful)

LangSmith provides visual tracing for LangChain agents:

```python
# Set environment variables
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-key"
os.environ["LANGCHAIN_PROJECT"] = "research-agent"

# That's it! All agent runs are now traced at smith.langchain.com
```

LangSmith shows you:
- Every LLM call with full prompt and response
- Tool calls with inputs and outputs
- Token usage and latency per step
- Error highlighting
- Run comparison

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Tracing** | Recording every step of agent execution for analysis |
| **Non-deterministic** | Same input may produce different outputs each run |
| **LangSmith** | LangChain's debugging and monitoring platform |
| **Recursion Limit** | Maximum number of agent steps allowed |
| **Regression Test** | Test that verifies previously working behavior hasn't broken |
| **Edge Case** | An unusual input or situation that might cause unexpected behavior |

## ✏️ Hands-On Exercise

### Exercise 1: Add Logging to Your Agent (15 min)

Add the logging setup from the lesson to your research agent. Run a query and examine:
- What tools were called, in what order?
- How many LLM calls were made?
- Were there any errors or retries?

### Exercise 2: Write 5 Tests (20 min)

Write tests for your research agent covering:
1. Tool returns correct types
2. Agent uses search for factual questions
3. Agent uses calculator for math
4. Agent handles errors gracefully
5. Agent finishes within a time limit

### Exercise 3: Break Your Agent (15 min)

Try to make your agent fail:
- Ask an extremely vague question
- Ask for something impossible
- Send a very long message
- Ask about a nonexistent topic

Document what happened and how you'd fix each failure.

## 📖 Curated Resources

### Videos
- 🎥 [LangSmith Tutorial - LLM Evaluation for Beginners](https://www.youtube.com/watch?v=tFXm5ijih98) — Dave Ebbelaar — Visual agent tracing
- 🎥 [How to Build, Evaluate, and Iterate on LLM Agents](https://www.youtube.com/watch?v=0pnEUAwoDP0) — DeepLearningAI — Testing strategies

### Reading
- 📄 [LangSmith Documentation](https://docs.smith.langchain.com/) — Full tracing guide
- 📄 [LangGraph Debugging Guide](https://docs.langchain.com/oss/python/langgraph/overview) — Debug LangGraph agents
- 📄 [Hamel Husain: Testing LLM Apps](https://hamel.dev/blog/posts/evals/) — Excellent practical guide

## 🤔 Reflection Questions

1. **Why is testing agents harder than testing regular software?** What makes non-determinism challenging?
2. **What's the most important thing to log?** If you could only log one thing per agent step, what would it be?
3. **How do you test "quality" of agent responses?** It's not just right/wrong — how do you measure "good research"?
4. **When should you use LangSmith vs simple logging?** What scale justifies the extra tool?

## ➡️ Next Steps

Tomorrow: **Week 2 Review** — consolidate everything you've built, polish your research agent, and prepare for Week 3's multi-agent systems.

---

*Day 13 of 21 • [← Day 12](day-12-adding-memory.md) • [Course Overview](../README.md) • [Day 14 →](day-14-week-review.md)*
