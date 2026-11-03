import React from 'react';
import { Navigation } from './components/Navigation';
import { IntroSection } from './components/IntroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { ConnectSection } from './components/ConnectionSection';
import { HireMeSection } from './components/HireMeSection';
import { CertificationsSection } from './components/CertificationsSection';

const App = () => (
  <div className="min-h-screen bg-[#0a0d14] text-gray-100">
    <Navigation />
    <IntroSection />
    <SkillsSection />
    <CertificationsSection />
    <ProjectsSection />
    <ConnectSection />
    <HireMeSection />
  </div>
);

export default App;