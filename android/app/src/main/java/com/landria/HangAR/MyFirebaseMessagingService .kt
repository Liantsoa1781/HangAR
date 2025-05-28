package com.landria.HangAR;

import android.content.Intent;
import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d("FCM", "Message reçu");

        if (remoteMessage.getData().size() > 0) {
            Log.d("FCM", "Payload: " + remoteMessage.getData());

            String reservationId = remoteMessage.getData().get("reservationId");

            Intent intent = new Intent("com.landria.HangAR.FCM_RESERVATION_CLICK");
            intent.putExtra("reservationId", reservationId);

            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        }
    }
}