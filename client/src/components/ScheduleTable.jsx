import { ArrowsRightLeftIcon, ArrowsUpDownIcon, UserIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDraggable } from 'react-use-draggable-scroll'

const ScheduleTable = ({ cinema, selectedDate }) => {
	const ref = useRef(null)
	const { events } = useDraggable(ref)

	const getRowStart = (showtime) => {
		showtime = new Date(showtime)
		const hour = showtime.getHours()
		const min = showtime.getMinutes()
		return Math.round((60 * hour + min) / 10)
	}

	const getRowSpan = (length) => {
		return Math.round(length / 10)
	}

	const getRowStartRange = () => {
		let firstRowStart = 100000
		let lastRowEnd = 0
		let count = 0
		cinema.theaters.forEach((theater, index) => {
			theater.showtimes.forEach((showtime, index) => {
				if (
					new Date(showtime.showtime).getDate() === selectedDate.getDate() &&
					new Date(showtime.showtime).getMonth() === selectedDate.getMonth() &&
					new Date(showtime.showtime).getYear() === selectedDate.getYear()
				) {
					const rowStart = getRowStart(showtime.showtime)
					if (rowStart < firstRowStart) {
						firstRowStart = rowStart
					}
					if (rowStart + getRowSpan(showtime.movie.length) > lastRowEnd) {
						lastRowEnd = rowStart + getRowSpan(showtime.movie.length)
					}
					count++
				}
			})
		})
		return [firstRowStart, lastRowEnd, count]
	}

	const getTodayShowtimes = (theater) => {
		return theater.showtimes?.filter((showtime, index) => {
			return (
				new Date(showtime.showtime).getDate() === selectedDate.getDate() &&
				new Date(showtime.showtime).getMonth() === selectedDate.getMonth() &&
				new Date(showtime.showtime).getYear() === selectedDate.getYear()
			)
		})
	}

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64 // Convert character to ASCII and adjust to 1-based index
			result = result * 26 + charCode
		}
		return result
	}

	const firstRowStart = getRowStartRange()[0]
	const gridRows = Math.max(1, getRowStartRange()[1] - getRowStartRange()[0])
	const showtimeCount = getRowStartRange()[2]
	const shiftStart = 3
	const shiftEnd = 2

	return (
		<>
			<div
				className={`grid h-screen overflow-x-auto grid-cols-${cinema.theaters?.length.toString()} grid-rows-${
					gridRows + shiftEnd
				} rounded-md bg-gradient-to-br from-indigo-100 to-white`}
				{...events}
				ref={ref}
			>
				{cinema.theaters?.map((theater, index) => {
					{
						return getTodayShowtimes(theater)?.map((showtime, index) => {
							return (
								<Link
									title={`${showtime.movie.name}\n${new Date(showtime.showtime)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(showtime.showtime)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(showtime.showtime).getTime() + showtime.movie.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(showtime.showtime).getTime() + showtime.movie.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}
												`}
									key={index}
									className={`overflow-y-scroll row-span-${getRowSpan(
										showtime.movie.length
									)} row-start-${
										getRowStart(showtime.showtime) - firstRowStart + shiftStart
									} col-start-${
										theater.number
									} mx-1 rounded bg-white p-1 text-center drop-shadow-md hover:bg-gray-50`}
									to={`/showtime/${showtime._id}`}
								>
									<p className="text-sm font-bold">{showtime.movie.name}</p>
									<p className="text-sm leading-3">{`${new Date(showtime.showtime)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(showtime.showtime)
										.getMinutes()
										.toString()
										.padStart(2, '0')} - ${new Date(
										new Date(showtime.showtime).getTime() + showtime.movie.length * 60000
									)
										.getHours()
										.toString()
										.padStart(2, '0')} : ${new Date(
										new Date(showtime.showtime).getTime() + showtime.movie.length * 60000
									)
										.getMinutes()
										.toString()
										.padStart(2, '0')}`}</p>
								</Link>
							)
						})
					}
				})}

				{showtimeCount === 0 && (
					<div className="col-span-full row-start-3 flex items-center justify-center text-xl font-semibold text-gray-700">
						There are no showtimes available
					</div>
				)}

				{cinema.theaters.map((theater, index) => (
					<div
						key={index}
						className="sticky top-0 row-span-1 row-start-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 text-white"
					>
						<p className="text-2xl font-semibold leading-7">{index + 1}</p>
						<div className="flex gap-1 text-xs">
							<p className="flex items-center gap-1">
								<ArrowsUpDownIcon className="h-3 w-3" />
								{theater.seatPlan.row === 'A' ? theater.seatPlan.row : `A - ${theater.seatPlan.row}`}
							</p>
							<p className="flex items-center gap-1">
								<ArrowsRightLeftIcon className="h-3 w-3" />
								{theater.seatPlan.column === 1
									? theater.seatPlan.column
									: `1 - ${theater.seatPlan.column}`}
							</p>
						</div>
						<p className="flex items-center gap-1 text-sm">
							<UserIcon className="h-4 w-4" />
							{(rowToNumber(theater.seatPlan.row) * theater.seatPlan.column).toLocaleString('en-US')}{' '}
							Seats
						</p>
					</div>
				))}
			</div>
		</>
	)
}

export default ScheduleTable
