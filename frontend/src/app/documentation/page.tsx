'use client'
import React from 'react';
import Link from 'next/link';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import DocsSidebar from "@/components/DocsSidebar";
import Image from 'next/image';
import styled from 'styled-components';

const BlurredDot = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: -1;
`;

const TopLeftDot = styled(BlurredDot)`
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  background: radial-gradient(circle, rgba(0,255,255,0.4) 0%, rgba(0,255,255,0) 70%);
`;

const BottomRightDot = styled(BlurredDot)`
  width: 400px;
  height: 400px;
  bottom: -200px;
  right: -200px;
  background: radial-gradient(circle, rgba(255,0,255,0.4) 0%, rgba(255,0,255,0) 70%);
`;

const DocsPage = () => {
  return (
    <div className="flex relative overflow-hidden">
      <TopLeftDot />
      <BottomRightDot />
      <DocsSidebar />
      <div className="flex-1 container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Documentation</h1>
        <Image
          src="/images/techroom.jpeg"
          alt="Political Intelligence Vision"
          layout="responsive"
          width={800}
          height={300}
          className="mb-8 rounded-lg w-full object-cover"
        />
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="mb-4">
              Please use the docs sidebar on the left to navigate the documentation.
            </p>
            <p className="mb-4">
              Our most important reads are the following:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <Link href="/blog/posts/1" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Getting Started
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocsPage;