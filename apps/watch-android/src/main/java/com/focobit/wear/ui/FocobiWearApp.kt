package com.focobit.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.*
import com.focobit.wear.WearAction
import com.focobit.wear.WearUiState
import com.focobit.wear.WearTask

val FocobiPurple = Color(0xFF6C63FF)
val FocobiDark = Color(0xFF0F0E17)
val FocobiMuted = Color(0xFFA7A9BE)

@Composable
fun FocobiWearApp(state: WearUiState, onAction: (WearAction) -> Unit) {
    if (!state.isAuthenticated) {
        WaitingView()
        return
    }
    if (state.isLoading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(indicatorColor = FocobiPurple)
        }
        return
    }

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        item {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Nv.${state.level}",
                    color = FocobiPurple,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                )
                Text(
                    "🔥${state.streakDays}d",
                    color = Color.White,
                    fontSize = 12.sp,
                )
                Text(
                    "🪙${state.coins}",
                    color = FocobiMuted,
                    fontSize = 12.sp,
                )
            }
        }

        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .padding(vertical = 4.dp)
                    .background(Color(0xFF2A2A40))
            )
        }

        if (state.tasks.isEmpty()) {
            item {
                Text(
                    "✅ Todo listo",
                    color = Color.Green,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    fontSize = 13.sp,
                )
            }
        } else {
            items(state.tasks.take(5)) { task ->
                WearTaskItem(task = task, onComplete = { onAction(WearAction.CompleteTask(task.id)) })
            }
        }
    }
}

@Composable
fun WearTaskItem(task: WearTask, onComplete: () -> Unit) {
    Chip(
        modifier = Modifier.fillMaxWidth(),
        onClick = onComplete,
        colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF1A1A2E)),
        label = {
            Text(
                task.title,
                color = Color.White,
                fontSize = 12.sp,
                maxLines = 2,
            )
        },
        icon = {
            Text(
                when (task.priority) {
                    "urgent" -> "🔴"
                    "someday" -> "☁️"
                    else -> "🟡"
                },
                fontSize = 12.sp,
            )
        }
    )
}

@Composable
fun WaitingView() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("🧠", fontSize = 28.sp)
            Text("Focobit", color = FocobiPurple, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("Abre la app\nen Android", color = FocobiMuted, fontSize = 11.sp, textAlign = TextAlign.Center)
        }
    }
}
