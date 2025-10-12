// app/(dashboard)/dashboard/history/page.tsx
import ExamResultsSummary from "@/components/ui/examHistory";

export default async function HistoryPage() {

  return (
    <section className="flex-1 p-4 lg:p-8 bg-white">
      <h1 className="text-base lg:text-base font-medium text-gray-900 mb-6">
        Practice Questions
      </h1>
      <ExamResultsSummary />
    </section>
  );
}
