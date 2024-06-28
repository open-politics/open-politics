// app/blog/user_guide/page.tsx
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";

const ArticlePage: React.FC = () => {
  return (
    <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 antialiased">
      <div className="flex justify-between px-4 mx-auto max-w-screen-xl">
        <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base tracking-tight lg:format-lg format-blue dark:format-invert">
          <header className="mb-4 lg:mb-6 not-format">
            <div className="flex items-center space-x-3 p-4 rounded-lg shadow">
              <Avatar>
                <AvatarImage alt="Profile picture" src="/images/jim_6.png" />
                <AvatarFallback>JVW</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white"><a href="https://www.linkedin.com/in/jim-vincent-wagner-051818257" target="_blank" rel="noopener noreferrer">Jim Vincent Wagner</a></div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Founder</div>
                <div className="text-sm text-gray-500 dark:text-gray-400"><time dateTime="2024-05-04" title="May 4th, 2024">May 4th, 2024</time></div>
              </div>
            </div>
            <h1 className="my-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl dark:text-white">Best practices for using Open Politics</h1>
            <Separator />
          </header>
          <p className="lead">Open Politics is an open-source project that aims to make what is happening in politics more accessible. This guide is meant to introduce you to using the web app interface and show you what you can do with it.</p>
          
          <figure className='my-4'>
            <img src="/images/political_intelligence.png" alt="Political Intelligence" />
            <figcaption className='mt-3'>DALL·E 3; <i> "Imagine a world where everybody has access to political intelligence."</i></figcaption>
          </figure>

          <h2>Getting started with OPP</h2>

          <p>First of all you need to understand why this project exists.</p>

          <p>Staying up to date with the world of politics is time consuming and difficult. There are countless sources reporting and even more events, issues, conflicts and elections to report about.</p>

          <p>Time is limited, and dopamine is the currency of the 21st century. I personally know a lot of people that feel out-of-touch with what is happening. This tool is for looking something up before a discussion, to browse for worldwide news and to compare issues from around the world.</p>

          <p>Let's start by addressing some conceptual baselines and critical information:</p>
          <ol>
            <li>
              <strong>The importance of news</strong><br /> News agencies, independent journalists and NGOs around the world are constantly documenting what is happening in politics and what people are thinking. This project does not take any perspective on what is good or bad but reflects what people are talking about, issues. Because that's what politics essentially is.
            </li>
            <li>
              <strong>Open Source</strong><br /> The code, the methods and all the prompts for AI usage are documented and visible to everyone. This means that anyone can use the project, contribute to it or even build upon it.
            </li>
            <li>
              <strong>Clear methods and reproducible answers</strong><br /> This project also researches the way LLMs and natural language interfacing can be responsibly done. In practice this means creating benchmarks and evaluating the reliability of AI to solve certain tasks like creating summaries, extracting sentiment and labeling information (e.g. rating between anecdotal and hot topic stories)
            </li>
          </ol>

          <figure>
            <img src="/images/open_globe_4.png" alt="Open Globe" />
            <figcaption>OPEN GLOBE <br /> The tool for interactive information exploration. Scroll around the world and see what's happening</figcaption>
          </figure>

          <h2>When do I use it?</h2>

          <p>While it might seem like extra work using <strong>another</strong> tool at a first glance, here are some key moments in which Open Politics will come in handy:</p>
          <ol>
            <li><strong>Searching for News</strong>. Research the news for a country, a topic or issue you are interested in. One core component of the interface is the search fragment. It displays the news for your question and the extracted insights.</li>
            <li><strong>Creating your personal focus dashboard</strong>. Create a pane with up to four of your search terms to show at once. It is essentially just multiple search fragments next to each other. You may use this to compare the economies of Malaysia and Germany or to compare between two different areas in the same country. This method of comparative analysis is at the heart of this project.</li>
            <li><strong>Explorative Information</strong>. Use the Open Globe Interface and scroll through the world and see what is happening. We will give our best to make the information accessible to you and be representative of what is happening;</li>
          </ol>
          <p>Think of asking somebody that is specialized in news and categorizing them. It won't give you an answer to why the world is not in peace. It will rather show what people's positions in certain issue areas are. The analysis is created around issue areas (topic), actors (and other entities) and the statements that show their position. The final component is a contextualization that compares information from sources like Wikipedia to provide historical and social contextualization for issue areas.</p>
          
          <h3
        className='mt-4'
          >Let's do this step by step</h3>
          <p>This article will outline the core components of open politics search module and the open globe interface.</p>

          <h4>1. Formulate your questions</h4>
          <img src="/images/open_finder.png" alt="Open Finder" />
          <p>What works best is asking a question about a topic of politics and a country (or region)</p>

          <h4>2. We are extending your Search</h4>
          <p>A language model extends your questions and presses it in a certain frame. Take for example the question: <code>What is happening in southeast asia?</code>.</p>
          <p>This will extend to multiple queries like this:</p>

          <pre><code className="language-html max-h-[100]">
            {`{
              "queries": [
                {
                  "query": "Current political events in Southeast Asia",
                  "category": "situation"
                },
                {
                  "query": "Economic trends in Southeast Asia",
                  "category": "situation"
                },
                {
                  "query": "Major political leaders in Southeast Asia",
                  "category": "actor"
                },
                {
                  "query": "Trade agreements in Southeast Asia",
                  "category": "conflict"
                },
                {
                  "query": "Foreign investment in Southeast Asia",
                  "category": "country"
                }
              ]
            }`}
          </code></pre>
          <p>You can find the code that produces these search queries <a href="https://github.com/JimVincentW/open-politics/blob/upgrade_with_guide/open_politics_project/news/views/module_views.py">here</a>.</p>
          
          <h4>3. Searching relevant articles</h4>
          <p>The next step is to search for articles that are relevant to your question.</p>
          <ol>
            <li>
              <p><strong>Semantic Search</strong><br /> The custom SSARE (Semantic Search Article Recommendation Engine) data engine scrapes and delivers news from around the world around the clock. It delivers articles by searching for text with similar semantic meaning (a newer, smarter kind of search).</p>
            </li>
            <img src="/images/sem_search.png" alt="Semantic Search" />
            <li>
              <p><strong>Entity Recognition</strong><br /> The processing concentrates mostly on Entities (like locations, institutions and organizations) and the issue areas that are found inside of news articles.</p>
            </li>
            <img src="/images/ner.png" alt="Entity Recognition" />
          </ol>
          <h3>4. Extracting Issue Areas</h3>
          <p><strong>Issue Area Extraction</strong> is done with AI. In practice this means retrieved articles (/their summaries) are fed into one prompt where the AI model is asked to extract relevant topics and return them in a structured format.</p>
          <img src="/images/issue_areas.png" alt="Issue Areas" />
          <p>You can find the code that does this <a href="https://github.com/JimVincentW/SSARE/open_politics_project/news/views/module_views.py">here</a></p>
          <h3>5. Compare</h3>
          <p>See the results of search fragments on the focus dashboard and stay up to date with what is important to you.</p>
          <img src="/images/dashboard.png" alt="Dashboard" />
          <section className="bg-white dark:bg-gray-900">
            <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
                  <span className="text-shadow [text-shadow:_0_2px_5px_#000] dark:[text-shadow:_0_2px_5px_#fff]">Expand your horizon</span>
                </h1>
                <h4>Global News. Important Issue Areas. You: up to date. <br /> <br />On desktop and mobile.</h4>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
                  Create your personal focus dashboard or use the globe to find news interactively.
                </p>
                <a href="/globe" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                  Use the Globe
                  <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </a>
                <a href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                  Focus Dashboard
                </a>
              </div>
              <div className="lg:mt-0 lg:col-span-5 lg:flex">
                <div className="mockup-phone">
                  <div className="camera"></div>
                  <div className="display">
                    <div className="artboard artboard-demo phone-1 p-0">
                      <div className="w-full h-full overflow-hidden object-cover top-4">
                        <img className="object-cover w-full h-full" src="/images/globe_search_mobile_4.png" alt="mockup" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}

export default ArticlePage;
