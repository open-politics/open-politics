import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Open Politics</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Open Politics is revolutionizing how people access and understand political information. In today's world of information overload and media fragmentation, staying informed about politics has become increasingly challenging. We're here to change that.</p>
          <p className="mt-4">We believe that informed citizens are the cornerstone of a healthy democracy. Our mission is to make comprehensive, trustworthy political intelligence accessible to everyone, empowering individuals to engage more effectively with the political process.</p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>AI-assisted summaries of complex political topics</li>
            <li>An interactive dashboard for exploring global political information</li>
            <li>Comprehensive integration of diverse data sources</li>
            <li>Open-source transparency</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Founded by Jim Vincent Wagner, Open Politics brings together expertise in political science, data analysis, and software development. We're committed to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>Maintaining transparency in our methods</li>
            <li>Continuously improving our analytical tools</li>
            <li>Providing non-partisan political information</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Address: Katzbachstraße 38, 10965 Berlin</p>
          <p>Email: engage@open-politics.org</p>
          <Button className="mt-4" variant="outline">
            <a href="mailto:engage@open-politics.org">Get in Touch</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}