// data/projects.js
// Newest first. liveUrl and github are optional; cards hide a missing link.
const GITHUB = "https://github.com/asherShores5";

export const projects = [
  {
    title: "NutriSage",
    description: "Nutrition tracker for logging meals and recipes. Type what you ate and it finds the food, or asks AI for an estimate when it can't.",
    liveUrl: "https://nutrisage.ashershores.com/",
    github: `${GITHUB}/NutriSage`,
    tech: ["React", "TypeScript", "AppSync", "Bedrock", "AWS CDK"]
  },
  {
    title: "HoneyDo",
    description: "Household task app for two, with shared and private chores, reminders and push notifications. Visitors see the sign-in page.",
    liveUrl: "https://honeydo.ashershores.com/",
    github: `${GITHUB}/honeydo`,
    tech: ["React", "TypeScript", "AppSync", "DynamoDB", "Push Notifications"]
  },
  {
    title: "Games Catalog",
    description: "My game library in one place, across Steam and consoles, with tags and filters for picking what to play. Visitors see the sign-in page.",
    liveUrl: "https://games.ashershores.com/",
    github: `${GITHUB}/games-catalog`,
    tech: ["React", "TypeScript", "AppSync", "Steam API"]
  },
  {
    title: "App Connector",
    description: "A home-screen launcher that opens all my other apps from one icon.",
    liveUrl: "https://apps.ashershores.com/",
    github: `${GITHUB}/app-connector`,
    tech: ["React", "Vite", "CloudFront"]
  },
  {
    title: "Exam Prep Lab",
    description: "Study site for exams and certifications, with quizzes and flashcards.",
    liveUrl: "https://exampreplab.ashershores.com/",
    github: `${GITHUB}/Exam-Prep-Lab`,
    tech: ["React", "AWS Amplify", "TailwindCSS"]
  },
  {
    title: "Sprouts",
    description: "Two-player browser version of the classic pencil-and-paper game. Draw curves between spots, add new spots, and make the last valid move to win.",
    liveUrl: "https://sprouts.ashershores.com/",
    github: `${GITHUB}/sprouts`,
    tech: ["HTML5 Canvas", "Vanilla JS", "AWS Amplify"]
  },
  {
    title: "The Artsy Project",
    description: "A small programming language I wrote, with a site for learning to code in it.",
    liveUrl: "https://artsy.ashershores.com/",
    github: `${GITHUB}/Artsy-Site`,
    tech: ["Compilers", "JavaScript", "Education"]
  },
  {
    title: "PrettyPress",
    description: "A fast, browser-based code and document formatter.",
    liveUrl: "https://prettypress.ashershores.com/",
    github: `${GITHUB}/pretty-press`,
    tech: ["Express.js", "Formatting Tool", "API"]
  },
  {
    title: "OCR Wombat",
    description: "Simple tool that turns images into text in seconds using a free OCR web API.",
    liveUrl: "https://ocr-wombat.ashershores.com/",
    github: `${GITHUB}/ocr-wombat`,
    tech: ["OCR", "Image-to-Text", "Web API"]
  },
  {
    title: "AsherShores.com",
    description: "The site you're on now. Built with React and Tailwind, hosted on AWS.",
    liveUrl: "https://www.ashershores.com/",
    github: `${GITHUB}/portfolio-web-app`,
    tech: ["React", "Vite", "TailwindCSS", "AWS"]
  },
  {
    title: "Jokes PHP App",
    description: "Web app for writing, saving and searching jokes, built with PHP, MySQL and jQuery.",
    github: `${GITHUB}/Jokes-PHP-App`,
    tech: ["PHP", "AWS EC2", "MySQL"]
  },
];
