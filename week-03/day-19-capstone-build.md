# Day 19: Capstone — Build & Integrate

> *"The devil is in the details."*

## 🎯 Learning Objectives

By the end of today, you will be able to:

- Add error handling to multi-agent pipelines
- Implement cost tracking across agents
- Add a revision feedback loop that actually improves output
- Build a progress display that shows what each agent is doing
- Test the complete pipeline end to end

## 📚 Today's Focus: Making It Robust

Yesterday you built the skeleton. Today we add the muscle: error handling, cost tracking, progress feedback, and quality improvements.

### Enhancement 1: Error Handling

Each agent can fail. Let's handle it gracefully.

```python
# utils/error_handling.py

class PipelineError(Exception):
    """Custom error for pipeline failures."""
    def __init__(self, agent: str, message: str, recoverable: bool = True):
        self.agent = agent
        self.message = message
        self.recoverable = recoverable
        super().__init__(f"[{agent}] {message}")

def safe_node(agent_name: str, node_fn):
    """Wrap a node function with error handling."""
    def wrapper(state):
        try:
            result = node_fn(state)
            if not result:
                raise PipelineError(agent_name, "Returned empty result")
            return result
        except PipelineError:
            raise  # Re-raise pipeline errors
        except Exception as e:
            print(f"❌ {agent_name} failed: {e}")
            # Return fallback state instead of crashing
            return {
                "feedback": f"Error in {agent_name}: {str(e)}. Please try again.",
                "approved": False
            }
    return wrapper

# Usage in pipeline.py:
# workflow.add_node("research", safe_node("Researcher", research_node))
# workflow.add_node("write", safe_node("Writer", writer_node))
# workflow.add_node("edit", safe_node("Editor", editor_node))
```

### Enhancement 2: Cost Tracking

Track costs across all agents:

```python
# utils/costs.py
import time

class PipelineCostTracker:
    """Track costs across the entire pipeline."""
    
    COST_PER_1K_TOKENS = {
        "gpt-4o-mini": {"input": 0.000150, "output": 0.000600},
        "gpt-4o": {"input": 0.002500, "output": 0.010000},
    }
    
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.calls_by_agent = {}
        self.start_time = time.time()
    
    def log(self, agent: str, input_tokens: int, output_tokens: int, 
            model: str = "gpt-4o-mini"):
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        
        if agent not in self.calls_by_agent:
            self.calls_by_agent[agent] = {"calls": 0, "tokens": 0}
        self.calls_by_agent[agent]["calls"] += 1
        self.calls_by_agent[agent]["tokens"] += input_tokens + output_tokens
    
    def total_cost(self, model: str = "gpt-4o-mini") -> float:
        rates = self.COST_PER_1K_TOKENS.get(model, {"input": 0.001, "output": 0.002})
        return (
            self.total_input_tokens * rates["input"] / 1000 +
            self.total_output_tokens * rates["output"] / 1000
        )
    
    def report(self) -> str:
        elapsed = time.time() - self.start_time
        return f"""
📊 Pipeline Cost Report
{'─' * 40}
⏱️  Duration: {elapsed:.1f}s
💬  Total tokens: {self.total_input_tokens + self.total_output_tokens:,}
💰  Estimated cost: ${self.total_cost():.4f}

Agent breakdown:
{chr(10).join(f'  {agent}: {data["calls"]} calls, {data["tokens"]:,} tokens' 
              for agent, data in self.calls_by_agent.items())}
"""
```

### Enhancement 3: Progress Display

Show users what's happening in real time:

```python
# utils/progress.py
import sys
from datetime import datetime

class PipelineProgress:
    """Real-time progress display for the pipeline."""
    
    STAGES = [
        ("🔍", "Research", "Gathering facts and sources"),
        ("✍️", "Write", "Creating the first draft"),
        ("📋", "Edit", "Reviewing for quality"),
        ("✅", "Finalize", "Preparing final output"),
    ]
    
    def __init__(self):
        self.current_stage = 0
        self.start_time = datetime.now()
    
    def enter_stage(self, stage_name: str, detail: str = ""):
        """Mark entering a new stage."""
        for i, (emoji, name, desc) in enumerate(self.STAGES):
            if name.lower() == stage_name.lower():
                self.current_stage = i
                elapsed = (datetime.now() - self.start_time).total_seconds()
                print(f"\n{emoji} Stage {i+1}/{len(self.STAGES)}: {name}")
                print(f"   {desc}")
                if detail:
                    print(f"   → {detail}")
                print(f"   ⏱️  {elapsed:.0f}s elapsed")
                return
    
    def update(self, message: str):
        """Show a progress update within the current stage."""
        print(f"   📎 {message}")
    
    def complete(self):
        """Mark pipeline as complete."""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        print(f"\n🏁 Pipeline complete in {elapsed:.1f}s")
```

### Enhancement 4: Better Writer-Editor Loop

Make the revision loop actually useful:

```python
# Improved editor that gives structured feedback
IMPROVED_EDITOR_PROMPT = """You are a Senior Editor reviewing content.

Rate the article on these criteria (1-10 each):
1. Accuracy — facts correct and sourced?
2. Clarity — easy to understand?
3. Structure — logical flow?
4. Engagement — interesting to read?

## Your Review Format

### Scores
Accuracy: X/10
Clarity: X/10
Structure: X/10
Engagement: X/10
Overall: X/10

### What Works Well
- [Specific praise]

### Required Changes (if any)
- [Specific, actionable change 1]
- [Specific, actionable change 2]
(Maximum 3 changes per review)

### Verdict
APPROVED — if overall >= 7
NEEDS REVISION — if overall < 7, with specific changes listed above

IMPORTANT: Be specific. Don't say "improve the flow." Say "Move paragraph 3 before paragraph 2 because..."
"""
```

### Enhancement 5: CLI with Options

```python
# main.py (improved)
import argparse
from pipeline import build_pipeline
from utils.costs import PipelineCostTracker
from utils.progress import PipelineProgress

def main():
    parser = argparse.ArgumentParser(description="Multi-Agent Content Pipeline")
    parser.add_argument("topic", nargs="?", help="Article topic")
    parser.add_argument("--requirements", "-r", default="", help="Special requirements")
    parser.add_argument("--max-revisions", type=int, default=2, help="Max revision rounds")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")
    parser.add_argument("--no-save", action="store_true", help="Don't save to file")
    
    args = parser.parse_args()
    
    if not args.topic:
        args.topic = input("📝 Topic: ").strip()
    
    print(f"\n🚀 Multi-Agent Content Pipeline")
    print(f"   Topic: {args.topic}")
    print(f"   Max revisions: {args.max_revisions}")
    print()
    
    # Build and run
    pipeline = build_pipeline()
    progress = PipelineProgress()
    
    result = pipeline.invoke({
        "topic": args.topic,
        "requirements": args.requirements,
        "research": "",
        "sources": [],
        "draft": "",
        "feedback": "",
        "approved": False,
        "revision_count": 0,
        "final_article": "",
        "metadata": {}
    })
    
    # Output
    print("\n" + "=" * 50)
    meta = result.get("metadata", {})
    print(f"📊 {meta.get('word_count', '?')} words | {meta.get('sources', '?')} sources | {meta.get('revisions', '?')} revisions")
    
    if not args.no_save:
        import os
        filename = args.topic.lower().replace(" ", "-")[:40]
        filepath = f"output/{filename}.md"
        os.makedirs("output", exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(result["final_article"])
        print(f"💾 Saved: {filepath}")
    
    print(f"\n{'─' * 50}\n")
    print(result["final_article"])

if __name__ == "__main__":
    main()
```

## ✏️ Hands-On Exercise

### Exercise 1: Add Error Handling (15 min)

Wrap each agent node with the `safe_node` function. Then test:
- What happens if you delete your API key and run the pipeline?
- What if you pass an empty topic?
- Does the pipeline crash or handle it gracefully?

### Exercise 2: Add Cost Tracking (15 min)

Integrate the PipelineCostTracker. After each run, print:
- Total cost
- Cost per agent
- Total tokens used
- Time elapsed

### Exercise 3: Test the Full Loop (20 min)

Run the pipeline with 3 different topics. For each, note:
1. How many revisions were needed?
2. Was the editor's feedback specific and useful?
3. Did the writer actually address the feedback?
4. What's the total cost?
5. Rate the final output quality (1-10)

### Exercise 4: Add a Feature (10 min)

Choose one enhancement:
- **Output formats:** Add an option to output as JSON, plain text, or markdown
- **Word count target:** Let the user specify desired word count
- **Tone control:** Add a `--tone` flag (professional, casual, academic)
- **Summary mode:** Add a `--summary` flag for shorter articles

## 📖 Curated Resources

- 📄 [LangGraph: Error Handling](https://docs.langchain.com/oss/python/langgraph/overview) — State management patterns
- 📄 [Python argparse Tutorial](https://docs.python.org/3/library/argparse.html) — CLI argument parsing
- 📄 [Rich Library](https://rich.readthedocs.io/) — Beautiful terminal output (optional enhancement)

## 🤔 Reflection Questions

1. **What's the most common failure mode in your pipeline?** How would you address it?
2. **Is the editor-writer loop actually improving quality?** How would you measure this?
3. **What would you change about the agent prompts?** Based on actual output quality.
4. **How would you add parallelism?** Could the researcher and writer work simultaneously?

## ➡️ Next Steps

Tomorrow: **Polish & Deploy** — final touches, documentation, and making your pipeline presentable.

---

*Day 19 of 21 • [← Day 18](day-18-capstone-start.md) • [Course Overview](../README.md) • [Day 20 →](day-20-capstone-polish.md)*
