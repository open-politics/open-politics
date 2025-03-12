export type ScrapeArticleResponse = {
	url?: string;
	title?: string;
	text_content?: string;
	text?: string;
	summary?: string;
	meta_summary?: string;
	source?: string;
	publication_date?: string;
	top_image?: string;
	images?: Array<string>;
	last_updated?: string;
};

