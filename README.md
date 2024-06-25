# Connect-4-Web App

## Introduction

Welcome to the Connect-4-Web App! This project is an interactive, web-based version of the classic Connect Four game. The application includes AI integration using Google Generative AI to provide a challenging opponent, different game themes, and a comprehensive leaderboard to track player scores.

## Features

- **Two Player Mode**: Play against another human player.
- **AI Opponent**: Challenge the AI with different difficulty levels (Easy, Medium, Hard).
- **Leaderboard**: Keep track of top scores and player names.
- **Themes**: Customize the game's appearance with different themes.
- **Sound Effects**: Enjoy sound effects for moves and win notifications.
- **Undo Move**: Undo the last move if needed.
- **Responsive Design**: The game is fully responsive and works on both desktop and mobile devices.

## Technologies Used

- **React**: For building the user interface.
- **Next.js**: For server-side rendering and easy deployment.
- **Bootstrap**: For styling the application.
- **Google Generative AI**: For implementing AI opponent logic.
- **Git LFS**: For managing large files.

## Setup Instructions

### Prerequisites

- Node.js (version 14.x or later)
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/tjreese90/Connect-4-Web-App.git
    cd Connect-4-Web-App
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up Git LFS:**
    ```bash
    git lfs install
    ```

4. **Start the development server:**
    ```bash
    npm run dev
    ```

5. **Open your browser and navigate to:**
    ```
    http://localhost:3000
    ```

## Usage

- **Start a new game**: Click the "Start Game" button.
- **Make a move**: Click on a column to drop your chip.
- **Restart the game**: Click the "Restart" button.
- **Undo a move**: Click the "Undo Move" button.
- **Change player names**: Enter names in the provided input fields.
- **Toggle AI opponent**: Use the checkbox to enable or disable AI.
- **Change AI difficulty**: Select the desired difficulty from the dropdown menu.
- **Change theme**: Select the desired theme from the dropdown menu.
- **View leaderboard**: Check the leaderboard section for top scores.
- **Clear leaderboard**: Click the "Clear Leaderboard" button.

## File Structure
connect4/
├── public/
│ ├── sounds/
│ │ ├── drop.mp3
│ │ └── win.mp3
│ └── ...
├── src/
│ ├── components/
│ │ ├── Board.tsx
│ │ ├── Header.tsx
│ │ └── ...
│ ├── styles/
│ │ └── globals.css
│ ├── pages/
│ │ ├── index.tsx
│ │ └── ...
│ └── ...
├── .gitattributes
├── package.json
├── README.md


## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- Special thanks to the contributors and the open-source community for making this project possible.
- AI integration powered by [Google Generative AI](https://ai.google.com/).
- Sound effects by [Zapsplat](https://www.zapsplat.com/).

---

Enjoy playing Connect Four on the web!
