import { DailyTransport } from "@pipecat-ai/daily-transport"
import { useState } from "react"

import { Console } from "@/components/pipecat/console/console"
import { Input } from "@/components/ui/input"

const DEFAULT_AGENT = "hindi-collections-agent"
const KEY_STORAGE = "pipecat-cloud-public-key"

// The key comes from the link (#key=pk_...), or from the last visit. A key in
// the link wins. It sits after the "#" so it is never sent to a server, and it
// is wiped from the URL bar once read so it does not show in a screen share.
function readInitialKey(): string {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const fromLink = hash.get("key")
  if (fromLink) {
    saveKey(fromLink)
    hash.delete("key")
    const rest = hash.toString()
    history.replaceState(
      null,
      "",
      window.location.pathname +
        window.location.search +
        (rest ? `#${rest}` : "")
    )
    return fromLink
  }
  try {
    return localStorage.getItem(KEY_STORAGE) ?? ""
  } catch {
    return ""
  }
}

function saveKey(key: string) {
  try {
    localStorage.setItem(KEY_STORAGE, key)
  } catch {
    // Storage can be blocked (private window). The key still works for this visit.
  }
}

const initialKey = readInitialKey()

// ?agent=<name> points the page at another Pipecat Cloud agent.
const agent =
  new URLSearchParams(window.location.search).get("agent") || DEFAULT_AGENT
const startUrl = `https://api.pipecat.daily.co/v1/public/${encodeURIComponent(agent)}/start`

export function App() {
  const [key, setKey] = useState(initialKey)

  return (
    <div className="h-dvh">
      <Console
        titleText="Hindi Collections Agent"
        transportType="daily"
        transportFactory={() => new DailyTransport()}
        startBotParams={{
          endpoint: startUrl,
          headers: new Headers({ Authorization: `Bearer ${key.trim()}` }),
          requestData: { createDailyRoom: true },
        }}
        // A phone-style call: audio only.
        noUserVideo
        noBotVideo
        noScreenControl
        headerSlot={
          <Input
            type="password"
            autoComplete="off"
            spellCheck={false}
            aria-label="Pipecat Cloud public API key"
            placeholder="Pipecat Cloud key (pk_...)"
            className="h-8 w-56"
            value={key}
            onChange={(event) => {
              setKey(event.target.value)
              saveKey(event.target.value)
            }}
          />
        }
      />
    </div>
  )
}

export default App
