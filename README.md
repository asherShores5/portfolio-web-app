# Modern Portfolio Website with React & AWS

A responsive portfolio website built with React and TailwindCSS, optimized for AWS deployment.

![Uploading image.png…]()

## Features

- Responsive design with dark mode
- Interactive sections: About, Projects, Skills, Connect, Hire Me
- Integrated contact form
- Dynamic skill cards and project showcase
- Social media integration
- Location mapping
- Mobile-friendly navigation

## Tech Stack

- React.js
- TailwindCSS
- Lucide Icons
- AWS Services

## AWS Infrastructure

This project leverages several AWS services:

- **AWS Amplify**: Main deployment and hosting
- **Route 53**: Domain management
- **CloudFront**: Content delivery
- **S3**: Static asset storage
- **Lambda**: Contact form processing
- **API Gateway**: API endpoints

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## AWS Amplify Deployment

1. Push code to GitHub repository
2. Log into AWS Console and open Amplify
3. Choose "Host web app"
4. Connect GitHub repository
5. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd quiz-app
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: quiz-app/dist
    files:
      - "**/*"
  cache:
    paths:
      - quiz-app/node_modules/**/*
```

6. Deploy and verify

## Environment Variables

Create `.env` file:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_EMAIL_SERVICE_ENDPOINT=your_aws_endpoint
```

## Project Structure

```
src/
├── components/       # React components
├── data/            # Static data files
├── styles/          # CSS and Tailwind
└── App.jsx          # Main component
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Lint code
- `npm run test`: Run tests

## AWS Services Configuration

### Contact Form Setup

1. Create API Gateway endpoint
2. Configure Lambda function for email processing
3. Set up SES for email handling
4. Update environment variables

### Custom Domain

1. Purchase domain through Route 53
2. Configure in Amplify
3. Add SSL certificate
4. Update DNS records

## Project Status

This project is privately maintained and not open for public contributions. It serves as a demonstration of the dev's skills in web development and cloud architecture.****
