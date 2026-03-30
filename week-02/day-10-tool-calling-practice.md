# Day 10: Tool Calling Practice

> *"In theory, there is no difference between theory and practice. In practice, there is."* — Yogi Berra

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Build production-quality tools with proper error handling
- Design tool interfaces that LLMs use reliably
- Implement common tool patterns (search, CRUD, validation)
- Handle tool failures gracefully
- Test tools independently before connecting them to agents

## 📚 Core Concepts

### Why This Matters

Yesterday you learned how to prompt agents. Today you build what agents actually USE. Tools are the hands and feet of your agent — if they're unreliable, your agent is unreliable. A well-built tool with clear errors is worth more than a clever tool that fails silently.

### Tool Design Principles

#### Principle 1: Single Responsibility
Each tool does ONE thing well.

```python
# ❌ Bad: One tool that does everything
@tool
def do_research(action: str, query: str = "", url: str = "", text: str = "") -> str:
    """Do various research actions."""
    if action == "search": ...
    elif action == "read": ...
    elif action == "summarize": ...

# ✅ Good: Separate tools for each action
@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    ...

@tool 
def read_webpage(url: str) -> str:
    """Read and extract text from a webpage."""
    ...

@tool
def summarize_text(text: str) -> str:
    """Summarize a piece of text into key points."""
    ...
```

#### Principle 2: Clear Input/Output Contracts

```python
@tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> str:
    """Convert an amount from one currency to another.
    
    Args:
        amount: The amount to convert (e.g., 100.50)
        from_currency: 3-letter currency code (e.g., 'USD', 'EUR', 'AUD')
        to_currency: 3-letter currency code (e.g., 'JPY', 'GBP', 'CNY')
    
    Returns:
        The converted amount with both currencies shown.
        Example: "100.50 USD = 15,234.67 JPY"
    
    Raises:
        Returns error message if currency code is invalid.
    """
    ...
```

#### Principle 3: Graceful Error Handling

```python
@tool
def fetch_stock_price(symbol: str) -> str:
    """Get the current stock price for a ticker symbol.
    
    Args:
        symbol: Stock ticker (e.g., 'AAPL', 'GOOGL', 'MSFT')
    """
    try:
        # Validate input
        symbol = symbol.upper().strip()
        if not symbol.isalpha() or len(symbol) > 5:
            return f"Error: '{symbol}' is not a valid stock ticker. Use 1-5 letter symbols like 'AAPL'."
        
        # Make the API call
        response = requests.get(f"https://api.example.com/stock/{symbol}")
        
        if response.status_code == 404:
            return f"Error: Stock '{symbol}' not found. Check the ticker symbol."
        elif response.status_code == 429:
            return "Error: Rate limited. Please try again in a moment."
        elif response.status_code != 200:
            return f"Error: API returned status {response.status_code}. Try again."
        
        data = response.json()
        return f"{symbol}: ${data['price']:.2f} ({data['change']:+.2f}%)"
        
    except requests.Timeout:
        return "Error: Request timed out. The service may be slow."
    except requests.ConnectionError:
        return "Error: Could not connect to the stock API. Check your internet connection."
    except Exception as e:
        return f"Error: Unexpected problem — {str(e)}"
```

**Why this matters:** When a tool returns a clear error message, the agent can reason about it and try something different. When a tool crashes or returns garbage, the agent spirals.

#### Principle 4: Return Structured, Concise Data

```python
# ❌ Bad: Returns too much raw data
@tool
def search(query: str) -> str:
    results = api.search(query)
    return json.dumps(results)  # Could be 10,000 characters!

# ✅ Good: Returns concise, relevant data
@tool
def search(query: str) -> str:
    results = api.search(query, max_results=3)
    formatted = []
    for r in results:
        formatted.append(f"• {r['title']}: {r['snippet'][:200]}")
    return "\n".join(formatted)
```

### Common Tool Patterns

#### Pattern 1: Search Tool (with Tavily)

```python
# pip install tavily-python
from tavily import TavilyClient

@tool
def search_web(query: str) -> str:
    """Search the web for current information on any topic.
    Returns top 3 results with titles and summaries.
    
    Args:
        query: Specific search query. Be precise for better results.
    """
    try:
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        results = client.search(query, max_results=3)
        
        if not results.get("results"):
            return f"No results found for '{query}'. Try rephrasing."
        
        formatted = []
        for r in results["results"]:
            formatted.append(
                f"**{r['title']}**\n"
                f"{r['content'][:300]}\n"
                f"Source: {r['url']}"
            )
        
        return "\n\n---\n\n".join(formatted)
    except Exception as e:
        return f"Search error: {str(e)}"
```

#### Pattern 2: File Operations

```python
import os

@tool
def read_file(filepath: str) -> str:
    """Read the contents of a text file.
    
    Args:
        filepath: Path to the file (e.g., 'data/report.txt')
    """
    try:
        # Security: prevent path traversal
        safe_path = os.path.abspath(filepath)
        if not safe_path.startswith(os.path.abspath(".")):
            return "Error: Cannot access files outside the project directory."
        
        if not os.path.exists(safe_path):
            return f"Error: File '{filepath}' not found."
        
        with open(safe_path, 'r') as f:
            content = f.read()
        
        # Don't return huge files
        if len(content) > 5000:
            return content[:5000] + f"\n\n[Truncated — file has {len(content)} characters total]"
        
        return content
    except PermissionError:
        return f"Error: No permission to read '{filepath}'."
    except Exception as e:
        return f"Error reading file: {str(e)}"

@tool
def write_file(filepath: str, content: str) -> str:
    """Write content to a text file. Creates the file if it doesn't exist.
    
    Args:
        filepath: Path for the file (e.g., 'output/summary.md')
        content: Text content to write
    """
    try:
        safe_path = os.path.abspath(filepath)
        if not safe_path.startswith(os.path.abspath(".")):
            return "Error: Cannot write files outside the project directory."
        
        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        
        with open(safe_path, 'w') as f:
            f.write(content)
        
        return f"Successfully wrote {len(content)} characters to '{filepath}'."
    except Exception as e:
        return f"Error writing file: {str(e)}"
```

#### Pattern 3: API Wrapper

```python
import requests

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city.
    
    Args:
        city: City name (e.g., 'Sydney', 'Tokyo', 'New York')
    """
    try:
        api_key = os.getenv("WEATHER_API_KEY")
        if not api_key:
            return "Error: Weather API key not configured."
        
        response = requests.get(
            "https://api.weatherapi.com/v1/current.json",
            params={"key": api_key, "q": city},
            timeout=10
        )
        
        if response.status_code != 200:
            return f"Error: Could not get weather for '{city}'. Check the city name."
        
        data = response.json()
        current = data["current"]
        
        return (
            f"Weather in {data['location']['name']}, {data['location']['country']}:\n"
            f"🌡️ Temperature: {current['temp_c']}°C ({current['temp_f']}°F)\n"
            f"☁️ Condition: {current['condition']['text']}\n"
            f"💨 Wind: {current['wind_kph']} km/h\n"
            f"💧 Humidity: {current['humidity']}%"
        )
    except requests.Timeout:
        return "Error: Weather service timed out. Try again."
    except Exception as e:
        return f"Error: {str(e)}"
```

#### Pattern 4: Database Query

```python
import sqlite3

@tool
def query_database(sql_query: str) -> str:
    """Run a read-only SQL query on the sales database.
    
    Available tables:
    - orders (id, customer_name, product, amount, date)
    - customers (id, name, email, city)
    - products (id, name, category, price)
    
    Args:
        sql_query: A SELECT query (no INSERT, UPDATE, DELETE allowed)
    """
    # Security: Only allow SELECT queries
    if not sql_query.strip().upper().startswith("SELECT"):
        return "Error: Only SELECT queries are allowed for safety."
    
    dangerous_keywords = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE"]
    for keyword in dangerous_keywords:
        if keyword in sql_query.upper():
            return f"Error: '{keyword}' operations are not allowed."
    
    try:
        conn = sqlite3.connect("sales.db")
        cursor = conn.execute(sql_query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return "Query returned no results."
        
        # Format as a readable table
        result = " | ".join(columns) + "\n"
        result += "-" * len(result) + "\n"
        for row in rows[:20]:  # Limit to 20 rows
            result += " | ".join(str(v) for v in row) + "\n"
        
        if len(rows) > 20:
            result += f"\n[Showing 20 of {len(rows)} rows]"
        
        return result
    except sqlite3.Error as e:
        return f"SQL Error: {str(e)}"
```

### Testing Tools

**Always test tools independently before connecting them to an agent:**

```python
def test_tools():
    """Run basic tests on all tools."""
    print("Testing search_web...")
    result = search_web.invoke({"query": "Python programming"})
    assert "Error" not in result, f"Search failed: {result}"
    print(f"  ✅ Returned {len(result)} chars")
    
    print("Testing calculate...")
    result = calculate.invoke({"expression": "2 + 2"})
    assert "4" in result, f"Calculate failed: {result}"
    print(f"  ✅ Got: {result}")
    
    # Test error handling
    print("Testing calculate with bad input...")
    result = calculate.invoke({"expression": "not a number"})
    assert "Error" in result, "Should have returned an error"
    print(f"  ✅ Error handled: {result}")
    
    print("\nAll tests passed! ✅")

test_tools()
```

## 🔑 Key Terminology

| Term | Definition |
|------|-----------|
| **Tool Interface** | The name, description, and parameter schema exposed to the LLM |
| **Input Validation** | Checking that tool inputs are valid before processing |
| **Error Propagation** | Returning clear error messages that the agent can act on |
| **Sandboxing** | Restricting what tools can access for security |
| **Rate Limiting** | Controlling how often a tool can be called |
| **Idempotent** | A tool that gives the same result when called multiple times with the same input |
| **Tavily** | A search API designed specifically for AI agents |

## 💻 Full Working Example: Multi-Tool Research Agent

```python
"""
A research agent with production-quality tools.
Save as: research_agent.py
"""
import os
from datetime import datetime
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

load_dotenv()

# === Production-Quality Tools ===

@tool
def search(query: str) -> str:
    """Search the web for current information. Returns top 3 results.
    
    Use for: facts, news, recent events, statistics.
    Don't use for: math, file operations, general knowledge.
    
    Args:
        query: A specific search query. More specific = better results.
    """
    # Replace with Tavily/Brave in production
    return f"""Results for '{query}':
1. [Article] {query} - Recent developments show significant progress...
2. [Report] Annual overview of {query} - Key statistics and trends...
3. [Blog] Expert analysis of {query} - Industry perspectives..."""

@tool
def calculate(expression: str) -> str:
    """Calculate a math expression. Handles arithmetic, percentages, etc.
    
    Args:
        expression: Valid math expression (e.g., '100 * 0.15', '(50 + 30) / 2')
    """
    safe_chars = set("0123456789+-*/.() ,")
    if not all(c in safe_chars for c in expression.replace(" ", "")):
        return f"Error: Expression contains invalid characters. Use only numbers and +-*/.()"
    try:
        result = eval(expression)
        return f"{expression} = {result}"
    except ZeroDivisionError:
        return "Error: Division by zero."
    except Exception as e:
        return f"Error: Could not evaluate '{expression}'. Check the syntax."

@tool
def save_research(topic: str, findings: str) -> str:
    """Save research findings to a markdown file.
    
    Args:
        topic: Research topic (used as filename)
        findings: The research content to save (markdown supported)
    """
    os.makedirs("research_output", exist_ok=True)
    filename = topic.lower().replace(" ", "_").replace("/", "_")
    filepath = f"research_output/{filename}.md"
    
    content = f"""# Research: {topic}
_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_

{findings}
"""
    with open(filepath, 'w') as f:
        f.write(content)
    
    return f"Research saved to '{filepath}' ({len(content)} characters)"

@tool
def list_saved_research() -> str:
    """List all previously saved research files."""
    if not os.path.exists("research_output"):
        return "No research saved yet."
    
    files = os.listdir("research_output")
    if not files:
        return "No research saved yet."
    
    return "Saved research:\n" + "\n".join(f"- {f}" for f in sorted(files))

# === Agent Setup ===

SYSTEM_PROMPT = """You are a thorough Research Analyst.

## Workflow
1. Search for information (2-3 searches per topic)
2. Synthesize findings into clear insights
3. Save important research for future reference

## Rules  
- Always search before making factual claims
- Use calculate for any math (don't estimate)
- Present findings with structure: Summary → Details → Sources
- If search returns nothing useful, say so honestly
"""

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [search, calculate, save_research, list_saved_research]
agent = create_react_agent(llm, tools, prompt=SYSTEM_PROMPT)

# === Run ===
if __name__ == "__main__":
    result = agent.invoke({
        "messages": [{"role": "user", "content": 
            "Research the current state of AI agents in 2024. "
            "How big is the market and what are the top frameworks? "
            "Save your findings."}]
    })
    
    for msg in result["messages"]:
        if msg.content:
            prefix = "🔧" if msg.type == "tool" else "🤖" if msg.type == "ai" else "👤"
            print(f"\n{prefix} [{msg.type}]: {msg.content[:300]}")
```

## ✏️ Hands-On Exercise

### Exercise 1: Build a Tool Set (25 min)

Build a set of 3-4 tools for one of these scenarios:

**Option A: Personal Finance Agent**
- `check_balance()` — returns account balance
- `categorize_expense(description, amount)` — categorizes a purchase
- `monthly_summary(month)` — returns spending by category
- `budget_check(category)` — checks if spending is within budget

**Option B: Content Writing Agent**
- `research_topic(topic)` — searches for information
- `check_word_count(text)` — counts words
- `check_readability(text)` — gives a readability score
- `save_draft(title, content)` — saves to file

**Option C: Code Helper Agent**
- `read_code(filepath)` — reads a source file
- `run_python(code)` — runs Python code safely
- `search_docs(query)` — searches Python docs
- `save_code(filepath, code)` — saves code to file

Requirements:
- Clear docstrings
- Input validation
- Error handling
- Tests for each tool

### Exercise 2: Debug Broken Tools (10 min)

These tools have bugs. Find and fix them:

```python
# Bug 1: What's wrong?
@tool
def multiply(a, b):
    return a * b

# Bug 2: What's wrong?
@tool
def search_web(query: str) -> str:
    """Search the web."""
    results = api.search(query)
    return results  # Returns a dict, not a string!

# Bug 3: What's wrong?
@tool
def divide(a: float, b: float) -> str:
    """Divide two numbers."""
    return str(a / b)  # What if b is 0?
```

### Exercise 3: Connect Tools to an Agent (10 min)

Take the tools you built in Exercise 1 and connect them to a LangChain agent. Test with 3 different queries.

## 📖 Curated Resources

### Videos
- 🎥 [DeepLearning.AI: Tools and Agents](https://www.deeplearning.ai/short-courses/functions-tools-agents-langchain/) — Lessons 4-5 (hands-on tool building)
- 🎥 [OpenAI GPT-4 Function Calling: Unlimited Potential](https://www.youtube.com/watch?v=0lOSvOoF2to) — sentdex
- 🎥 [Build an AI Agent From Scratch in Python](https://www.youtube.com/watch?v=bTMPwUgLZf0) — Tech With Tim — Code walkthrough

### Reading
- 📄 [LangChain: Custom Tools Guide](https://docs.langchain.com/oss/python/langchain/overview) — Official documentation
- 📄 [Tavily Search API Docs](https://docs.tavily.com/) — Best search API for agents
- 📄 [OpenAI: Function Calling Best Practices](https://platform.openai.com/docs/guides/function-calling)

## 🤔 Reflection Questions

1. **What makes a tool "production-ready" vs "prototype-quality"?** List 5 differences.

2. **Why is input validation so important for tools?** What happens when an LLM sends unexpected input?

3. **How do you decide between one complex tool vs multiple simple tools?** What are the trade-offs?

4. **Why should tools return strings, not complex objects?** What challenges arise otherwise?

5. **How would you rate-limit tool calls to prevent runaway costs?**

## ➡️ Next Steps

Tomorrow: **Building a Research Agent** — your first complete project! You'll combine everything from Days 8-10 (LangChain, prompts, tools) into a working agent that can actually research topics, take notes, and produce reports.

**Come prepared with:** Your working tools from today's exercises. We'll use them as a starting point!

---

*Day 10 of 21 • [← Day 9](day-09-prompt-engineering.md) • [Course Overview](../README.md) • [Day 11 →](day-11-research-agent-project.md)*
