import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { Menu, X, Download, Mail, Github, Linkedin, ChevronRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import resumeData from './cv_data.json';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * DashboardResume Component
 * Displays a dashboard-style resume with dynamically loaded data from a JSON file.
 */
const DashboardResume = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const skillsData = Object.keys(resumeData.skills).reduce((acc, category) => {
    if (category !== 'languages') {
      acc[category] = resumeData.skills[category].map(skill => ({
        name: skill,
        level: Math.floor(Math.random() * 41) + 60 // Random level between 60 and 100 for demo purposes
      }));
    }
    return acc;
  }, {});

  const workExperienceData = resumeData.work_experience.map((experience, index) => ({
    name: experience.organization,
    start: new Date(experience.dates.start).getFullYear(),
    end: experience.dates.end === 'Present' ? new Date().getFullYear() : new Date(experience.dates.end).getFullYear(),
    role: experience.role.text,
  }));

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 2 * margin;
  
      // Add header with photo, name, and contact info
      const addHeader = () => {
        doc.addImage(resumeData.photo.path, 'JPEG', margin, margin, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(resumeData.name, margin + 50, margin + 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(resumeData.title, margin + 50, margin + 20);
        doc.setFontSize(12);
        doc.text(`Location: ${resumeData.location}`, margin + 50, margin + 30);
        doc.text(`Email: ${resumeData.contact.email.text}`, margin + 50, margin + 40);
        doc.text(`LinkedIn: ${resumeData.contact.linkedin.text}`, margin + 50, margin + 50);
        doc.text(`GitHub: ${resumeData.contact.github.text}`, margin + 50, margin + 60);
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 70, pageWidth - margin, margin + 70);
      };
  
      // Add footer with page number
      const addFooter = (pageNumber) => {
        doc.setFontSize(10);
        doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - margin, { align: 'center' });
      };
  
      let yOffset = margin + 80;
      let pageNumber = 1;
  
      // Add section headings and content
      const addSection = (title, content) => {
        if (yOffset + 20 > pageHeight - margin) {
          doc.addPage();
          pageNumber++;
          addHeader();
          addFooter(pageNumber);
          yOffset = margin + 80;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(title, margin, yOffset);
        yOffset += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(content, margin, yOffset, { maxWidth: contentWidth });
        yOffset += doc.getTextDimensions(content).h + 10;
      };
  
      // Add table sections
      const addTableSection = (title, data, columns) => {
        if (yOffset + 20 > pageHeight - margin) {
          doc.addPage();
          pageNumber++;
          addHeader();
          addFooter(pageNumber);
          yOffset = margin + 80;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(title, margin, yOffset);
        yOffset += 10;
        doc.autoTable({
          startY: yOffset,
          head: [columns],
          body: data,
          margin: { top: 10, left: margin, right: margin },
          styles: { font: 'helvetica', fontSize: 12 },
          theme: 'striped',
          headStyles: { fillColor: [0, 123, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          didDrawPage: (data) => {
            yOffset = data.cursor.y + 10;
          }
        });
      };
  
      // Add header and footer to the first page
      addHeader();
      addFooter(pageNumber);
  
      // Add Summary
      addSection('Professional Summary', resumeData.summary.content);
      if (resumeData.summary.highlight) {
        doc.setFont('helvetica', 'bold');
        doc.text(resumeData.summary.highlight.text, margin, yOffset);
        yOffset += 10;
        doc.setFont('helvetica', 'normal');
      }
  
      // Add Skills
      const skillsData = Object.keys(resumeData.skills).map(category => [
        category,
        resumeData.skills[category].join(', ')
      ]);
      addTableSection('Skills Overview', skillsData, ['Category', 'Skills']);
  
      // Add Work Experience
      const workExperienceData = resumeData.work_experience.map(experience => [
        experience.role.text,
        experience.organization,
        `${experience.dates.start} - ${experience.dates.end}`,
        experience.responsibilities.map(resp => typeof resp === 'string' ? resp : resp.text).join('\n')
      ]);
      addTableSection('Work Experience', workExperienceData, ['Role', 'Organization', 'Dates', 'Responsibilities']);
  
      // Add Projects
      const projectsData = resumeData.projects.map(project => [
        project.name.text,
        `${project.dates.start} - ${project.dates.end}`,
        project.description
      ]);
      addTableSection('Projects', projectsData, ['Name', 'Dates', 'Description']);
  
      // Add Workshops
      const workshopsData = resumeData.workshops.map(workshop => [
        workshop.title.text,
        workshop.date,
        workshop.overview
      ]);
      addTableSection('Workshops', workshopsData, ['Title', 'Date', 'Overview']);
  
      // Add Certifications
      const certificationsData = resumeData.certifications.map(cert => [cert.text]);
      addTableSection('Certifications', certificationsData, ['Certification']);
  
      // Add Publications
      const publicationsData = resumeData.publications.map(publication => [
        publication.title.text,
        publication.date,
        publication.collaborators.join(', '),
        publication.link.text,
        publication.link.url
      ]);
      addTableSection('Publications', publicationsData, ['Title', 'Date', 'Collaborators', 'Link Text', 'Link URL']);
  
      // Add Hobbies
      const hobbiesContent = hobbiesData.join('\n');
      addSection('Hobbies and Interests', hobbiesContent);
  
      // Save the PDF
      doc.save('resume.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const Navbar = () => (
    <nav className="fixed bottom-0 left-0 w-full bg-[#1a365d] shadow-md z-30">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="hidden md:flex space-x-4">
          <Link to="summary" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Summary">Summary</Link>
          <Link to="skills" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Skills">Skills</Link>
          <Link to="experience" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Work Experience">Work Experience</Link>
          <Link to="projects" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Projects">Projects</Link>
          <Link to="workshops" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Workshops">Workshops</Link>
          <Link to="certifications" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Certifications">Certifications</Link>
          <Link to="publications" smooth={true} duration={500} className="cursor-pointer text-[#cbd5e0] hover:text-blue-300" aria-label="Scroll to Publications">Publications</Link>
        </div>
        <button onClick={handleDownloadPDF} className="ml-4 p-2 bg-primary text-white rounded hover:bg-secondary transition-transform transform hover:scale-105 text-sm px-4 py-2 rounded-md" aria-label="Download Resume as PDF">
          <Download className="w-5 h-5 inline-block mr-2" /> Download PDF
        </button>
      </div>
    </nav>
  );

  const Sidebar = () => (
    <>
      <div className="lg:hidden p-4 flex justify-between items-center bg-white shadow-md">
        <div className="text-xl font-bold text-primary">Dashboard Resume</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle Menu">
          {isMobileMenuOpen ? <X className="w-6 h-6 text-secondary" /> : <Menu className="w-6 h-6 text-secondary" />}
        </button>
      </div>
      <div className={`lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-20 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col items-center p-8">
          <img
            src={resumeData.photo.path}
            alt={resumeData.photo.alt_text}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <h1 className="text-xl font-bold text-gray-900">{resumeData.name}</h1>
          <p className="text-sm text-gray-600 text-center mt-2">{resumeData.title}</p>
          <p className="text-sm text-gray-500 mt-2">{resumeData.location}</p>

          <div className="flex gap-4 mt-6">
            <a href={resumeData.contact.email.url} className="text-gray-600 hover:text-primary" aria-label="Email">
              <Mail className="w-5 h-5" />
            </a>
            <a href={resumeData.contact.github.url} className="text-gray-600 hover:text-primary" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href={resumeData.contact.linkedin.url} className="text-gray-600 hover:text-primary" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </>
  );

  const sectionVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const sectionHeaderStyle = "text-2xl font-bold py-4 text-primary";

  const Summary = () => (
    <motion.div id="summary" className="bg-white rounded-lg shadow-sm p-6 mb-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
      <h2 className={sectionHeaderStyle}>Professional Summary</h2>
      <p className="text-gray-600 leading-relaxed">{resumeData.summary.content}</p>
      {resumeData.summary.highlight && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-blue-700 font-medium">{resumeData.summary.highlight.text}</p>
        </div>
      )}
    </motion.div>
  );

  const SkillsSection = () => (
    <motion.div id="skills" className="bg-white rounded-lg shadow-sm p-6 mb-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
      <h2 className={sectionHeaderStyle}>Skills Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(skillsData).map((category, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-4 text-secondary">{category}</h3>
            {skillsData[category].map((skill, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">{skill.name}</span>
                  <span className="text-gray-700">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">Languages</h3>
          {Object.entries(resumeData.skills.languages).map(([language, proficiency], idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">{language}</span>
                <span className="text-gray-700">{proficiency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

const ExperienceSection = () => (
  <motion.div id="experience" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
    <h2 className={sectionHeaderStyle}>Work Experience</h2>
    <div className="space-y-6">
      {resumeData.work_experience && Array.isArray(resumeData.work_experience) ? (
        resumeData.work_experience.map((experience, index) => {
          const startDate = experience.dates?.start || "N/A";
          const endDate = experience.dates?.end || "N/A";
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:scale-105 transition-transform">
              <h3 className="text-lg font-bold">{experience.role.text}</h3>
              <p className="text-gray-600">{experience.organization}</p>
              <span className="text-sm text-gray-500">
                {startDate} - {endDate}
              </span>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                {experience.responsibilities.map((resp, i) => (
                  <li key={i} className="text-gray-600">
                    {typeof resp === 'string' ? resp : <span className={resp.type === 'bold' ? 'font-bold' : ''}>{resp.text}</span>}
                  </li>
                ))}
              </ul>
              {experience.technologies && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {experience.technologies.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p>No work experience available.</p>
      )}
    </div>
  </motion.div>
);

const ProjectsSection = () => (
  <motion.div id="projects" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
    <h2 className={sectionHeaderStyle}>Projects</h2>
    <div className="space-y-6">
      {resumeData.projects && Array.isArray(resumeData.projects) ? (
        resumeData.projects.map((project, index) => {
          const startDate = project.dates?.start || "N/A";
          const endDate = project.dates?.end || "N/A";
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:scale-105 transition-transform">
              <h3 className="text-lg font-bold">{project.name.text}</h3>
              <p className="text-gray-500">
                {startDate} - {endDate}
              </p>
              <p className="text-gray-600 mt-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies?.map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              {project.project_link && (
                <a href={project.project_link} className="text-blue-600 hover:underline mt-2 block">
                  Project Link
                </a>
              )}
            </div>
          );
        })
      ) : (
        <p>No projects available.</p>
      )}
    </div>
  </motion.div>
);

const WorkshopsSection = () => (
  <motion.div id="workshops" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
    <h2 className={sectionHeaderStyle}>Workshops</h2>
    <div className="space-y-6">
      {resumeData.workshops && Array.isArray(resumeData.workshops) ? (
        resumeData.workshops.map((workshop, index) => {
          const date = workshop.date || "N/A";
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4 hover:scale-105 transition-transform">
              <h3 className="text-lg font-bold">{workshop.title.text}</h3>
              <p className="text-gray-500">{date}</p>
              <p className="text-gray-600 mt-2">{workshop.overview}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {workshop.technologies?.map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <p>No workshops available.</p>
      )}
    </div>
  </motion.div>
);

  const CertificationsSection = () => (
    <motion.div id="certifications" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
      <h2 className={sectionHeaderStyle}>Certifications</h2>
      <div className="space-y-4">
        {resumeData.certifications && Array.isArray(resumeData.certifications) ? (
          resumeData.certifications.map((cert, index) => (
            <div key={index} className="text-gray-600">
              {cert.text}
            </div>
          ))
        ) : (
          <p>No certifications available.</p>
        )}
      </div>
    </motion.div>
  );

  const PublicationsSection = () => (
    <motion.div id="publications" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
      <h2 className={sectionHeaderStyle}>Publications</h2>
      {resumeData.publications && Array.isArray(resumeData.publications) ? (
        resumeData.publications.map((publication, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-bold">{publication.title.text}</h3>
            <p className="text-gray-500">{publication.date}</p>
            <p className="text-gray-600 mt-2 text-sm">
              Collaborators: {publication.collaborators.join(', ')}
            </p>
            <a href={publication.link.url} className="text-blue-600 hover:underline mt-2 block">
              {publication.link.text}
            </a>
          </div>
        ))
      ) : (
        <p>No publications available.</p>
      )}
    </motion.div>
  );

const CommunityContributionsSection = () => (
  <motion.div id="community_contributions" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
    <h2 className={sectionHeaderStyle}>Community Contributions</h2>
    {resumeData.community_contributions && Array.isArray(resumeData.community_contributions) ? (
      resumeData.community_contributions.map((contribution, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h3 className="text-lg font-bold">{contribution.title}</h3>
          <p className="text-gray-600 mt-2">{contribution.details}</p>
          {contribution.technologies && (
            <div className="flex flex-wrap gap-2 mt-2">
              {contribution.technologies.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          )}
          {contribution.link && (
            <a href={contribution.link} className="text-blue-600 hover:underline mt-2 block">
              {contribution.link}
            </a>
          )}
        </div>
      ))
    ) : (
      <p>No community contributions available.</p>
    )}
  </motion.div>
);

const EducationSection = () => (
  <motion.div id="education" className="space-y-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
    <h2 className={sectionHeaderStyle}>Education</h2>
    {resumeData.education && Array.isArray(resumeData.education) ? (
      resumeData.education.map((edu, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h3 className="text-lg font-bold">{edu.degree}</h3>
          <p className="text-gray-600">{edu.institution}</p>
          <span className="text-sm text-gray-500">
            {edu.dates.start} - {edu.dates.end}
          </span>
          <p className="text-gray-600 mt-2">{edu.details}</p>
        </div>
      ))
    ) : (
      <p>No education details available.</p>
    )}
  </motion.div>
);

  const hobbiesData = resumeData.hobbies_and_interests;

  const HobbiesSection = () => (
    <motion.div id="hobbies" className="bg-white rounded-lg shadow-sm p-6 mb-6" initial="hidden" whileInView="visible" variants={sectionVariants} viewport={{ once: true }}>
      <h2 className={sectionHeaderStyle}>Hobbies and Interests</h2>
      <ul className="list-disc ml-6 space-y-2">
        {hobbiesData.map((hobby, index) => (
          <li key={index} className="text-gray-600 flex items-center">
            <ChevronRight className="w-4 h-4 text-primary mr-2" />
            {hobby}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  const Footer = () => (
    <footer className="bg-white shadow-md mt-12 p-4 border-t border-gray-200 pt-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-sm text-[#2d3748]">
          &copy; {new Date().getFullYear()} Dashboard Resume. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a href={resumeData.contact.email.url} className="text-gray-600 hover:text-primary" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
          <a href={resumeData.contact.github.url} className="text-gray-600 hover:text-primary" aria-label="GitHub">
            <Github className="w-5 h-5" />
          </a>
          <a href={resumeData.contact.linkedin.url} className="text-gray-600 hover:text-primary" aria-label="LinkedIn">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-roboto pb-24">
      <Sidebar />
      <div id="resume-content" className="lg:ml-64 p-8 pt-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <Summary />
          <SkillsSection />
          <ExperienceSection />
          <ProjectsSection />
          <WorkshopsSection />
          <CertificationsSection />
          <PublicationsSection />
          <CommunityContributionsSection />
          <EducationSection />
          <HobbiesSection />
        </div>
      </div>
      <Navbar />
      <Footer />
    </div>
  );
};

export default DashboardResume;
