**🎮 Tic-Tac-Toe (Advanced)**

      This project is a modern, browser-based Tic-Tac-Toe game built entirely with Vanilla JavaScript, designed with clean architecture and separation of concerns.
      
      It supports Single Player (AI) and Two Player modes, includes a persistent scoring system, and intelligently manages game state using localStorage and sessionStorage.

**Live Demo** 👉 https://ala111205.github.io/Tic-Tac-Toe/

**🚀 Key Features:**

**➕ Game Modes**

      Single Player: Play against a smart AI using the Minimax algorithm

      Two Player: Play against another human locally

      Mode can be toggled anytime with a single click

      Mode switch fully resets the board and optionally scores

**🧠 AI Opponent**

      AI plays optimally with Minimax algorithm

      Automatically makes its move if it’s AI’s turn

      AI first move handled correctly even after page refresh

**📊 Persistent Game State**

      Saves board state, current turn, scores, mode, and win/tie messages in localStorage

      Refreshing the page keeps the game exactly as it was

      Last winner starts the next game automatically if available

**🏆 Score Management**

      Tracks Player X wins, Player O wins, and Ties

      Scores persist across page reloads

      Scores can be reset independently from the board

**🎨 UI & Visual Feedback**

      Highlight winning combination with animations

      Show clear status messages: “Player X Wins 🎉”, “Player O Wins 🎉”, or “It’s a Tie 🤝”

      Mode indicator shows “Single Player 🤖” or “Two Player 👥”

      Hover effects for clickable cells

      Professional, clean, responsive design

**🔄 Reset & Mode Switching**

      Board reset: clears the current board while keeping scores

      Full reset: triggered when switching game modes or manually resetting scores

      Ensures AI auto-start when it’s the AI’s turn

**💾 Persistence & Session Handling**

      🔐 localStorage (Long-Term Persistence)

            Stored under a single key:

                  Board state

                  Current player

                  Game active/inactive state

                  Scores (X, O, Tie)

                  Game mode (Single / Two Player)

                  Last winner

                  Status text (win/tie messages)

            This ensures:

                  Refreshing the page keeps the game exactly as it was

                  Scores are not lost on reload

      🧭 sessionStorage (Session Control)

            Used to detect new browser/tab sessions

            When the tab or browser is closed:

                  sessionStorage is cleared automatically

            On reopening the game:

                  The board always starts fresh

                  No previous board state is restored

                  Prevents confusing “half-finished” games after reopening

            This gives correct UX:

                  Refresh = resume

                  Close & reopen = fresh board

**📱 Responsive UI**

      Optimized for desktop, tablet, and mobile

      Clean grid layout with adaptive sizing

      Status and scores always visible and easy to read

**🛠️ Technologies Used:**

      HTML5 – Semantic structure

      CSS3 – Styling, hover effects, animations, responsive design

      JavaScript (Vanilla) – Game logic, AI, persistence

      localStorage API – Saving game state and scores
