package com.aiassistant.deviceagent

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private val httpClient = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Simple programmatic UI layout
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(50, 80, 50, 50)
            setBackgroundColor(0xFF12141A.toInt())
        }

        val titleText = TextView(this).apply {
            text = "AI Device Agent"
            textSize = 24f
            setTextColor(0xFF38BDF8.toInt())
            setPadding(0, 0, 0, 40)
        }
        layout.addView(titleText)

        val serverInput = EditText(this).apply {
            hint = "Server URL (e.g., http://192.168.1.100:5000)"
            setText("http://10.0.2.2:5000")
            setTextColor(0xFFFFFFFF.toInt())
            setHintTextColor(0xFF888888.toInt())
        }
        layout.addView(serverInput)

        val codeInput = EditText(this).apply {
            hint = "6-Digit Pairing Code"
            setTextColor(0xFFFFFFFF.toInt())
            setHintTextColor(0xFF888888.toInt())
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
        }
        layout.addView(codeInput)

        val pairButton = Button(this).apply {
            text = "Pair and Connect Device"
            setBackgroundColor(0xFF0284C7.toInt())
            setTextColor(0xFFFFFFFF.toInt())
        }
        layout.addView(pairButton)

        val statusText = TextView(this).apply {
            text = "Status: Disconnected. Enter pairing code from web app."
            setTextColor(0xFFA1A1AA.toInt())
            setPadding(0, 30, 0, 0)
        }
        layout.addView(statusText)

        pairButton.setOnClickListener {
            val serverUrl = serverInput.text.toString().trim()
            val code = codeInput.text.toString().trim()

            if (code.length != 6) {
                Toast.makeText(this, "Please enter a valid 6-digit pairing code", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            statusText.text = "Pairing with server..."
            pairWithServer(serverUrl, code, statusText)
        }

        setContentView(layout)
    }

    private fun pairWithServer(serverUrl: String, code: String, statusText: TextView) {
        val payload = JSONObject().apply {
            put("code", code)
            put("name", "${Build.MANUFACTURER} ${Build.MODEL}")
            put("type", "phone")
            put("os", "Android ${Build.VERSION.RELEASE}")
            put("platform", "mobile")
        }

        val request = Request.Builder()
            .url("$serverUrl/api/devices/pair")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    statusText.text = "Error: Failed to connect to server: ${e.message}"
                    Toast.makeText(this@MainActivity, "Connection failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string() ?: ""
                try {
                    val json = JSONObject(body)
                    if (json.optBoolean("success")) {
                        val data = json.getJSONObject("data")
                        val token = data.getString("deviceToken")
                        val deviceId = data.getString("deviceId")

                        runOnUiThread {
                            statusText.text = "Status: Paired & Connected! Running Background Service."
                            Toast.makeText(this@MainActivity, "Paired successfully!", Toast.LENGTH_SHORT).show()

                            // Start background WebSocket service
                            val serviceIntent = Intent(this@MainActivity, WebSocketService::class.java).apply {
                                putExtra("WS_URL", "${serverUrl.replace("http", "ws")}/ws")
                                putExtra("DEVICE_TOKEN", token)
                                putExtra("DEVICE_ID", deviceId)
                            }
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                startForegroundService(serviceIntent)
                            } else {
                                startService(serviceIntent)
                            }
                        }
                    } else {
                        runOnUiThread {
                            statusText.text = "Pairing failed: ${json.optString("error")}"
                        }
                    }
                } catch (e: Exception) {
                    runOnUiThread {
                        statusText.text = "Error parsing response: ${e.message}"
                    }
                }
            }
        })
    }
}
