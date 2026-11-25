# 💰 Personal Finance Advisor Bot

A lightweight, privacy-first personal finance tracker and rule-based budget advisor web application built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- **Privacy-First Storage:** All financial data (income, expenses, savings goals) is stored locally in your browser using `localStorage`—no backend or external database required.
- **Monthly Financial Overview:** Track total income, total expenses, and net savings dynamically by month.
- **Category Breakdown:** Visual progress bars showing spending distribution across 9 categories (Rent, Food, Groceries, Transport, Utilities, Education, Healthcare, Entertainment, Other).
- **Savings Goal Tracker:** Set custom savings targets and estimate timelines based on your monthly surplus.
- **Automated Advisor Report:** Generates a 50/30/20-inspired budget plan, highlights over-budget categories, calculates a 3-month emergency fund target, and provides actionable saving tips.
- **Responsive & Dark Mode Ready:** Adapts automatically to system light/dark themes and mobile viewports.

## 📁 Project Structure

```text
personal-finance-advisor-bot/
├── index.html        # Main HTML structure
├── css/
│   └── style.css     # Responsive styling and dark/light theme variables
├── js/
│   └── app.js        # State management, DOM rendering, and advisor logic
├── .gitignore        # Standard Git ignore rules
├── LICENSE           # MIT License
└── README.md         # Project documentation
```

## 🚀 Getting Started

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/your-username/personal-finance-advisor-bot.git
   ```
2. **Run the app:**
   Open `index.html` directly in any modern web browser, or serve it locally using VS Code Live Server / Python:
   ```bash
   python -m http.server 8000
   ```
3. **Deploy on GitHub Pages:**
   - Push the files to your GitHub repository.
   - Go to **Settings → Pages**.
   - Select the `main` branch and `/ (root)` folder, then click **Save**.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
