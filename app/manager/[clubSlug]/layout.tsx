import ManagerSidebar from "@/components/layouts/manager/ManagerSidebar";

export default function ManagerClubLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { clubSlug: string };
}) {
	return (
		<div className="h-screen bg-greyscale-900">
			<div className="flex h-screen">
				<ManagerSidebar clubSlug={params.clubSlug} />
				<main className="min-w-0 flex-1 overflow-y-auto bg-greyscale-900">
					<div className="min-w-0 p-4 md:p-6">{children}</div>
				</main>
			</div>
		</div>
	);
}
