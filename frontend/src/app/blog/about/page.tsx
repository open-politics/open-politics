import React from 'react';
import Image from 'next/image';
// import DocsSidebar from '@/components/DocsSidebar';
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex relative z-20">
      {/* <div className="">
        <DocsSidebar />
      </div> */}
      <div className="
        flex-1
        xl:ml-64
        container mx-auto
        px-4 sm:px-6 lg:px-8
        max-w-3xl
        py-8 sm:py-12 lg:py-16
        prose prose-lg
        prose-slate dark:prose-invert
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:my-6
        prose-ul:my-6 prose-ul:pl-6
        prose-ol:my-6 prose-ol:pl-6
        prose-li:my-2
        prose-blockquote:my-6 prose-blockquote:pl-4 prose-blockquote:border-l-4
        prose-hr:my-12
        prose-figure:my-8
        prose-figcaption:text-center prose-figcaption:mt-2
        prose-code:text-primary
        prose-a:text-primary hover:prose-a:text-primary/80
        prose-img:rounded-lg prose-img:shadow-md
        relative z-20
      ">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          About Open Politics
        </h1>
       
        <h2 className="text-3xl font-bold mt-12 mb-4">Our Vision</h2>
        <p className="text-lg mb-6">Open Politics aims to enhance political engagement through technology. We're building a connection between innovative tech and civic empowerment, making advanced political analysis tools widely accessible.</p>
        
        <Image
          src="/images/political_intelligence.jpeg"
          alt="Political Intelligence Vision"
          width={800}
          height={400}
          className="mb-8 rounded-lg shadow-md"
        />

        <h2 className="text-3xl font-bold mt-12 mb-4">Our Mission</h2>
        <p className="text-lg mb-6">We believe an informed citizenry is essential for a healthy democracy. Our goal is to clarify the political landscape by offering comprehensive, reliable political intelligence, enabling meaningful participation in the democratic process.</p>
       
        <h2 className="text-3xl font-bold mt-12 mb-4">What We Offer</h2>
        <ul className="list-disc pl-5 space-y-4 mb-6">
          <li>
            <h3 className="text-xl font-semibold">Advanced Web Application</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>AI-assisted summaries of complex political issues</li>
              <li>Interactive dashboard featuring global data visualization</li>
              <li>Context-aware interfaces for intuitive user experience</li>
            </ul>
            <Button variant="link" className="mt-2 p-0">
              <a href="/" className="text-primary hover:underline">Explore our web application (limited access, request an invite)</a>
            </Button>
          </li>
          <li>
            <h3 className="text-xl font-semibold">Open-Source Data Engine</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Integration of diverse, high-quality data sources</li>
              <li>Scalable analytical tools</li>
              <li>Transparent, open-source development</li>
            </ul>
            <Button variant="link" className="mt-2 p-0">
              <a href="https://github.com/jimvincentw/ssare" className="text-primary hover:underline">Check out our open-source data engine</a>
            </Button>
          </li>
          <li>
            <h3 className="text-xl font-semibold">Interdisciplinary Research</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Conducting research at the intersection of AI, Political Science, and Journalism</li>
            </ul>
            <Button variant="link" className="mt-2 p-0">
              <a href="https://convention2.allacademic.com/one/apsa/apsa24/index.php?program_focus=view_paper&selected_paper_id=2148195&cmd=online_program_direct_link&sub_action=online_program" className="text-primary hover:underline">Our latest research</a>
            </Button>
          </li>
          <li>
            <h3 className="text-xl font-semibold">Collaborative Community Platform</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Open-source tech stack available on GitHub</li>
              <li>Customizable and expandable architecture</li>
            </ul>
            <Button variant="link" className="mt-2 p-0">
              <a href="https://discord.gg/vnaarBdV" className="text-primary hover:underline">Join our community on Discord</a>
            </Button>
          </li>
        </ul>
       
        <h2 className="text-3xl font-bold mt-12 mb-4">Our Approach</h2>
        <p className="text-lg mb-4">Open Politics brings together experts in political science, data analysis, and software engineering. We are committed to:</p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>Maintaining high standards of transparency</li>
          <li>Continuously improving our analytical capabilities</li>
          <li>Providing impartial, fact-based political insights</li>
          <li>Applying data engineering best practices</li>
        </ul>

        <h2 className="text-3xl font-bold mt-12 mb-4">Who We Serve</h2>
        <p className="text-lg mb-4">Open Politics is for anyone seeking clarity in our complex world, including:</p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>Citizens navigating modern politics</li>
          <li>Journalists exploring political trends</li>
          <li>Students and educators interested in technology and democracy</li>
          <li>Developers contributing to civic tech</li>
          <li>Anyone wishing to better understand politics</li>
        </ul>
        <p className="text-lg mb-6">We don't have all the answers, but we're dedicated to creating community-driven tools that help you make sense of the world. Whether you're new to political engagement or an experienced analyst, Open Politics offers innovative ways to analyze information and uncover insights.</p>

        <h2 className="text-3xl font-bold mt-12 mb-4">Join the Movement</h2>
        <p className="text-lg mb-6">Participate in improving political information accessibility. Explore our tools, contribute to our projects, or stay informed. Together, we're working towards a more engaged, politically informed society.</p>

        <h2 className="text-3xl font-bold mt-12 mb-4">Get in Touch</h2>
        <p className="text-lg mb-2">Email: engage@open-politics.org</p>
        <p className="text-lg mb-2">Contact: <a href="https://www.linkedin.com/in/jim-vincent-wagner-051818257" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Jim Vincent Wagner, Founder</a></p>
        <p className="text-lg mt-4">We welcome your input and questions!</p>
      </div>
    </div>
  );
}