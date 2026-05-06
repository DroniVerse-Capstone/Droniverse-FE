declare module "react-rating-stars-component" {
	import * as React from "react"

	type RatingStarsProps = {
		count?: number
		value?: number
		onChange?: (newValue: number) => void
		size?: number
		isHalf?: boolean
		edit?: boolean
		activeColor?: string
		color?: string
		className?: string
	}

	const ReactStars: React.ComponentType<RatingStarsProps>

	export default ReactStars
}