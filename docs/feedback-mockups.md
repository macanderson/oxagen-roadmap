# Feedback on the mockups

| | |
|---|---|
| **Status** | Items 1, 2, 5, 6 and 8 are in the master; 4 is in (the run name and summary, the file-diff card); 3 and 7 wait on a design decision (`implementation-plan.md` §2 W2) |
| **Date** | 2026-09-12 |
| **Owner** | Mac Anderson |

1. globally wherever the approval card is shown on the right column make sure it
   renders first and when it is empty make sure it does not consume alot of vspace.

2. on the signup pages - we need to fix a bug where the content floats off to the right when you select between claude code, codex, and custom agent when you are onboarding.

3. globally the navigation is jacked on mobile views. we need one thumb only navigation system that is unique and innovative and stays out of the way when not needed.

4. on the agent run page we should use the classifier fast cheap agent to give the runs a name and summary automatically using llms its cheap and makes runs way easier to find. i also think we should show file mutations by understanding what a file tool is when we give access to it and noting it in the tools i/o add this to the product spec show this in the mockup it should render a git diff just like stella files tab but in a component card on the right column underneath approvals wich should show first.

5. cost basis should be re-imagined. perhaps we show cost basis in a dialog on click if they want to see it and anchor it next to a much larger total currency dollar and cent value when usd and the cost of a run should be large font in a special and different place that is logical and close to the run name.

6. The prompt for the run also needs to be treated in a way that is special and inspectable but also not necessarily fully visible on the page load.

7. The way the frames look today is kind of bland and boring it is hard to tell the story of a run. Runs result in prs, and file changes, and new media assets etc... and we will know what was generated and where it was saved we should re-think how this presents in the run ui.

8. the fleet screen - we need a way of tracking operators also. We need spend summed by user and by agent and by agent run which is an agent and a user and a prompt.
