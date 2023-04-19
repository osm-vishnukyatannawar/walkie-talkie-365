import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  agoraEngine: any;
  isMuted = 1;
  isConnected = 0;

  options = {
    // Pass your App ID here.
    appId: environment.AGORA_APP_ID,
    // Set the channel name.
    channel: environment.CHANNEL_NAME,
    // Pass your temp token here.
    token: '',
    // Set the user ID.
    uid: 0,
  };

  channelParameters: any = {
    // A variable to hold a local audio track.
    localAudioTrack: null,
    // A variable to hold a remote audio track.
    remoteAudioTrack: null,
    // A variable to hold the remote user id.
    remoteUid: null,
  };

  constructor(private toastController: ToastController) {
    this.options.token = localStorage.getItem('token') || '';
  }

  ngOnInit() {
    console.log(this.isConnected);
    // Create an instance of the Agora Engine
    this.agoraEngine = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Listen for the "user-published" event to retrieve an AgoraRTCRemoteUser object.
    this.agoraEngine.on('user-published', async (user: { uid: string; audioTrack: any; }, mediaType: string) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event.
      await this.agoraEngine.subscribe(user, mediaType);
      await this.presentToast('subscribe success');

      // Subscribe and play the remote audio track.
      if (mediaType == 'audio') {
        this.channelParameters.remoteUid = user.uid;
        // Get the RemoteAudioTrack object from the AgoraRTCRemoteUser object.
        this.channelParameters.remoteAudioTrack = user.audioTrack;
        // Play the remote audio track.
        this.channelParameters.remoteAudioTrack.play();
      }

      // Listen for the "user-unpublished" event.
      this.agoraEngine.on('user-unpublished', async (user: { uid: string; }) => {
        await this.presentToast(user.uid + ' has left the channel');
      });
    });
  }

  async mute() {
    if (!this.isConnected) {
      await this.presentToast('Connect to join the conversation!');
      return;
    }

    this.isMuted = 1;
    // Mute the local audio.
    this.channelParameters.localAudioTrack.setEnabled(false);
  }

  async unMute() {
    if (!this.isConnected) {
      await this.presentToast('Connect to join the conversation!');
      return;
    }

    this.isMuted = 0;
    // Unmute the local audio.
    this.channelParameters.localAudioTrack.setEnabled(true);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'bottom'
    });

    await toast.present();
  }

  async onConnectDisconnect() {
    if (this.isConnected) {
      await this.leave();
      this.isConnected = 0;
    } else {
      this.isConnected = -1;
      await this.join();
      // Mute audio when user joins channel
      this.channelParameters.localAudioTrack.setEnabled(false);
      this.isConnected = 1;
    }
  }

  async leave() {
    // Destroy the local audio track.
    this.channelParameters.localAudioTrack.close();
    // Leave the channel
    await this.agoraEngine.leave();
    await this.presentToast('You left the channel');
    // Refresh the page for reuse
    window.location.reload();
  }

  async join() {
    // Join a channel.
    await this.agoraEngine.join(
      this.options.appId,
      this.options.channel,
      this.options.token,
      this.options.uid
    );

    // Create a local audio track from the microphone audio.
    this.channelParameters.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack({encoderConfig: "high_quality_stereo",});
    // Publish the local audio track in the channel.
    await this.agoraEngine.publish(this.channelParameters.localAudioTrack);
    await this.presentToast('Publish success!');
  }
}
