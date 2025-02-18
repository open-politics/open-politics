export const SCHEMA_EXAMPLES = {
  str: {
    title: "Text Classification",
    description: "Use for extracting or classifying text content",
    examples: [
      {
        name: "SentimentAnalysis",
        description: "Analyzes the sentiment of text",
        modelInstructions: "Classify the sentiment of the text as positive, negative, or neutral.",
      },
      {
        name: "TopicExtraction",
        description: "Extracts the main topic discussed",
        modelInstructions: "Extract the primary topic being discussed in the text.",
      }
    ]
  },
  int: {
    title: "Numeric Classification",
    description: "Use for scoring or binary classification",
    examples: [
      {
        name: "Relevance",
        description: "Scores content relevance on a scale",
        intType: "scale" as const,
        scaleMin: 1,
        scaleMax: 5,
        modelInstructions: "Rate the relevance of this content from 1 (not relevant) to 5 (highly relevant).",
      },
      {
        name: "IsAcademic",
        description: "Binary classification for academic content",
        intType: "binary" as const,
        modelInstructions: "Determine if this text is academic (1) or non-academic (0).",
      }
    ]
  },
  "List[str]": {
    title: "Multi-Label Classification",
    description: "Use for categorizing into multiple labels",
    examples: [
      {
        name: "Emotions",
        description: "Detects emotions present in text",
        isSetOfLabels: true,
        labels: ["joy", "sadness", "anger", "fear", "surprise"],
        modelInstructions: "Identify all emotions present in the text from the predefined set.",
      },
      {
        name: "ResearchMethods",
        description: "Identifies research methods used",
        isSetOfLabels: true,
        labels: ["qualitative", "quantitative", "mixed-methods", "experimental", "observational"],
        modelInstructions: "Extract all research methods mentioned in the text.",
      }
    ]
  },
  "List[Dict[str, any]]": {
    title: "Structured Information Extraction",
    description: "Use for extracting complex structured data",
    examples: [
      {
        name: "CitationExtractor",
        description: "Extracts citation information",
        dictKeys: [
          { name: "author", type: "str" },
          { name: "year", type: "int" },
          { name: "title", type: "str" },
          { name: "journal", type: "str" }
        ],
        modelInstructions: "Extract all citations from the text, including author, year, title, and journal.",
      },
      {
        name: "ArgumentAnalysis",
        description: "Analyzes argument structure",
        dictKeys: [
          { name: "claim", type: "str" },
          { name: "evidence", type: "List[str]" },
          { name: "strength", type: "int" }
        ],
        modelInstructions: "Identify main claims, supporting evidence, and rate argument strength (1-5).",
      }
    ]
  }
}; 