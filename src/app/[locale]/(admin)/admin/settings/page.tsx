"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"

export default function AdminSettingsPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform-wide settings
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic platform configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <label htmlFor="platform-name">Platform Name</label>
              <Input id="platform-name" defaultValue="Mousaheb" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="support-email">Support Email</label>
              <Input id="support-email" type="email" defaultValue="support@mousaheb.com" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label>Maintenance Mode</label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable access to all shops
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Settings</CardTitle>
            <CardDescription>
              Configure subscription plans and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="monthly-price">Monthly Price (USD)</label>
                <Input id="monthly-price" type="number" defaultValue="29.99" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="yearly-price">Yearly Price (USD)</label>
                <Input id="yearly-price" type="number" defaultValue="299.99" />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="trial-days">Trial Period (Days)</label>
              <Input id="trial-days" type="number" defaultValue="14" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label>Auto-suspend on Expiry</label>
                <p className="text-sm text-muted-foreground">
                  Automatically suspend shops when subscription expires
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure email and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label>Expiry Reminders</label>
                <p className="text-sm text-muted-foreground">
                  Send email reminders before subscription expires
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label>New Shop Notifications</label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when new shops sign up
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label>Low Stock Alerts</label>
                <p className="text-sm text-muted-foreground">
                  Alert shop owners about low stock items
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
