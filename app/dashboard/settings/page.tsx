import DataSyncPanel from "@/components/external/data-sync-panel"
import RealtimeStatus from "@/components/realtime/realtime-status"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure external integrations and real-time features</p>
        </div>
        <RealtimeStatus />
      </div>

      <DataSyncPanel />
    </div>
  )
}
