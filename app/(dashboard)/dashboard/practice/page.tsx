import { getActivityLogs } from "@/lib/db/queries";
import Lessons from "@/components/ui/lessons";

export default async function PracticePage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8 bg-white lg:h-full rounded-lg shadow-md">
      
      <Lessons />
    </section>
  );
}
