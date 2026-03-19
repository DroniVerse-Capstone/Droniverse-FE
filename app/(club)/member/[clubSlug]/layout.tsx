import ClubDetailHeader from "@/components/layouts/ClubDetailHeader";


export default function ClubDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ClubDetailHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}