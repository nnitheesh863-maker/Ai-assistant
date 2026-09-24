package com.aiassistant.deviceagent

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import org.json.JSONObject

object DeviceInfoHelper {
    fun getDeviceInfo(context: Context): JSONObject {
        val info = JSONObject()
        info.put("model", "${Build.MANUFACTURER} ${Build.MODEL}")
        info.put("os", "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
        info.put("platform", "mobile")

        // Battery Info
        val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale) else -1

        val batteryObj = JSONObject()
        batteryObj.put("percentage", "$batteryPct%")
        info.put("battery", batteryObj)

        return info
    }
}
