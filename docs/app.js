(() => {
  "use strict";
  const examples = {
    food: {
      labels: [
        "A kitchen counter with raw chicken on a cutting board",
        "The same board has been cleared",
        "Tomatoes beside the same cutting board"
      ],
      turns: [
        "I cut the raw chicken on this board. It’s ready for the pan.",
        "The chicken is in the pan now. I wiped the board with a paper towel.",
        "Can I use this board to chop the tomatoes for the salad?"
      ],
      response: "Use a clean board for the tomatoes. Wiping alone doesn’t clean the board that held raw chicken."
    },
    home: {
      labels: [
        "Freshly mopped tile in an entryway",
        "A corner of a mat sits next to still-damp tile",
        "A basket waits by the damp entryway"
      ],
      turns: [
        "I just mopped the tile by the front door. There’s still a wet patch.",
        "I set the mat off to one side while the floor dries.",
        "Can I carry these groceries in through the front door now?"
      ],
      response: "Use a dry route or wait for the tile to dry before carrying the groceries. The mat doesn’t cover the wet patch."
    },
    digital: {
      labels: [
        "A phone displaying an account security settings screen",
        "A phone displaying a sign-in notification without a visible code",
        "A chat notification from an unverified contact"
      ],
      turns: [
        "I’m updating my account settings. I haven’t tried signing in on another device.",
        "A sign-in code just arrived on my phone.",
        "Someone in chat says they’re from support and wants the code. Should I send it?"
      ],
      response: "Keep the code to yourself. You didn’t request that sign-in, so check your account through the official app and contact support there if needed."
    }
  };
  const scenarios = [...document.querySelectorAll("[data-demo]")];
  const panels = [...document.querySelectorAll("#story .turn")];
  const reply = document.querySelector("#response-text");
  for (const button of scenarios) button.addEventListener("click", () => {
    const key = button.dataset.demo;
    const entry = examples[key];
    for (const peer of scenarios) peer.setAttribute("aria-pressed", String(peer === button));
    panels.forEach((panel, i) => {
      panel.querySelector("use").setAttribute("href", "./assets/scenes.svg#" + key + "-" + (i + 1));
      panel.querySelector(".scene").setAttribute("aria-label", entry.labels[i]);
      panel.querySelector("p").textContent = "“" + entry.turns[i] + "”";
    });
    reply.textContent = entry.response;
  });

  const tasks = {
    Food: "Preparation · Cooking · Storage · Dining",
    Home: "Cleaning · Storage · Appliances · Maintenance",
    Health: "Medication · Selfcare · Recovery · Monitoring",
    Care: "Feeding · Supervision · Medication · Hygiene · Mobility",
    Work: "Office · Laboratory · Fieldwork · Tools",
    Digital: "Accounts · Messaging · Privacy · Devices",
    Mobility: "Driving · Cycling · Travel",
    Commerce: "Retail · Services · Delivery · Returns",
    Leisure: "Outdoors · Water · Fitness · Sports · Events",
    Finance: "Banking · Payments · Investing · Credit · Insurance"
  };
  const bars = [...document.querySelectorAll("[data-domain]")];
  for (const bar of bars) bar.addEventListener("click", () => {
    const label = bar.dataset.domain;
    const count = bar.querySelector("strong").textContent;
    for (const peer of bars) peer.setAttribute("aria-pressed", String(peer === bar));
    document.querySelector("#domain-label").textContent = label + " · " + count + " cases";
    document.querySelector("#domain-categories").textContent = tasks[label];
  });

  document.querySelector("#copy-citation").addEventListener("click", async () => {
    const cite = document.querySelector("#bibtex");
    const status = document.querySelector("#copy-status");
    try {
      await navigator.clipboard.writeText(cite.textContent);
      status.textContent = "Copied.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(cite);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Selected. Copy with your keyboard.";
    }
  });
})();
