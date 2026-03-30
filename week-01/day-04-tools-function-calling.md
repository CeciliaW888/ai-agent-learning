# Day 4: Tools & Function Calling

> *"Give a man a fish and you feed him for a day. Give an LLM tools and it can feed itself forever."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Explain how LLMs call external functions (the mechanism, not magic)
- Write a JSON tool schema that an LLM can understand
- Understand the request-response cycle of function calling
- Identify what makes a good tool vs a bad tool
- Build a simple tool and connect it to an LLM

## 📚 Core Concepts

### Why This Matters

Tools are what give agents their **superpowers**. Without tools, an LLM can only generate text. With tools, it can search the web, run calculations, query databases, send emails, control smart devices — basically anything you can code.

Function calling is the bridge between "AI that talks" and "AI that acts." Understanding this mechanism deeply will make you a much better agent builder.

> 📊 **Diagram:** Open `diagrams/03-tool-calling.excalidraw` for a visual of the function calling flow.

### How Function Calling Works

Here's the key insight: **the LLM doesn't actually call functions.** It generates structured output (JSON) that describes *which* function to call and *with what arguments*. Your code does the actual calling.

```
Step 1: You tell the LLM what tools are available (JSON schema)
Step 2: User asks a question
Step 3: LLM decides to use a tool and outputs: {"name": "search", "args": {"query": "..."}}
Step 4: YOUR CODE executes the actual function
Step 5: You send the result back to the LLM
Step 6: LLM incorporates the result into its response
```

It's like a boss (LLM) who writes memos saying "please do X" and an assistant (your code) who actually does X and reports back.

### The Tool Schema

Before an LLM can use a tool, it needs to know:
1. **What's it called?** (name)
2. **What does it do?** (description)
3. **What inputs does it need?** (parameters)
4. **What does it return?** (not always specified, but helpful)

This is defined using a **JSON Schema**:

```json
{
  "name": "get_weather",
  "description": "Get the current weather for a specific location. Use this when the user asks about weather conditions.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and country, e.g., 'Sydney, Australia'"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit. Default: celsius"
      }
    },
    "required": ["location"]
  }
}
```

**Why the description matters so much:** The LLM reads the description to decide *when* to use the tool. A vague description = the LLM won't use it correctly. A clear description = reliable tool use.

### The Complete Flow

```python
# 1. Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for current information on any topic",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    }
                },
                "required": ["query"]
            }
        }
    }
]

# 2. Send message with tools
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What's the latest news about AI?"}],
    tools=tools
)

# 3. LLM decides to call a tool
# response.choices[0].message.tool_calls = [
#   {"function": {"name": "search_web", "arguments": '{"query": "latest AI news 2024"}'}}
# ]

# 4. YOUR CODE executes the function
search_result = search_web(query="latest AI news 2024")  # You run this!

# 5. Send result back to LLM
messages.append({"role": "tool", "content": search_result})
final_response = openai.chat.completions.create(
    model="gpt-4",
    messages=messages
)

# 6. LLM generates final answer using the search results
print(final_response.choices[0].message.content)
```

### What Makes a Good Tool?

**Good tools are:**

| Quality | Good Example | Bad Example |
|---------|-------------|-------------|
| **Clear name** | `search_web` | `do_stuff` |
| **Specific description** | "Search the web for current information" | "A useful tool" |
| **Typed parameters** | `{"query": "string"}` | Untyped or ambiguous |
| **Single responsibility** | One tool = one job | One tool does 10 things |
| **Error handling** | Returns clear error messages | Crashes silently |
| **Deterministic** | Same input → predictable output | Random or unstable |

**Tool design tips:**

1. **Write descriptions for the LLM, not for humans.** Include examples and edge cases.
2. **Use enums when possible.** `"enum": ["celsius", "fahrenheit"]` is better than a free-text string.
3. **Make required vs optional clear.** Don't make the LLM guess.
4. **Return structured data.** JSON responses are easier for the LLM to parse than raw text.
5. **Include error cases.** The LLM needs to know what failure looks like.

### Parallel vs Sequential Tool Calls

Modern LLMs can request multiple tool calls at once:

**Sequential** (one at a time):
```
LLM: Call search("AI news")
→ Result: [news articles]
LLM: Call summarize(articles)
→ Result: [summary]
LLM: Here's your summary...
```

**Parallel** (multiple at once):
```
LLM: Call search("AI news") AND search("AI regulation") AND get_weather("Sydney")
→ Results: [news], [regulation], [weather]
LLM: Here's everything you asked for...
```

Parallel calls are faster but only work when the calls are **independent** (one doesn't need the output of another).

### Tool Calling Across Providers

Different LLM providers have slightly different formats, but the concept is identical:

**OpenAI:**
```python
tools=[{"type": "function", "function": {"name": "...", "parameters": {...}}}]
```

**Anthropic (Claude):**
```python
tools=[{"name": "...", "description": "...", "input_schema": {...}}]
```

**Google (Gemini):**
```python
tools=[{"function_declarations": [{"name": "...", "parameters": {...}}]}]
```

The pattern is always the same: describe the tool → LLM chooses to use it → you execute → feed results back.

### Common Gotchas

⚠️ **LLMs can hallucinate tool calls.** An LLM might try to call a tool that doesn't exist, or pass wrong argument types. Always validate.

⚠️ **Tool descriptions are part of the prompt.** Too many tools = too much context = slower and more expensive. Keep your tool set focused.

⚠️ **Return values matter.** If your tool returns a 10,000 word response, that's expensive context. Summarize or truncate large tool outputs.

⚠️ **Security!** If your tool runs code or accesses files, the LLM could be manipulated (prompt injection) into doing harmful things. Always sandbox tools.

⚠️ **Rate limits.** The LLM doesn't know about API rate limits. Your tool execution layer needs to handle retries and backoff.

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Function Calling** | The mechanism by which LLMs specify which external functions to execute |
| **Tool Schema** | JSON description of a tool's name, purpose, and parameters |
| **Tool Call** | The LLM's request to execute a specific function with specific arguments |
| **Tool Result** | The output from executing a tool, sent back to the LLM |
| **Parallel Tool Calls** | Multiple tool calls requested in a single LLM response |
| **Structured Output** | LLM generating JSON instead of free-form text |
| **Prompt Injection** | Attack where malicious input tricks the LLM into misusing tools |

## 💻 Code Example: Building a Multi-Tool Agent

```python
import openai
import json
from datetime import datetime

# ===== Define your tools (the actual functions) =====

def search_web(query: str) -> str:
    """Simulate a web search (replace with real API like Tavily)"""
    # In production, you'd call Tavily, Brave, or Google API here
    return f"Search results for '{query}': [simulated results]"

def get_current_time(timezone: str = "UTC") -> str:
    """Get the current date and time"""
    return f"Current time ({timezone}): {datetime.now().isoformat()}"

def calculate(expression: str) -> str:
    """Safely evaluate a math expression"""
    # WARNING: eval() is dangerous in production! Use a safe math parser instead.
    try:
        # Only allow safe math operations
        allowed_chars = set("0123456789+-*/.() ")
        if not all(c in allowed_chars for c in expression):
            return "Error: Expression contains invalid characters"
        result = eval(expression)
        return f"Result: {result}"
    except Exception as e:
        return f"Error: {str(e)}"

def save_note(title: str, content: str) -> str:
    """Save a note to a file"""
    filename = title.lower().replace(" ", "_") + ".md"
    # In production, write to actual file/database
    return f"Note saved as '{filename}'"

# ===== Map tool names to functions =====
TOOL_MAP = {
    "search_web": search_web,
    "get_current_time": get_current_time,
    "calculate": calculate,
    "save_note": save_note,
}

# ===== Define tool schemas for the LLM =====
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the internet for current information. Use when you need recent data, facts, or news.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Get the current date and time. Use when the user asks about today's date or current time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {"type": "string", "description": "Timezone (e.g., 'UTC', 'US/Eastern')", "default": "UTC"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Calculate a mathematical expression. Use for any math the user needs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Math expression, e.g., '15 * 0.18 + 47.50'"}
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "save_note",
            "description": "Save a note with a title and content. Use when the user wants to record or save information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Note title"},
                    "content": {"type": "string", "description": "Note content (markdown supported)"}
                },
                "required": ["title", "content"]
            }
        }
    }
]

# ===== The Agent Loop =====
def run_agent(user_message: str, max_iterations: int = 5):
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Use tools when needed to answer accurately."},
        {"role": "user", "content": user_message}
    ]
    
    for i in range(max_iterations):
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=messages,
            tools=TOOL_SCHEMAS,
        )
        
        assistant_msg = response.choices[0].message
        messages.append(assistant_msg)
        
        # If no tool calls, we're done
        if not assistant_msg.tool_calls:
            print(f"Agent (final): {assistant_msg.content}")
            return assistant_msg.content
        
        # Execute each tool call
        for tool_call in assistant_msg.tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            
            print(f"  🔧 Calling: {func_name}({func_args})")
            
            # Execute the actual function
            if func_name in TOOL_MAP:
                result = TOOL_MAP[func_name](**func_args)
            else:
                result = f"Error: Unknown tool '{func_name}'"
            
            print(f"  📋 Result: {result}")
            
            # Feed result back to the LLM
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
    
    return "Max iterations reached."

# ===== Try it! =====
# run_agent("What time is it, and what's 15% tip on a $85 dinner?")
# run_agent("Search for the latest news about AI agents and save a summary note")
```

## ✏️ Hands-On Exercise

### Exercise 1: Design Tool Schemas (15 min)

Design JSON tool schemas for these three tools. Focus on clear descriptions and appropriate parameter types:

1. **`send_email`** — Send an email to someone
2. **`read_file`** — Read contents of a file from disk
3. **`create_calendar_event`** — Add an event to a calendar

For each tool, define:
- Name
- Description (written for the LLM)
- Parameters (with types, descriptions, required fields)

### Exercise 2: Trace a Tool Calling Sequence (10 min)

Given these tools: `search_web`, `calculate`, `get_weather`

Trace the tool calls an agent would make for:
> "I'm planning a trip to Tokyo next week. What's the weather like, and if my budget is $3,000 and the flight costs $800, how much do I have left per day for a 7-day trip?"

Write out each step:
1. Which tool is called first? With what arguments?
2. What's the second call?
3. How many total LLM calls are needed?

### Exercise 3: Run the Code (if setup is done) (15 min)

If you have Python and an OpenAI API key:
1. Copy the code example above
2. Run it with different queries
3. Watch the tool calls in the console output
4. Try adding a new tool (e.g., `translate_text`)

## 📖 Curated Resources

### Videos
- 🎥 [OpenAI GPT-4 Function Calling: Unlimited Potential](https://www.youtube.com/watch?v=0lOSvOoF2to) — sentdex (25 min) — Deep technical walkthrough
- 🎥 [OpenAI Function Calling - Full Beginner Tutorial](https://www.youtube.com/watch?v=aqdWSYWC_LI) — Dave Ebbelaar — Practical code examples
- 🎥 [AI Agents 101: Tool Use & Function Calling](https://www.youtube.com/watch?v=ODUN-XTEzvQ) — All About AI — Claude & OpenAI function calling

### Reading
- 📄 [OpenAI: Function Calling Guide](https://platform.openai.com/docs/guides/function-calling) — Official docs, very clear
- 📄 [Anthropic: Tool Use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) — Claude's tool use documentation
- 📄 [Gorilla LLM Paper](https://arxiv.org/abs/2305.15334) — Research on making LLMs better at API calls

### Documentation
- 📋 [OpenAI API Reference: Tool Calls](https://platform.openai.com/docs/api-reference/chat/create)
- 📋 [LangChain: Tools](https://docs.langchain.com/oss/python/langchain/overview) — Framework-level tool abstractions

## 🤔 Reflection Questions

1. **Why doesn't the LLM execute functions directly?** What are the security and architectural reasons for the "LLM decides, code executes" pattern?

2. **How would you handle a tool that takes 30 seconds to respond?** Think about user experience and timeout handling.

3. **What happens if the LLM tries to call a tool with wrong argument types?** How would you build validation?

4. **Why is the tool description so important?** What happens if it's vague or misleading?

5. **How many tools is too many?** What are the trade-offs of giving an agent 50 tools vs 5?

## ➡️ Next Steps

Tomorrow: **Memory & State** — how agents remember things across conversations and build knowledge over time. You'll learn about conversation memory, vector stores, and different memory architectures.

**Come prepared with:** Think about what information an agent should remember between conversations. What would you want a personal assistant to remember about you?

---

*Day 4 of 21 • [← Day 3](day-03-agent-vs-chatbot-vs-rag.md) • [Course Overview](../README.md) • [Day 5 →](day-05-memory-state.md)*
