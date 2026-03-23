"use client"

import { AxiosError } from "axios"
import { useCallback, useEffect, useMemo, useRef } from "react"
import toast from "react-hot-toast"

import { useUploadTempClubImage } from "@/hooks/club/useClub"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/i18n-provider"

const DEFAULT_TOOLBAR = [
	[{ header: [1, 2, 3, false] }],
	[{ color: [] }, { background: [] }],
	["bold", "italic", "underline", "strike"],
	[{ list: "ordered" }, { list: "bullet" }],
	[{ align: [] }],
	["blockquote", "code-block"],
	["link", "image"],
	["clean"],
]

const DEFAULT_FORMATS = [
	"header",
	"bold",
	"italic",
	"underline",
	"strike",
	"color",
	"background",
	"list",
	"bullet",
	"align",
	"blockquote",
	"code-block",
	"link",
	"image",
]

type QuillLikeEditor = {
	root: HTMLElement
	getSelection: (focus?: boolean) => { index: number; length: number } | null
	getLength: () => number
	insertEmbed: (index: number, type: string, value: string, source?: string) => void
	setSelection: (index: number, length: number, source?: string) => void
	on: (event: string, handler: () => void) => void
	off: (event: string, handler: () => void) => void
	enable: (enabled?: boolean) => void
	clipboard: {
		dangerouslyPasteHTML: (html: string) => void
	}
}

type QuillConstructor = new (
	element: Element,
	options: {
		theme?: "snow" | "bubble"
		readOnly?: boolean
		placeholder?: string
		modules?: Record<string, unknown>
		formats?: string[]
	}
) => QuillLikeEditor

export type QuillEditorProps = {
	id?: string
	label?: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	editorClassName?: string
	labelClassName?: string
	required?: boolean
	readOnly?: boolean
	error?: string
	theme?: "snow" | "bubble"
	minHeight?: number
	modules?: Record<string, unknown>
	formats?: string[]
}

export default function QuillEditor({
	id,
	label,
	value,
	onChange,
	placeholder = "Nhap noi dung...",
	className,
	editorClassName,
	labelClassName,
	required = false,
	readOnly = false,
	error,
	theme = "snow",
	minHeight = 180,
	modules,
	formats,
}: QuillEditorProps) {
	const t = useTranslations("ClubImageUpload")
	const uploadImageMutation = useUploadTempClubImage()

	const containerRef = useRef<HTMLDivElement | null>(null)
	const quillRef = useRef<QuillLikeEditor | null>(null)
	const onChangeRef = useRef(onChange)
	const changeHandlerRef = useRef<(() => void) | null>(null)
	const isApplyingValueRef = useRef(false)
	const readOnlyRef = useRef(readOnly)
	const tRef = useRef(t)
	const mutateAsyncRef = useRef(uploadImageMutation.mutateAsync)
	const isUploadPendingRef = useRef(uploadImageMutation.isPending)

	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	useEffect(() => {
		readOnlyRef.current = readOnly
	}, [readOnly])

	useEffect(() => {
		tRef.current = t
	}, [t])

	useEffect(() => {
		mutateAsyncRef.current = uploadImageMutation.mutateAsync
		isUploadPendingRef.current = uploadImageMutation.isPending
	}, [uploadImageMutation.mutateAsync, uploadImageMutation.isPending])

	const handleImageUpload = useCallback(
		async (editor: QuillLikeEditor) => {
			if (readOnlyRef.current || isUploadPendingRef.current) return

			const input = document.createElement("input")
			input.setAttribute("type", "file")
			input.setAttribute("accept", "image/*")

			input.onchange = async () => {
				const file = input.files?.[0]
				if (!file) return

				if (!file.type.startsWith("image/")) {
					toast.error(tRef.current("toast.warning"))
					return
				}

				try {
					const data = await mutateAsyncRef.current(file)
					const range = editor.getSelection(true)
					const index = range?.index ?? editor.getLength()

					editor.insertEmbed(index, "image", data.url, "user")
					editor.setSelection(index + 1, 0)
				} catch (uploadError) {
					const axiosError = uploadError as AxiosError<{ message?: string }>
					toast.error(axiosError.response?.data?.message || tRef.current("toast.error"))
				}
			}

			input.click()
		},
		[]
	)

	const mergedModules = useMemo(() => {
		const inputToolbar = modules?.toolbar ?? DEFAULT_TOOLBAR

		const toolbar = Array.isArray(inputToolbar)
			? {
					container: inputToolbar,
					handlers: {
						image: function (this: { quill: QuillLikeEditor }) {
							void handleImageUpload(this.quill)
						},
					},
				}
			: {
					...(inputToolbar as Record<string, unknown>),
					handlers: {
						...(((inputToolbar as Record<string, unknown>).handlers as
							| Record<string, unknown>
							| undefined) ?? {}),
						image: function (this: { quill: QuillLikeEditor }) {
							void handleImageUpload(this.quill)
						},
					},
				}

		return {
			...modules,
			toolbar,
		}
	}, [handleImageUpload, modules])

	const mergedFormats = useMemo(() => formats ?? DEFAULT_FORMATS, [formats])

	useEffect(() => {
		let cancelled = false

		const setup = async () => {
			if (!containerRef.current) return

			const { default: Quill } = await import("quill")
			if (cancelled || !containerRef.current) return

			containerRef.current.innerHTML = ""
			const host = document.createElement("div")
			containerRef.current.appendChild(host)

			const instance = new (Quill as unknown as QuillConstructor)(host, {
				theme,
				readOnly,
				placeholder,
				modules: mergedModules,
				formats: mergedFormats,
			})

			if (value) {
				instance.clipboard.dangerouslyPasteHTML(value)
			}

			const handleTextChange = () => {
				if (isApplyingValueRef.current) return
				const html = instance.root.innerHTML
				onChangeRef.current(html === "<p><br></p>" ? "" : html)
			}

			instance.on("text-change", handleTextChange)
			quillRef.current = instance
			changeHandlerRef.current = handleTextChange
		}

		void setup()

		return () => {
			cancelled = true

			if (quillRef.current && changeHandlerRef.current) {
				quillRef.current.off("text-change", changeHandlerRef.current)
			}

			quillRef.current = null
			changeHandlerRef.current = null

			if (containerRef.current) {
				containerRef.current.innerHTML = ""
			}
		}
	}, [mergedFormats, mergedModules, placeholder, readOnly, theme])

	useEffect(() => {
		const instance = quillRef.current
		if (!instance) return
		instance.enable(!readOnly)
	}, [readOnly])

	useEffect(() => {
		const instance = quillRef.current
		if (!instance) return

		const current = instance.root.innerHTML === "<p><br></p>" ? "" : instance.root.innerHTML
		const incoming = value || ""
		if (current === incoming) return

		isApplyingValueRef.current = true
		instance.clipboard.dangerouslyPasteHTML(incoming)
		isApplyingValueRef.current = false
	}, [value])

	return (
		<div className={cn("space-y-2", className)}>
			{label ? (
				<label
					htmlFor={id}
					className={cn("text-sm font-medium text-greyscale-0", labelClassName)}
				>
					{label}
					{required ? <span className="ml-1 text-primary-200">*</span> : null}
				</label>
			) : null}

			<div
				id={id}
				className={cn(
					"dv-quill-editor",
					error ? "dv-quill-editor--error" : "",
					editorClassName
				)}
				style={{ minHeight }}
			>
				<div ref={containerRef} />
			</div>

			{error ? <p className="text-xs text-error-100">{error}</p> : null}
		</div>
	)
}
