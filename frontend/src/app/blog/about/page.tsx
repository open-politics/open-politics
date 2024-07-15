import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Open Politics</h1>
     
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open Politics aims to enhance political engagement through technology. We're building a connection between innovative tech and civic empowerment, making advanced political analysis tools widely accessible.</p>
        </CardContent>
      </Card>
      
      <Image
        src="/images/political_intelligence.jpeg"
        alt="Political Intelligence Vision"
        width={800}
        height={400}
        className="mb-8 rounded-lg"
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We believe an informed citizenry is essential for a healthy democracy. Our goal is to clarify the political landscape by offering comprehensive, reliable political intelligence, enabling meaningful participation in the democratic process.</p>
        </CardContent>
      </Card>
     
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-4">
            <li>
              <strong>Advanced Web Application</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>AI-assisted summaries of complex political issues</li>
                <li>Interactive dashboard featuring global data visualization</li>
                <li>Context-aware interfaces for intuitive user experience</li>
                <li>
                  <a href="/" className="text-blue-600 hover:underline">Explore our web application (limited access, request an invite)</a>
                </li>
              </ul>
            </li>
            <li>
              <strong>Open-Source Data Engine</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Integration of diverse, high-quality data sources</li>
                <li>Scalable analytical tools</li>
                <li>Transparent, open-source development</li>
                <li>
                  <a href="https://github.com/jimvincentw/ssare" className="text-blue-600 hover:underline">Check out our open-source data engine</a>
                </li>
              </ul>
            </li>
            <li>
              <strong>Interdisciplinary Research</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Conducting research at the intersection of AI, Political Science, and Journalism</li>
                <li>
                  <a href="https://convention2.allacademic.com/one/apsa/apsa24/index.php?program_focus=view_paper&selected_paper_id=2148195&cmd=online_program_direct_link&sub_action=online_program" className="text-blue-600 hover:underline">Our latest research</a>
                </li>
              </ul>
            </li>
            <li>
              <strong>Collaborative Community Platform</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Open-source tech stack available on GitHub</li>
                <li>Customizable and expandable architecture</li>
                <li>
                  <a href="https://discord.gg/vnaarBdV" className="text-blue-600 hover:underline">Join our community on Discord</a>
                </li>
              </ul>
            </li>
          </ul>
        </CardContent>
      </Card>
     
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open Politics brings together experts in political science, data analysis, and software engineering. We are committed to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Maintaining high standards of transparency</li>
            <li>Continuously improving our analytical capabilities</li>
            <li>Providing impartial, fact-based political insights</li>
            <li>Applying data engineering best practices</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Who We Serve</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open Politics is for anyone seeking clarity in our complex world, including:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Citizens navigating modern politics</li>
            <li>Journalists exploring political trends</li>
            <li>Students and educators interested in technology and democracy</li>
            <li>Developers contributing to civic tech</li>
            <li>Anyone wishing to better understand politics</li>
          </ul>
          <p className='mt-4'>We don't have all the answers, but we're dedicated to creating community-driven tools that help you make sense of the world. Whether you're new to political engagement or an experienced analyst, Open Politics offers innovative ways to analyze information and uncover insights.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Join the Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Participate in improving political information accessibility. Explore our tools, contribute to our projects, or stay informed. Together, we're working towards a more engaged, politically informed society.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email: engage@open-politics.org</p>
          <p>Contact: <a href="https://www.linkedin.com/in/jim-vincent-wagner-051818257" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jim Vincent Wagner, Founder</a></p>
          <p className="mt-4">We welcome your input and questions!</p>
        </CardContent>
      </Card>
    </div>
  );
}