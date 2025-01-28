import { docsLinks } from "@/data/docLinks"

export default function ArticleListPage() {
  // Separate highlighted article from the rest
  const highlightedArticle = docsLinks.find(doc => doc.isHighlighted && doc.isPublished);
  const otherArticles = docsLinks.filter(doc => !doc.isHighlighted && doc.isPublished && !doc.isTimeline);
  const timelineArticles = docsLinks.filter(doc => doc.isTimeline && doc.isPublished);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-6">Blog</h1>

      <ul className="space-y-6">
        {/* Render highlighted article first */}
        {highlightedArticle && (
          <li
            key={highlightedArticle.href}
            className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow border border-blue-400"
            style={{ maxHeight: '400px', overflow: 'hidden' }}
          >
            <a href={highlightedArticle.href} className="text-2xl font-semibold text-primary hover:text-primary/80">{highlightedArticle.label}</a>
            {highlightedArticle.description && <p className="text-gray-600 mt-2">{highlightedArticle.description}</p>}
            {highlightedArticle.imageUrl && <img src={highlightedArticle.imageUrl} alt={highlightedArticle.label} className="w-full h-auto mt-4 rounded-md" />}
            {highlightedArticle.topics && (
              <ul className="pl-4 mt-4 space-y-4">
                {highlightedArticle.topics.map((topic) => (
                  topic.isPublished && (
                    <li key={topic.href} className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow hover:border-pink-500">
                      <a href={topic.href} className="text-xl font-medium text-primary hover:text-primary/80">{topic.label}</a>
                      {topic.description && <p className="text-gray-600 mt-1">{topic.description}</p>}
                      {topic.imageUrl && <img src={topic.imageUrl} alt={topic.label} className="w-full h-auto mt-3 rounded-md" />}
                      {topic.subtopics && (
                        <ul className="pl-4 mt-3 space-y-2">
                          {topic.subtopics.map((subtopic) => (
                            subtopic.isPublished && (
                              <li key={subtopic.href} className="p-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <a href={subtopic.href} className="text-lg font-medium text-primary hover:text-primary/80">{subtopic.label}</a>
                                {subtopic.description && <p className="text-gray-600 mt-1">{subtopic.description}</p>}
                                {subtopic.imageUrl && <img src={subtopic.imageUrl} alt={subtopic.label} className="w-full h-auto mt-2 rounded-md" />}
                              </li>
                            )
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                ))}
              </ul>
            )}
          </li>
        )}

        {/* Latest / Timeline */}
        <div className="p-6 sm:p-10">
          <h3 className="text-2xl font-semibold mb-2">Latest</h3>
          <div className="after:absolute after:inset-y-0 after:w-px after:bg-gray-500/20 relative pl-6 after:left-0 grid gap-10 dark:after:bg-gray-400/20">
            {timelineArticles.map((article) => (
              <div key={article.label} className="grid gap-1 text-sm relative">
                <div className="aspect-square w-3 bg-gray-900 rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1 dark:bg-gray-50" />
                <div className="text-lg font-bold">{article.label}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {article.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Render other articles */}
        {otherArticles.map((doc) => (
          <li
            key={doc.href}
            className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow border hover:border-pink-500"
            style={{ maxHeight: '400px', overflow: 'hidden' }}
          >
            <a href={doc.href} className="text-2xl font-semibold text-primary hover:text-primary/80">{doc.label}</a>
            {doc.description && <p className="text-gray-600 mt-2">{doc.description}</p>}
            {doc.imageUrl && <img src={doc.imageUrl} alt={doc.label} className="w-full h-auto mt-4 rounded-md" />}
            {doc.topics && (
              <ul className="pl-4 mt-4 space-y-4">
                {doc.topics.map((topic) => (
                  topic.isPublished && (
                    <li key={topic.href} className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <a href={topic.href} className="text-xl font-medium text-primary hover:text-primary/80">{topic.label}</a>
                      {topic.description && <p className="text-gray-600 mt-1">{topic.description}</p>}
                      {topic.imageUrl && <img src={topic.imageUrl} alt={topic.label} className="w-full h-auto mt-3 rounded-md" />}
                      {topic.subtopics && (
                        <ul className="pl-4 mt-3 space-y-2">
                          {topic.subtopics.map((subtopic) => (
                            subtopic.isPublished && (
                              <li key={subtopic.href} className="p-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <a href={subtopic.href} className="text-lg font-medium text-primary hover:text-primary/80">{subtopic.label}</a>
                                {subtopic.description && <p className="text-gray-600 mt-1">{subtopic.description}</p>}
                                {subtopic.imageUrl && <img src={subtopic.imageUrl} alt={subtopic.label} className="w-full h-auto mt-2 rounded-md" />}
                              </li>
                            )
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}