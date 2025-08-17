import { postJson } from "./http"

export interface MoleculeLike { name?: string; smiles?: string; formula?: string }

export async function providerIdentify(query: string) {
  const url = process.env.DISCOVERY_IDENTIFY_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { query }, { token })
    return res
  } catch {
    return null
  }
}

export async function providerDocking(molecule: MoleculeLike, proteins?: string[]) {
  const url = process.env.DISCOVERY_DOCK_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { molecule, proteins }, { token })
    return res
  } catch {
    return null
  }
}

export async function providerAdmet(molecule: MoleculeLike) {
  const url = process.env.DISCOVERY_ADMET_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { molecule }, { token })
    return res
  } catch {
    return null
  }
}

export async function providerSynthesis(molecule: MoleculeLike) {
  const url = process.env.DISCOVERY_SYNTH_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { molecule }, { token })
    return res
  } catch {
    return null
  }
}

export async function providerExplain(molecule: MoleculeLike, task?: string) {
  const url = process.env.DISCOVERY_EXPLAIN_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { molecule, task }, { token })
    return res
  } catch {
    return null
  }
}

export async function providerGenerate(targetDisease?: string, constraints?: any, method?: string) {
  const url = process.env.DISCOVERY_GENERATE_URL
  const token = process.env.DISCOVERY_API_TOKEN
  if (!url) return null
  try {
    const res = await postJson<any>(url, { targetDisease, constraints, method }, { token })
    return res
  } catch {
    return null
  }
}
