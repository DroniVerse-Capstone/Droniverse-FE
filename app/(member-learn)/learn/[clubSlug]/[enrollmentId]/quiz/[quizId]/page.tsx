import MemberQuizAttemptContent from "@/components/member/course-learn/quiz-attempt/MemberQuizAttemptContent";

type MemberQuizAttemptPageProps = {
  params: {
    enrollmentId: string;
    quizId: string;
  };
};

export default function MemberQuizAttemptPage({
  params,
}: MemberQuizAttemptPageProps) {
  return (
    <section className="min-h-screen bg-greyscale-950 px-6 py-6">
      <MemberQuizAttemptContent
        enrollmentId={params.enrollmentId}
        quizId={params.quizId}
      />
    </section>
  );
}
