# Day 18: Capstone — Multi-Agent Content Pipeline (Start)

> *"Everything you've learned leads to this."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Design a multi-agent system architecture for content creation
- Set up the project structure with proper separation of concerns
- Define agent roles, tools, and communication patterns
- Build the supervisor/coordinator that orchestrates the pipeline

## 📚 Project Overview

### What We're Building

A **multi-agent content creation pipeline** with four specialized agents:

```
User: "Write a blog post about AI agents in healthcare"
                        │
                        ▼
              ┌─────────────────┐
              │   COORDINATOR    │ ← Orchestrates the whole flow
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   ┌───────────┐ ┌──────────┐ ┌──────────┐
   │ RESEARCHER│ │  WRITER  │ │  EDITOR  │
   │           │ │          │ │          │
   │ Searches  │ │ Creates  │ │ Reviews  │
   │ the web,  │ │ content  │ │ quality, │
   │ gathers   │ │ from     │ │ suggests │
   │ facts     │ │ research │ │ fixes    │
   └───────────┘ └──────────┘ └──────────┘
```

**The workflow:**
1. **Coordinator** receives a topic and creates a plan
2. **Researcher** searches the web and gathers facts
3. **Writer** creates a draft article from the research
4. **Editor** reviews, suggests improvements, approves or sends back
5. Repeat writer→editor until approved (max 2 revisions)
6. **Coordinator** delivers the final output

### Project Structure

```
content-pipeline/
├── main.py              ← Entry point
├── pipeline.py          ← LangGraph workflow definition
├── agents/
│   ├── __init__.py
│   ├── researcher.py    ← Research agent
│   ├── writer.py        ← Writing agent
│   └── editor.py        ← Editing agent
├── tools/
│   ├── __init__.py
│   ├── search.py        ← Web search
│   ├── reader.py        ← Webpage reader
│   └── file_ops.py      ← Save/load files
├── prompts/
│   ├── researcher.py    ← Research agent prompt
│   ├── writer.py        ← Writer agent prompt
│   └── editor.py        ← Editor agent prompt
├── output/              ← Generated content
├── .env
└── requirements.txt
```

### Step-by-Step Build

#### Step 1: Setup

```bash
mkdir content-pipeline && cd content-pipeline
python -m venv venv
source venv/bin/activate

pip install langchain langchain-openai langgraph python-dotenv tavily-python requests beautifulsoup4

mkdir -p agents tools prompts output
touch agents/__init__.py tools/__init__.py
```

#### Step 2: Define the Shared State

```python
# pipeline.py
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END

class PipelineState(TypedDict):
    # Input
    topic: str
    requirements: str        # Any specific requirements
    
    # Research phase
    research: str            # Research findings
    sources: list[str]       # URLs used
    
    # Writing phase
    draft: str               # Current draft
    
    # Editing phase
    feedback: str            # Editor's feedback
    approved: bool           # Whether the draft is approved
    revision_count: int      # How many revisions so far
    
    # Output
    final_article: str       # The finished article
    metadata: dict           # Stats (word count, sources, etc.)
```

#### Step 3: Build the Research Agent

```python
# agents/researcher.py
from langchain_openai import ChatOpenAI
from tools.search import search_web
from tools.reader import read_webpage

RESEARCHER_PROMPT = """You are a Senior Research Analyst. Your job is to 
thoroughly research a topic and provide comprehensive, factual information.

## Your Process
1. Search for the topic with 2-3 targeted queries
2. Read the most promising articles
3. Extract key facts, statistics, and expert quotes
4. Organize findings by subtopic

## Output Format
Provide your research as a structured brief:

### Key Facts
- Fact 1 (Source: URL)
- Fact 2 (Source: URL)

### Statistics
- Relevant numbers and data points

### Expert Perspectives
- Quotes or viewpoints from experts

### Interesting Angles
- Unique angles the writer could explore

## Rules
- Only include verified facts from your search results
- Always cite sources
- Maximum 3 searches to control costs
- Flag when information is uncertain or conflicting
"""

def research_node(state: PipelineState) -> dict:
    """Researcher gathers information on the topic."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    topic = state["topic"]
    requirements = state.get("requirements", "")
    
    # Use the LLM with tools to research
    from langgraph.prebuilt import create_react_agent
    
    research_agent = create_react_agent(
        llm,
        [search_web, read_webpage],
        prompt=RESEARCHER_PROMPT
    )
    
    result = research_agent.invoke({
        "messages": [{
            "role": "user",
            "content": f"Research this topic: {topic}\n\nRequirements: {requirements}"
        }]
    })
    
    # Extract the final response
    research = result["messages"][-1].content
    
    # Extract URLs from the conversation
    sources = []
    for msg in result["messages"]:
        content = str(msg.content) if hasattr(msg, 'content') else ""
        if "http" in content:
            import re
            urls = re.findall(r'https?://[^\s\)]+', content)
            sources.extend(urls)
    
    print(f"📊 Research complete: {len(research)} chars, {len(set(sources))} sources")
    
    return {
        "research": research,
        "sources": list(set(sources))
    }
```

#### Step 4: Build the Writer Agent

```python
# agents/writer.py
from langchain_openai import ChatOpenAI

WRITER_PROMPT = """You are a Professional Content Writer. You write clear, 
engaging articles that make complex topics accessible.

## Your Style
- Clear, conversational tone
- Short paragraphs (3-4 sentences max)
- Use headers to organize
- Include concrete examples
- Start with a hook that grabs attention
- End with a clear takeaway

## Article Structure
1. **Hook** — Start with a surprising fact, question, or scenario
2. **Context** — Why this topic matters now
3. **Main Content** — 3-5 sections with headers
4. **Practical Takeaways** — What the reader should do
5. **Conclusion** — Tie back to the hook

## Rules
- Base all facts on the research provided
- Don't make up statistics
- Target 800-1200 words
- Use markdown formatting
"""

def writer_node(state: PipelineState) -> dict:
    """Writer creates an article from research."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)  # Slightly creative
    
    research = state["research"]
    feedback = state.get("feedback", "")
    revision_count = state.get("revision_count", 0)
    
    prompt = f"""Write an article about: {state['topic']}

## Research to use:
{research}

"""
    if feedback and revision_count > 0:
        prompt += f"""## Editor Feedback (Revision #{revision_count}):
{feedback}

Please address ALL of the editor's feedback in this revision.
"""
    
    response = llm.invoke([
        {"role": "system", "content": WRITER_PROMPT},
        {"role": "user", "content": prompt}
    ])
    
    draft = response.content
    word_count = len(draft.split())
    print(f"✍️ Draft {'revision ' + str(revision_count) if revision_count > 0 else 'complete'}: {word_count} words")
    
    return {"draft": draft}
```

#### Step 5: Build the Editor Agent

```python
# agents/editor.py
from langchain_openai import ChatOpenAI

EDITOR_PROMPT = """You are a Senior Editor. You review articles for quality,
accuracy, clarity, and engagement.

## Review Criteria
1. **Accuracy** — Are facts correct and properly cited?
2. **Clarity** — Is the writing easy to understand?
3. **Structure** — Does it flow logically?
4. **Engagement** — Will readers find it interesting?
5. **Completeness** — Are there gaps in coverage?

## Scoring (1-10)
- 8-10: Approve with minor suggestions
- 5-7: Needs revision with specific feedback
- 1-4: Major rewrite needed

## Output Format
### Score: X/10

### Strengths
- What works well

### Issues to Fix
- Specific, actionable feedback

### Verdict: APPROVED / NEEDS REVISION
"""

def editor_node(state: PipelineState) -> dict:
    """Editor reviews the draft and approves or requests revision."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    draft = state["draft"]
    research = state["research"]
    revision_count = state.get("revision_count", 0)
    
    prompt = f"""Review this article:

## Article:
{draft}

## Original Research (for fact-checking):
{research[:2000]}

## Context:
This is revision #{revision_count}. Max allowed revisions: 2.
{"If this is revision 2, be more lenient — approve unless there are critical issues." if revision_count >= 2 else ""}
"""
    
    response = llm.invoke([
        {"role": "system", "content": EDITOR_PROMPT},
        {"role": "user", "content": prompt}
    ])
    
    review = response.content
    approved = "APPROVED" in review.upper()
    
    # Force approval after max revisions
    if revision_count >= 2 and not approved:
        approved = True
        review += "\n\n[Auto-approved after maximum revisions reached]"
    
    status = "✅ APPROVED" if approved else "📝 NEEDS REVISION"
    print(f"📋 Editor: {status}")
    
    return {
        "feedback": review,
        "approved": approved,
        "revision_count": revision_count + (0 if approved else 1),
        "final_article": draft if approved else ""
    }
```

#### Step 6: Wire the Pipeline

```python
# pipeline.py (continued)
from agents.researcher import research_node
from agents.writer import writer_node
from agents.editor import editor_node

def should_revise(state: PipelineState) -> str:
    """Decide: approved or needs revision?"""
    if state.get("approved", False):
        return "finalize"
    return "revise"

def finalize_node(state: PipelineState) -> dict:
    """Prepare final output with metadata."""
    article = state["final_article"] or state["draft"]
    word_count = len(article.split())
    
    return {
        "final_article": article,
        "metadata": {
            "word_count": word_count,
            "sources": len(state.get("sources", [])),
            "revisions": state.get("revision_count", 0),
            "topic": state["topic"]
        }
    }

def build_pipeline():
    """Build and return the content pipeline graph."""
    workflow = StateGraph(PipelineState)
    
    # Add nodes
    workflow.add_node("research", research_node)
    workflow.add_node("write", writer_node)
    workflow.add_node("edit", editor_node)
    workflow.add_node("finalize", finalize_node)
    
    # Define flow
    workflow.set_entry_point("research")
    workflow.add_edge("research", "write")
    workflow.add_edge("write", "edit")
    workflow.add_conditional_edges("edit", should_revise, {
        "revise": "write",
        "finalize": "finalize"
    })
    workflow.add_edge("finalize", END)
    
    return workflow.compile()
```

#### Step 7: Main Entry Point

```python
# main.py
from dotenv import load_dotenv
from pipeline import build_pipeline
import os

load_dotenv()

def main():
    print("📝 Multi-Agent Content Pipeline")
    print("=" * 50)
    
    pipeline = build_pipeline()
    
    topic = input("\nTopic: ").strip()
    requirements = input("Requirements (optional): ").strip()
    
    print(f"\n🚀 Starting pipeline for: {topic}\n")
    
    result = pipeline.invoke({
        "topic": topic,
        "requirements": requirements or "Write an informative, engaging article.",
        "research": "",
        "sources": [],
        "draft": "",
        "feedback": "",
        "approved": False,
        "revision_count": 0,
        "final_article": "",
        "metadata": {}
    })
    
    # Display results
    print("\n" + "=" * 50)
    print("✅ PIPELINE COMPLETE")
    print("=" * 50)
    
    meta = result.get("metadata", {})
    print(f"📊 Words: {meta.get('word_count', '?')}")
    print(f"📚 Sources: {meta.get('sources', '?')}")
    print(f"🔄 Revisions: {meta.get('revisions', '?')}")
    
    # Save output
    filename = topic.lower().replace(" ", "-")[:40]
    filepath = f"output/{filename}.md"
    os.makedirs("output", exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(result["final_article"])
    print(f"💾 Saved to: {filepath}")
    
    # Show article
    print(f"\n{'─' * 50}")
    print(result["final_article"])

if __name__ == "__main__":
    main()
```

## ✏️ Hands-On Exercise

### Exercise 1: Build the Pipeline (40 min)

Follow the steps above to create the complete project. Checklist:
- [ ] Project structure created
- [ ] All agent modules implemented
- [ ] Pipeline wired with LangGraph
- [ ] Main entry point working
- [ ] First test run complete

### Exercise 2: Test Run (15 min)

Run the pipeline with these topics and compare output:
1. "The future of remote work in 2025"
2. "How AI agents are changing customer service"
3. "A beginner's guide to investing in index funds"

Note: How many revisions did the editor request? Was the feedback helpful?

## 📖 Curated Resources

- 📄 [LangGraph: Multi-Agent Tutorial](https://docs.langchain.com/oss/python/langchain/multi-agent)
- 📄 [CrewAI: Content Pipeline Example](https://docs.crewai.com/examples)

## ➡️ Next Steps

Tomorrow: We'll enhance the pipeline with better communication, error handling, and parallel processing.

---

*Day 18 of 21 • [← Day 17](day-17-production-patterns.md) • [Course Overview](../README.md) • [Day 19 →](day-19-capstone-build.md)*
