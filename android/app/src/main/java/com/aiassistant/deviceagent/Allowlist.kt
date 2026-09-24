package com.aiassistant.deviceagent

object Allowlist {
    val ALLOWED_PACKAGES = setOf(
        "com.whatsapp",
        "com.google.android.youtube",
        "com.android.chrome",
        "com.google.android.apps.maps",
        "com.google.android.calculator",
        "com.android.camera",
        "com.android.settings",
        "com.spotify.music",
        "com.google.android.gm",
        "com.google.android.calendar",
        "com.google.android.deskclock",
        "com.google.android.apps.messaging",
        "com.google.android.dialer",
        "com.google.android.apps.photos"
    )

    fun isPackageAllowed(packageName: String): Boolean {
        return ALLOWED_PACKAGES.contains(packageName.trim())
    }

    fun isUrlAllowed(url: String): Boolean {
        return url.startsWith("http://") || url.startsWith("https://")
    }
}
