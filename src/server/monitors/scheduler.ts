import { processWide } from '@server/process-wide'
import { listMonitors } from '@server/store'
import { displayUrl, formatCount } from '@shared/format'
import type { Monitor, MonitorRun } from '@shared/monitors'
import { isRunning, runMonitor } from './run'

const MINUTE = 60_000
const MAX_PARALLEL_MONITORS = 5

/** Whether the timer is set, and whether a check is running, once per process. */
const scheduler = processWide('scheduler', () => ({ started: false, checking: false }))

function describeRun(monitor: Monitor, run: MonitorRun): string {
	const result = run.ok ? `${run.score} (${run.grade})` : `didn't load: ${run.error}`
	const alerts = run.alerts.length ? `, ${formatCount(run.alerts.length, 'alert')}` : ''

	return `[monitors] ${displayUrl(monitor.url)} ${result}${alerts}`
}

/** Runs every monitor that's due, up to a small parallel batch. Returns how many ran. */
export async function runDueMonitors(now = new Date()): Promise<number> {
	if (scheduler.checking) return 0
	scheduler.checking = true
	let ran = 0
	try {
		const due = (await listMonitors()).filter(
			(m) => !m.paused && new Date(m.nextRunAt) <= now && !isRunning(m.id)
		)
		const batches: Monitor[][] = []
		for (let i = 0; i < due.length; i += MAX_PARALLEL_MONITORS) {
			batches.push(due.slice(i, i + MAX_PARALLEL_MONITORS))
		}
		for (const batch of batches) {
			const results = await Promise.allSettled(
				batch.map(async (monitor) => {
					const run = await runMonitor(monitor.id)
					if (run) console.log(describeRun(monitor, run))
					return run
				})
			)
			ran += results.filter((r) => r.status === 'fulfilled').length
			for (const result of results) {
				if (result.status === 'rejected') {
					const error = result.reason as Error
					console.error(`[monitors] ${error.message}`)
				}
			}
		}
	} finally {
		scheduler.checking = false
	}

	return ran
}

/**
 * Looks for due monitors every minute, inside the server process. OPENSEO_SCHEDULER=false
 * turns it off, for example on a second copy of OpenSEO that shares the same data folder.
 */
export function startScheduler(): void {
	if (process.env.OPENSEO_SCHEDULER === 'false' || scheduler.started) return
	scheduler.started = true
	const check = () => {
		runDueMonitors().catch((e: Error) => console.error(`[monitors] ${e.message}`))
	}
	setTimeout(check, 15_000).unref()
	setInterval(check, MINUTE).unref()
}
