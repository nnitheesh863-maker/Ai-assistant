package com.aiassistant.deviceagent

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class WebSocketService : Service() {

    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(25, TimeUnit.SECONDS)
        .build()

    private lateinit var commandExecutor: CommandExecutor
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        commandExecutor = CommandExecutor(this)
        startForegroundServiceNotification()
    }

    private fun startForegroundServiceNotification() {
        val channelId = "agent_foreground_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Device Agent Background Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("AI Assistant Agent Active")
            .setContentText("Connected & awaiting authorized commands")
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .build()

        startForeground(101, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val wsUrl = intent?.getStringExtra("WS_URL") ?: "ws://10.0.2.2:5000/ws"
        val deviceToken = intent?.getStringExtra("DEVICE_TOKEN") ?: ""
        val deviceId = intent?.getStringExtra("DEVICE_ID") ?: "phone-android"

        if (!isRunning && deviceToken.isNotEmpty()) {
            connectWebSocket(wsUrl, deviceToken, deviceId)
            isRunning = true
        }

        return START_STICKY
    }

    private fun connectWebSocket(wsUrl: String, deviceToken: String, deviceId: String) {
        val request = Request.Builder().url(wsUrl).build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                // Authenticate Agent
                val authPayload = JSONObject().apply {
                    put("type", "AGENT_AUTH")
                    val payload = JSONObject().apply {
                        put("deviceToken", deviceToken)
                        put("deviceId", deviceId)
                        put("systemInfo", DeviceInfoHelper.getDeviceInfo(applicationContext))
                    }
                    put("payload", payload)
                }
                ws.send(authPayload.toString())
            }

            override fun onMessage(ws: WebSocket, text: String) {
                handleIncomingMessage(ws, text)
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                // Auto-reconnect after 5 seconds
                android.os.Handler(mainLooper).postDelayed({
                    if (isRunning) connectWebSocket(wsUrl, deviceToken, deviceId)
                }, 5000)
            }
        })
    }

    private fun handleIncomingMessage(ws: WebSocket, text: String) {
        try {
            val json = JSONObject(text)
            val type = json.optString("type")

            if (type == "EXECUTE_COMMAND") {
                val payload = json.getJSONObject("payload")
                val commandId = payload.getString("commandId")
                val intentName = payload.getString("intent")
                val target = payload.optString("target", null)
                val params = payload.optJSONObject("params")

                val startTime = System.currentTimeMillis()
                try {
                    val result = commandExecutor.execute(intentName, target, params)
                    val response = JSONObject().apply {
                        put("type", "COMMAND_EXECUTION_RESULT")
                        val resPayload = JSONObject().apply {
                            put("commandId", commandId)
                            put("status", "SUCCESS")
                            put("result", result)
                            put("executionTimeMs", System.currentTimeMillis() - startTime)
                        }
                        put("payload", resPayload)
                    }
                    ws.send(response.toString())
                } catch (e: Exception) {
                    val errorResponse = JSONObject().apply {
                        put("type", "COMMAND_EXECUTION_RESULT")
                        val resPayload = JSONObject().apply {
                            put("commandId", commandId)
                            put("status", "FAILED")
                            put("error", e.message)
                            put("executionTimeMs", System.currentTimeMillis() - startTime)
                        }
                        put("payload", resPayload)
                    }
                    ws.send(errorResponse.toString())
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        webSocket?.close(1000, "Service destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
