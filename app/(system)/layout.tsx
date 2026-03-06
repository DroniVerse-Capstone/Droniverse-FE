import ClubFooter from "@/components/layouts/ClubFooter";
import ClubHeader from "@/components/layouts/ClubHeader";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <main>{children}</main>
  );
}