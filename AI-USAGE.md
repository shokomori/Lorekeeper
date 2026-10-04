# AI Usage

This project was developed with AI assistance throughout the development process. I used **ChatGPT, Claude, and GitHub Copilot** as development tools for planning, debugging, implementation assistance, UI refinement, and code review.

AI was not used as a replacement for my own development decisions. I defined the application's requirements, decided which features to implement, tested the generated solutions, modified code when necessary, and made the final decisions about the application's functionality and design.

## 1. How I Used AI

### 2026-09-21 — Initial Lorekeeper Development

- **Tool:** ChatGPT + Claude
- **What I asked for:**  
  I used AI to help break down the requirements for Lorekeeper into the frontend, backend, database, authentication, and campaign-management components. I also used it to discuss possible project structures and implementation approaches.
- **What it gave back:**  
  AI provided implementation suggestions, architectural ideas, database approaches, API patterns, and explanations of how the different parts of the application could communicate.
- **What I kept, what I changed, and why:**  
  I used these suggestions as a starting point rather than copying them directly. I made the final decisions about the application's architecture, feature priorities, user flow, and overall structure. I modified suggestions whenever they did not fit Lorekeeper's requirements.
- **Commit:** [Build Lorekeeper campaign manager — `1fd5f46`](https://github.com/shokomori/Lorekeeper/commit/1fd5f46)

---

### 2026-09-23 — Campaign Navigation and Application Structure

- **Tool:** ChatGPT + Claude + GitHub Copilot
- **What I asked for:**  
  I used AI to help refine the application's campaign navigation and the way users move between different campaign-management sections.
- **What it gave back:**  
  AI suggested component organization, navigation patterns, state-handling approaches, and implementation ideas.
- **What I kept, what I changed, and why:**  
  I kept the approaches that made the campaign workflow easier to understand and modified the rest based on how I wanted Lorekeeper to function. I tested the navigation through the actual application instead of assuming the generated implementation was correct.
- **Commit:** [Polish Lorekeeper app and campaign navigation — `ee684f6`](https://github.com/shokomori/Lorekeeper/commit/ee684f6)

---

### 2026-09-25 — Authentication and UI Refinement

- **Tool:** ChatGPT + Claude
- **What I asked for:**  
  I used AI to troubleshoot authentication behavior and refine the visual interface, particularly the application's dark-fantasy/glass UI direction.
- **What it gave back:**  
  AI helped identify possible authentication problems and provided suggestions for improving the application's UI, spacing, cards, transparency, and visual hierarchy.
- **What I kept, what I changed, and why:**  
  I tested the authentication flow myself and kept only the changes that worked with the actual backend. For the UI, I treated AI suggestions as design iterations and adjusted them to match the visual identity I wanted for Lorekeeper.
- **Commit:** [Refine authentication and glass UI themes — `b67063c`](https://github.com/shokomori/Lorekeeper/commit/b67063c)

---

### 2026-09-28 — Responsive Design and Branding

- **Tool:** ChatGPT + Claude + GitHub Copilot
- **What I asked for:**  
  I used AI to help improve Lorekeeper's responsive behavior, mobile layout, logo placement, and wallpaper system.
- **What it gave back:**  
  AI suggested responsive CSS patterns, viewport-specific layouts, image handling, and ways to organize the application's visual assets.
- **What I kept, what I changed, and why:**  
  I tested the suggestions at different viewport sizes and changed the implementation when the result felt like a compressed desktop layout instead of a properly designed mobile experience. I also decided how the horizontal and vertical Lorekeeper logos should be used depending on the viewport.
- **Commit:** [Integrate responsive logos and wallpaper rotation — `fed43d3`](https://github.com/shokomori/Lorekeeper/commit/fed43d3)

---

### 2026-09-29 — Settings and Navigation Debugging

- **Tool:** Claude + ChatGPT
- **What I asked for:**  
  I used AI to help debug application settings and navigation behavior and identify why certain parts of the application were not behaving consistently.
- **What it gave back:**  
  AI helped trace possible causes and suggested changes to the application configuration and navigation logic.
- **What I kept, what I changed, and why:**  
  I tested the suggested changes in the browser and kept the ones that fixed the actual behavior. I also simplified parts of the navigation when I realized that certain controls were redundant, particularly on mobile.
- **Commit:** [Fix app configuration, settings, and navigation — `96a91cd`](https://github.com/shokomori/Lorekeeper/commit/96a91cd)

---

### 2026-10-02 — Deployment and Final UI Debugging

- **Tool:** ChatGPT + Claude + GitHub Copilot
- **What I asked for:**  
  I used AI to help troubleshoot issues that appeared after deploying Lorekeeper, particularly asset and logo paths when running the application through GitHub Pages.
- **What it gave back:**  
  AI helped identify how the deployment base path affected references to static assets.
- **What I kept, what I changed, and why:**  
  I verified the problem through the deployed application and changed the asset references so the logos loaded correctly from the GitHub Pages deployment path.
- **Commit:** [Fix logo URLs for GitHub Pages base path — `fd5395f`](https://github.com/shokomori/Lorekeeper/commit/fd5395f)

---

## 2. Where the AI Got It Wrong

### Case 1 — Responsive Design

- **What it gave me:**  
  AI initially suggested responsive changes that technically allowed the interface to fit smaller screens.
- **What was wrong with it:**  
  The result sometimes felt like a compressed desktop interface rather than an interface designed specifically for mobile.
- **What I did instead:**  
  I redesigned portions of the mobile navigation and layout, including simplifying the bottom navigation and moving profile access to the mobile header. I then tested the application at multiple viewport sizes.
- **Commit:** [Integrate responsive logos and wallpaper rotation — `fed43d3`](https://github.com/shokomori/Lorekeeper/commit/fed43d3)

---

### Case 2 — Authentication/API Debugging

- **What it gave me:**  
  AI suggested several possible fixes when the application was producing generic `"Failed to fetch"` errors.
- **What was wrong with it:**  
  Some suggestions addressed the frontend symptoms without addressing the actual communication problem between the frontend and backend.
- **What I did instead:**  
  I traced the request through the application, tested the backend behavior, and changed the implementation based on what was actually happening rather than blindly applying the first suggested fix.
- **Commit:** [Refine authentication and glass UI themes — `b67063c`](https://github.com/shokomori/Lorekeeper/commit/b67063c)

---

### Case 3 — UI Design

- **What it gave me:**  
  AI generated several visually polished interface suggestions.
- **What was wrong with it:**  
  Some looked good individually but did not fit the overall Lorekeeper design language or created inconsistencies between different pages.
- **What I did instead:**  
  I established a consistent visual direction based on dark fantasy, modern glass-like UI elements, wallpapers, typography, spacing, and responsive behavior. I rejected or modified suggestions that did not fit that direction.
- **Commit:** [Polish Lorekeeper app and campaign navigation — `ee684f6`](https://github.com/shokomori/Lorekeeper/commit/ee684f6)

---

## 3. Who Wrote What

### Written by me

- **File:** `AppReal.jsx`
- **Commit:** [Build Lorekeeper campaign manager — `1fd5f46`](https://github.com/shokomori/Lorekeeper/commit/1fd5f46)
- **What it does and why it is built this way:**  

  I worked directly on the main application flow and user experience in `AppReal.jsx`. This includes how users navigate between the dashboard, campaigns, NPCs, locations, sessions, and account-related sections.

  I made the decisions about how these screens should interact and how the selected campaign should affect the content being displayed.

  I understand the component structure and state changes because I repeatedly modified and tested this part of the application while adding features, changing navigation, and improving the responsive experience.

---

### The AI-written part I understand best

- **File:** `server.js`
- **Commit:** [Build Lorekeeper campaign manager — `1fd5f46`](https://github.com/shokomori/Lorekeeper/commit/1fd5f46)
- **What it does and why we kept it:**  

  `server.js` is responsible for handling the backend API and connecting frontend requests to the application's backend logic.

  I understand the overall request flow: the frontend sends an API request, the server receives and validates the request, authentication information identifies the current user, the repository/database layer performs the appropriate operation, and the server returns a response.

  Although AI assisted me with portions of the implementation, I did not treat the code as a black box. I tested the endpoints through the actual application, investigated failures, and modified the implementation when the generated solution did not match the requirements.
