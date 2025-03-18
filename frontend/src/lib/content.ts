export type CoreContentModel = {
    id?: string;
    title?: string | null;
    text_content?: string | null;
    url?: string;
    source?: string | null;
    insertion_date?: string;
    content_type?: string;
    content_language?: string | null;
    author?: string | null;
    publication_date?: string | null;
    summary?: string | null;
    meta_summary?: string | null;
    embeddings?: number[] | null;
    top_image?: string | null;
    entities?: Array<{
        id: string;
        name: string;
        entity_type: string;
        locations: Array<{
            id: string;
            name: string;
            location_type: string;
            coordinates: number[] | null;
            weight: number;
        }>;
    }>;
    tags?: Array<{
        id: string;
        name: string;
    }>;
    evaluation?: {
        content_id: string;
        rhetoric: string;
        sociocultural_interest: number | null;
        global_political_impact: number | null;
        regional_political_impact: number | null;
        global_economic_impact: number | null;
        regional_economic_impact: number | null;
        event_type: string | null;
        event_subtype: string | null;
        keywords: string[] | null;
        categories: string[] | null;
    } | null;
}
