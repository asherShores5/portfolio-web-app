// data/projects.js
// Newest first. liveUrl and github are optional; cards hide a missing link.
// logo: 128x128 PNG in public/images/projects/.
const GITHUB = "https://github.com/asherShores5";

export const projects = [
  {
    title: "NutriSage",
    logo: "/images/projects/nutrisage.png",
    description: "Nutrition tracker for logging meals and recipes. Type what you ate and it finds the food, or asks AI for an estimate when it can't.",
    liveUrl: "https://nutrisage.ashershores.com/",
    github: `${GITHUB}/NutriSage`,
    tech: ["React", "TypeScript", "AppSync", "Bedrock", "AWS CDK"]
  },
  {
    title: "HoneyDo",
    logo: "/images/projects/honeydo.png",
    description: "Household task app for two, with shared and private chores, reminders and push notifications. The live link opens a demo household that runs in your browser.",
    liveUrl: "https://honeydo.ashershores.com/demo",
    github: `${GITHUB}/honeydo`,
    tech: ["React", "TypeScript", "AppSync", "DynamoDB", "Push Notifications"]
  },
  {
    title: "Games Catalog",
    logo: "/images/projects/games.png",
    description: "My game library in one place, across Steam and consoles, with tags and filters for picking what to play. The live link opens a read-only demo with a sample library.",
    liveUrl: "https://games.ashershores.com/?demo",
    github: `${GITHUB}/games-catalog`,
    tech: ["React", "TypeScript", "AppSync", "Steam API"]
  },
  {
    title: "App Connector",
    logo: "/images/projects/apps.png",
    description: "A home-screen launcher that opens all my other apps from one icon.",
    liveUrl: "https://apps.ashershores.com/",
    github: `${GITHUB}/app-connector`,
    tech: ["React", "Vite", "CloudFront"]
  },
  {
    title: "Exam Prep Lab",
    logo: "/images/projects/exampreplab.png",
    description: "Study site for exams and certifications, with quizzes and flashcards.",
    liveUrl: "https://exampreplab.ashershores.com/",
    github: `${GITHUB}/Exam-Prep-Lab`,
    tech: ["React", "AWS Amplify", "TailwindCSS"]
  },
  {
    title: "Chess Move Predictor",
    logo: "/images/projects/chess.png",
    description: "Chess position editor and move analyzer powered by Stockfish. Set up any position and get evaluations, best moves and mate detection, all running in your browser.",
    liveUrl: "https://chess.ashershores.com/",
    github: `${GITHUB}/chess-move-predictor`,
    tech: ["Vanilla JS", "Stockfish", "AWS Amplify"]
  },
  {
    title: "Sprouts",
    logo: "/images/projects/sprouts.png",
    description: "Two-player browser version of the classic pencil-and-paper game. Draw curves between spots, add new spots, and make the last valid move to win.",
    liveUrl: "https://sprouts.ashershores.com/",
    github: `${GITHUB}/sprouts`,
    tech: ["HTML5 Canvas", "Vanilla JS", "AWS Amplify"]
  },
  {
    title: "The Artsy Project",
    logo: "/images/projects/artsy.png",
    description: "A small programming language I wrote, with a site for learning to code in it.",
    liveUrl: "https://artsy.ashershores.com/",
    github: `${GITHUB}/Artsy-Site`,
    tech: ["Compilers", "JavaScript", "Education"]
  },
  {
    title: "PrettyPress",
    logo: "/images/projects/prettypress.png",
    description: "A fast, browser-based code and document formatter.",
    liveUrl: "https://prettypress.ashershores.com/",
    github: `${GITHUB}/pretty-press`,
    tech: ["Express.js", "Formatting Tool", "API"]
  },
  {
    title: "OCR Wombat",
    logo: "/images/projects/ocr.png",
    description: "Simple tool that turns images into text in seconds using a free OCR web API.",
    liveUrl: "https://ocr-wombat.ashershores.com/",
    github: `${GITHUB}/ocr-wombat`,
    tech: ["OCR", "Image-to-Text", "Web API"]
  },
  {
    title: "AsherShores.com",
    logo: "/images/projects/ashershores.png",
    description: "The site you're on now. Built with React and Tailwind, hosted on AWS.",
    liveUrl: "https://www.ashershores.com/",
    github: `${GITHUB}/portfolio-web-app`,
    tech: ["React", "Vite", "TailwindCSS", "AWS"]
  },
  {
    title: "Jokes PHP App",
    logo: "/images/projects/jokes.png",
    description: "Web app for writing, saving and searching jokes, built with PHP, MySQL and jQuery.",
    github: `${GITHUB}/Jokes-PHP-App`,
    tech: ["PHP", "AWS EC2", "MySQL"]
  },
];
