# Contributing to AI Digital Wealth Management MVP

Thank you for taking the time to contribute! We welcome code contributions, bug reports, feature requests, and documentation improvements to help make this project better for everyone.

By participating in this project, you agree to abide by our community standards and code of conduct.

---

## 🛠️ Git Branch Naming Conventions

To keep our repository organized and streamline our CI/CD workflows, we strictly enforce a standardized branch naming convention. 

All branches must follow this prefix structure: `<type>/<short-description>`

### Standard Prefixes

* **`feature/`**: Use for new features or enhancements.
  * *Example:* `feature/add-user-login`
* **`bugfix/`**: Use for fixing bugs or unexpected behavior.
  * *Example:* `bugfix/resolve-token-expiration`
* **`hotfix/`**: Use **only** for urgent, critical patches deployed directly to production.
  * *Example:* `hotfix/patch-security-vulnerability`
* **`docs/`**: Use for changes strictly related to documentation, readmes, or comments.
  * *Example:* `docs/update-api-endpoints`
* **`refactor/`**: Use for rewriting code without changing its external behavior.
  * *Example:* `refactor/optimize-database-queries`

### Branch Guidelines
* Use **lowercase** letters only.
* Use **hyphens (`-`)** to separate words; do not use spaces or underscores.
* Keep descriptions short, punchy, and clear (under 4-5 words).

---

## 🚀 The Development Workflow

Because the `master` branch is locked, all contributors must follow this specific pull request process to introduce changes:

### 1. Fork and Clone
1. Fork this repository to your personal GitHub profile.
2. Clone your personal fork to your local machine:
   ```bash
   git clone https://github.com[your-username]/[repo-name].git
   ```

### 2. Create a Branch
Switch to the `master` branch, pull the latest changes, and create your new working branch using the naming conventions above:
```bash
git checkout master
git pull origin master
git checkout -b feature/your-feature-name
```

### 3. Commit Your Changes
Write clear, descriptive commit messages. Focus on *what* changed and *why*:
```bash
git commit -m "feat: implement token-based authentication for user login"
```

### 4. Open a Pull Request (PR)
1. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Navigate back to our main repository on GitHub.
3. Click **Compare & pull request**.
4. Fill out the Pull Request template completely, linking any relevant issue numbers.

---

## 🔍 Code Review & Merging

* **Automated Tests**: Your PR will automatically trigger automated tests. These must pass before a review can begin.
* **Code Review**: At least one maintainer or administrator must approve your code before it can be merged.
* **No Direct Pushes**: Direct pushes to `master` are blocked by repository rulesets for all users, including project maintainers.
