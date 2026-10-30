/** Resources measured per audit. The rest are counted but not downloaded. */
const MAX_RESOURCES = 40
const RESOURCE_CONCURRENCY = 4
const RESOURCE_MAX_BYTES = 5 * 1024 * 1024
const RESOURCE_ORDER: ResourceType[] = ['stylesheet', 'script', 'font', 'image']
const BLOCKED_STATUSES = [401, 403, 429, 999]

async function measureResource(resource: ResourceInfo): Promise<ResourceInfo> {
	const isCode = resource.type === 'script' || resource.type === 'stylesheet'
	const options = {
		timeoutMs: 10_000,
		maxBytes: isCode ? RESOURCE_MAX_BYTES : 4 * 1024 * 1024,
		headers: { accept: '*/*' }
	}
	try {
		let res = await safeFetch(resource.url, { ...options, readBody: isCode })
		const length = Number(res.headers.get('content-length') || 0)
		// Images without a Content-Length have to be downloaded to be measured.
		if (!isCode && !length && res.status < 400) {
			res = await safeFetch(resource.url, { ...options, readBody: true })
		}
		const encoding = res.headers.get('content-encoding')
		const bytes = isCode || !length ? res.bytes : length

		return {
			...resource,
			status: res.status,
			bytes,
			transferBytes: length && encoding ? length : bytes,
			contentType: res.contentType,
			encoding,
			cacheControl: res.headers.get('cache-control'),
			expires: res.headers.get('expires'),
			timeMs: res.totalMs,
			minified:
				isCode && res.status < 400 && res.bytes > 0
					? looksMinified(res.body.toString('utf8'))
					: undefined
		}
	} catch (e) {
		return { ...resource, error: (e as Error).message }
	}
}

async function measureResources($: CheerioRoot, finalUrl: URL) {
	const { list, inlineScriptBytes, inlineStyleBytes } = discoverResources($, finalUrl)
	const picked = [...list]
		.sort((a, b) => RESOURCE_ORDER.indexOf(a.type) - RESOURCE_ORDER.indexOf(b.type))
		.slice(0, MAX_RESOURCES)

	return {
		resources: await mapLimit(picked, RESOURCE_CONCURRENCY, measureResource),
		resourcesDiscovered: list.length,
		inlineScriptBytes,
		inlineStyleBytes
	}
}
