import ClubFooter from "@/components/layouts/ClubFooter";
import ClubHeader from "@/components/layouts/ClubHeader";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-greyscale-900">
      <ClubHeader />
      <main className="flex-1">{children}</main>
      <ClubFooter />
    </div>
  );
}