package com.aiassistant.deviceagent
import android.content.Context
import org.json.JSONObject

class BatteryTelemetryHelper(private val context: Context) {
    fun getMetrics(): JSONObject = JSONObject().put("battery", 90)
}
