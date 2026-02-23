package com.focobit.wear

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class WearUiState(
    val userId: String = "",
    val token: String = "",
    val isAuthenticated: Boolean = false,
    val tasks: List<WearTask> = emptyList(),
    val level: Int = 1,
    val xp: Int = 0,
    val streakDays: Int = 0,
    val coins: Int = 0,
    val isLoading: Boolean = false,
)

data class WearTask(
    val id: String,
    val title: String,
    val status: String,
    val energyRequired: String,
    val priority: String,
)

sealed class WearAction {
    data class CompleteTask(val taskId: String) : WearAction()
    object Refresh : WearAction()
}

class FocobiWearViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(WearUiState())
    val uiState: StateFlow<WearUiState> = _uiState

    private val projectId = "focobit-716b6"
    private val baseUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents"

    fun loadPersistedAuth(userId: String, token: String) {
        if (userId.isNotEmpty() && token.isNotEmpty()) {
            _uiState.value = _uiState.value.copy(
                userId = userId,
                token = token,
                isAuthenticated = true,
            )
            viewModelScope.launch { loadData() }
        }
    }

    fun onAction(action: WearAction) {
        when (action) {
            is WearAction.CompleteTask -> viewModelScope.launch { completeTask(action.taskId) }
            WearAction.Refresh -> viewModelScope.launch { loadData() }
        }
    }

    private suspend fun loadData() {
        _uiState.value = _uiState.value.copy(isLoading = true)
        val userId = _uiState.value.userId
        val token = _uiState.value.token

        try {
            val (tasks, gam) = withContext(Dispatchers.IO) {
                Pair(fetchTasks(userId, token), fetchGamProfile(userId, token))
            }
            _uiState.value = _uiState.value.copy(
                tasks = tasks,
                level = gam.optInt("level", 1),
                xp = gam.optInt("xp", 0),
                streakDays = gam.optInt("streakDays", 0),
                coins = gam.optInt("coins", 0),
                isLoading = false,
            )
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }

    private fun fetchTasks(userId: String, token: String): List<WearTask> {
        val url = URL("$baseUrl/users/$userId/tasks")
        val conn = url.openConnection() as HttpURLConnection
        conn.setRequestProperty("Authorization", "Bearer $token")
        val response = conn.inputStream.bufferedReader().readText()
        conn.disconnect()
        val json = JSONObject(response)
        val docs = json.optJSONArray("documents") ?: return emptyList()
        val tasks = mutableListOf<WearTask>()
        for (i in 0 until docs.length()) {
            val doc = docs.getJSONObject(i)
            val fields = doc.optJSONObject("fields") ?: continue
            val id = doc.getString("name").split("/").last()
            tasks.add(
                WearTask(
                    id = id,
                    title = fields.optJSONObject("title")?.optString("stringValue") ?: "",
                    status = fields.optJSONObject("status")?.optString("stringValue") ?: "pending",
                    energyRequired = fields.optJSONObject("energyRequired")?.optString("stringValue") ?: "medium",
                    priority = fields.optJSONObject("priority")?.optString("stringValue") ?: "normal",
                )
            )
        }
        return tasks.filter { it.status == "pending" }
    }

    private fun fetchGamProfile(userId: String, token: String): JSONObject {
        val url = URL("$baseUrl/users/$userId/gamification/profile")
        val conn = url.openConnection() as HttpURLConnection
        conn.setRequestProperty("Authorization", "Bearer $token")
        val response = conn.inputStream.bufferedReader().readText()
        conn.disconnect()
        val doc = JSONObject(response)
        val fields = doc.optJSONObject("fields") ?: return JSONObject()
        return JSONObject().apply {
            put("level", fields.optJSONObject("level")?.optString("integerValue")?.toIntOrNull() ?: 1)
            put("xp", fields.optJSONObject("xp")?.optString("integerValue")?.toIntOrNull() ?: 0)
            put("streakDays", fields.optJSONObject("streakDays")?.optString("integerValue")?.toIntOrNull() ?: 0)
            put("coins", fields.optJSONObject("coins")?.optString("integerValue")?.toIntOrNull() ?: 0)
        }
    }

    private suspend fun completeTask(taskId: String) {
        val userId = _uiState.value.userId
        val token = _uiState.value.token
        withContext(Dispatchers.IO) {
            val url = URL("$baseUrl/users/$userId/tasks/$taskId?updateMask.fieldPaths=status")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "PATCH"
            conn.setRequestProperty("Authorization", "Bearer $token")
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true
            val body = """{"fields":{"status":{"stringValue":"done"}}}"""
            conn.outputStream.write(body.toByteArray())
            conn.responseCode
            conn.disconnect()
        }
        _uiState.value = _uiState.value.copy(
            tasks = _uiState.value.tasks.filter { it.id != taskId }
        )
    }
}
