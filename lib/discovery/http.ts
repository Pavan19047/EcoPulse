export async function postJson<T>(url: string, body: any, opts?: { token?: string; timeoutMs?: number }): Promise<T> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), opts?.timeoutMs ?? 30000)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
      signal: ctrl.signal,
      cache: "no-store",
    })
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as T
  } finally {
    clearTimeout(t)
  }
}
