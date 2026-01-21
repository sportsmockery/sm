import 'expo-router/entry'
import TrackPlayer from 'react-native-track-player'
import { PlaybackService } from './services/trackPlayerService'

// Register the playback service for lock screen controls
TrackPlayer.registerPlaybackService(() => PlaybackService)
