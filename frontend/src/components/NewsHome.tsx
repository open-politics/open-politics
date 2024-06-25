import { CircleX } from 'lucide-react';
import { Card } from './ui/card';

interface NewsHomeProps {
  prompt: string;
  country_focus: any[];
  articles: any[];
  images: any[];
  summary: string;
  topics: any[];
  entities: any[];
}


export const NewsHome: React.FC<NewsHomeProps> = (props) => {
  return (
    <Card>
    <div className=''>
      <h1>News Home</h1>
    </div>
    </Card>
  );
};