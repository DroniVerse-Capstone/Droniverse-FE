import MemberQuizAttemptReviewContent from "@/components/member/course-learn/quiz-attempt/MemberQuizAttemptReviewContent";

type MemberQuizAttemptReviewPageProps = {
  params: {
    enrollmentId: string;
    quizId: string;
  };
};

export default function MemberQuizAttemptReviewPage({
  params,
}: MemberQuizAttemptReviewPageProps) {
  return (
    <section className="min-h-screen bg-greyscale-950 px-6 py-6">
      <MemberQuizAttemptReviewContent
        enrollmentId={params.enrollmentId}
        quizId={params.quizId}
      />
    </section>
  );
}
