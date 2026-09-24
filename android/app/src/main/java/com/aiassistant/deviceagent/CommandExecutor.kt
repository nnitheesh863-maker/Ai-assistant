package com.aiassistant.deviceagent

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import org.json.JSONObject

class CommandExecutor(private val context: Context) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "assistant_alerts",
                "Assistant Alerts",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun execute(intentName: String, target: String?, params: JSONObject?): JSONObject {
        val result = JSONObject()

        when (intentName) {
            "OPEN_APP" -> {
                val pkg = target?.trim() ?: throw IllegalArgumentException("Package name missing")
                if (!Allowlist.isPackageAllowed(pkg)) {
                    throw SecurityException("App package '$pkg' is not in the mobile allowlist.")
                }

                val launchIntent = context.packageManager.getLaunchIntentForPackage(pkg)
                    ?: throw IllegalStateException("App '$pkg' is not installed on this device.")

                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(launchIntent)

                result.put("success", true)
                result.put("action", "OPEN_APP")
                result.put("package", pkg)
            }

            "OPEN_WEBSITE" -> {
                val url = target?.trim() ?: throw IllegalArgumentException("URL missing")
                if (!Allowlist.isUrlAllowed(url)) {
                    throw SecurityException("URL '$url' violates security policy.")
                }

                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(browserIntent)

                result.put("success", true)
                result.put("action", "OPEN_WEBSITE")
                result.put("url", url)
            }

            "SHOW_NOTIFICATION" -> {
                val title = params?.optString("title", "AI Assistant Alert") ?: "AI Assistant Alert"
                val message = params?.optString("message", target ?: "Notification") ?: "Notification"

                val notification = NotificationCompat.Builder(context, "assistant_alerts")
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setAutoCancel(true)
                    .build()

                notificationManager.notify(System.currentTimeMillis().toInt(), notification)

                result.put("success", true)
                result.put("action", "SHOW_NOTIFICATION")
            }

            "GET_DEVICE_STATUS" -> {
                val info = DeviceInfoHelper.getDeviceInfo(context)
                result.put("success", true)
                result.put("status", info)
            }

            else -> {
                throw UnsupportedOperationException("Intent '$intentName' is not supported on Android agent.")
            }
        }

        return result
    }
}
