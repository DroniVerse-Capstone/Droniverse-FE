"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import QuillEditor from "@/components/common/QuillEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SAMPLE_CONTENT = `
<h2>Demo Editor</h2>
<p>Day la noi dung mau de test <strong>Quill Editor</strong>.</p>
<ul>
	<li>Format text</li>
	<li>Chen hinh bang nut image</li>
	<li>Xem HTML output ben phai</li>
</ul>
`;

export default function QuillExamplePage() {
	const [title, setTitle] = useState("Demo Quill Editor");
	const [value, setValue] = useState(SAMPLE_CONTENT);
	const [readOnly, setReadOnly] = useState(false);
	const [theme, setTheme] = useState<"snow" | "bubble">("snow");
	const [minHeight, setMinHeight] = useState(280);

	const plainTextLength = useMemo(() => {
		if (!value) return 0;
		return value.replace(/<[^>]*>/g, "").trim().length;
	}, [value]);

	return (
		<div className="min-h-screen bg-greyscale-900 text-greyscale-0">
			<header className="border-b border-greyscale-700">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
					<div>
						<h1 className="text-xl font-semibold">Quill Editor Playground</h1>
						<p className="text-sm text-greyscale-100">
							Test toolbar, upload image, va output HTML.
						</p>
					</div>

					<Link href="/example/toast" className="text-sm text-primary-200 hover:text-primary-100">
						Mo trang demo toast
					</Link>
				</div>
			</header>

			<main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-5">
				<section className="space-y-4 rounded-lg border border-greyscale-700 bg-greyscale-800/60 p-4 lg:col-span-3">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="demo-title">Tieu de bai viet</Label>
							<Input
								id="demo-title"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="Nhap tieu de"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="demo-height">Min Height (px)</Label>
							<Input
								id="demo-height"
								type="number"
								min={180}
								step={10}
								value={minHeight}
								onChange={(event) => setMinHeight(Number(event.target.value || 180))}
							/>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant={theme === "snow" ? "default" : "outline"}
							onClick={() => setTheme("snow")}
						>
							Theme Snow
						</Button>
						<Button
							type="button"
							variant={theme === "bubble" ? "default" : "outline"}
							onClick={() => setTheme("bubble")}
						>
							Theme Bubble
						</Button>
						<Button
							type="button"
							variant={readOnly ? "default" : "outline"}
							onClick={() => setReadOnly((prev) => !prev)}
						>
							{readOnly ? "Dang Read Only" : "Cho phep chinh sua"}
						</Button>
						<Button type="button" variant="outline" onClick={() => setValue(SAMPLE_CONTENT)}>
							Reset noi dung
						</Button>
					</div>

					<div className="space-y-2">
						<QuillEditor
							label="Noi dung"
							value={value}
							onChange={setValue}
							minHeight={minHeight}
							theme={theme}
							readOnly={readOnly}
							placeholder="Nhap noi dung de test editor"
						/>
					</div>
				</section>

				<section className="space-y-4 rounded-lg border border-greyscale-700 bg-greyscale-800/60 p-4 lg:col-span-2">
					<div className="space-y-1">
						<h2 className="text-base font-semibold">Live Preview</h2>
						<p className="text-xs text-greyscale-100">
							Tieu de: {title || "(chua co)"} | So ky tu: {plainTextLength}
						</p>
					</div>

					<div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
						<h3 className="mb-2 text-lg font-semibold">{title || "Khong co tieu de"}</h3>
						<div
							className="dv-quill-render ql-editor"
							dangerouslySetInnerHTML={{ __html: value }}
						/>
					</div>

					<div className="space-y-2">
						<h3 className="text-sm font-semibold">Raw HTML</h3>
						<pre className="max-h-72 overflow-auto rounded border border-greyscale-700 bg-greyscale-900 p-3 text-xs text-greyscale-100">
							{value}
						</pre>
					</div>
				</section>
			</main>
		</div>
	);
}
