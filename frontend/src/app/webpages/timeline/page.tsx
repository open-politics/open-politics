
import TimeLineComponent from './timeline';


export default function Example() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">  
      <TimeLineComponent />
      <div className="col-span-2 md:col-span-1">
        <h1 className="text-2xl font-bold">Timeline</h1>
      </div>
    </div>
  );
}