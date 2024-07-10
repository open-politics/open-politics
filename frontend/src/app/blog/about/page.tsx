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
          <p>Open Politics is revolutionizing political engagement through technology. We're creating a bridge between cutting-edge innovation and civic empowerment, making sophisticated political analysis tools accessible to everyone.</p>
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
          <p>We believe an informed citizenry is crucial for a thriving democracy. Our mission is to demystify the political landscape by providing comprehensive, reliable political intelligence to all, empowering meaningful participation in the democratic process.</p>
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
                <li>AI-powered summaries of complex political issues</li>
                <li>Dynamic, interactive dashboard featuring a global data visualization</li>
                <li>Context-aware generative interfaces for intuitive user experience</li>
                <li>
                  <a href="/" className="text-blue-600 hover:underline">Explore our web application</a>
                </li>
              </ul>
            </li>
            <li>
              <strong>Innovative Open-Source Data Engine</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Seamless integration of diverse, high-quality data sources</li>
                <li>Scalable, state-of-the-art analytical tools</li>
                <li>Transparent, open-source development</li>
                <li>
                  <a href="https://github.com/jimvincentw/ssare" className="text-blue-600 hover:underline">Check out our open-source data engine</a>
                </li>
              </ul>
            </li>
            <li>
              <strong>Interdisciplinary Research</strong>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Conducting groundbreaking research at the intersection of AI, Political Science, and Journalism</li>
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
            <li>Upholding the highest standards of transparency</li>
            <li>Continuously enhancing our analytical capabilities</li>
            <li>Delivering impartial, fact-based political insights</li>
            <li>Leveraging modern AI and prompt engineering methods</li>
            <li>Applying data engineering best practices</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Who We Serve</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open Politics is for everyone who seeks clarity in this complex world, from the casual news consumer to the dedicated analyst. Our platform serves:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Citizens seeking to navigate the complex waters of modern politics</li>
            <li>Journalists hunting for the stories hidden in political trends</li>
            <li>Students and educators engaged in the intersection of technology and democracy</li>
            <li>Developers eager to contribute their skills to civic tech</li>
            <li>Anyone who's ever thought, "I wish I understood politics better"</li>
          </ul>
          <p className='mt-4'>We don't claim to have all the answers, but we're dedicated to creating community-engineered tools that empower you to make sense of the world. Whether you're just beginning your journey into political engagement or you're an experienced analyst, Open Politics offers innovative ways to analyze information and uncover insights.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Join the Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Be part of the political information revolution. Explore our tools, contribute to our projects, or simply stay informed. Together, we're building a more engaged, politically savvy society.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Email: engage@open-politics.org</p>
          <p>Contact: <a href="https://www.linkedin.com/in/jim-vincent-wagner-051818257" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jim Vincent Wagner, Founder</a></p>
          <a href="mailto:engage@open-politics.org" className="mt-4 inline-block text-blue-600 hover:underline">We'd love to hear from you. Get in touch!</a>
        </CardContent>
      </Card>
    </div>
  );
}