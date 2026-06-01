import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { initializeSocket } from './../utils/socket';

function Meeting() {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const params = useParams();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);

    const peerConnectionRef = useRef(null);
    const roomId = params.roomId;
    const iceCandidatesQueue = useRef([]);

    useEffect(() => {
        // Initialize Socket
        socketRef.current = initializeSocket();
        socketRef.current.connect();

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }, // Free Google STUN server to find public IPs
            ]
        };

        const startMeeting = async () => {
            // 1. Get local media stream first
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Tell the signaling server we want to join the room
                socketRef.current.emit('join-room', roomId);

            } catch (err) {
                console.error("Media access error:", err);
            }
        };


        // --- WebRTC Signaling Event Handlers ---

        // Peer Event A: A new user joined. We are the 'Host', so we create and send the Offer.
        socketRef.current.on('user-connected', async (userId) => {
            console.log("=== 'user-connected' received for target user ID:", userId);
            peerConnectionRef.current = createPeerConnection(userId, configuration);

            // Add our local video/audio tracks to the connection
            localStreamRef.current.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
            });

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            socketRef.current.emit('offer', { sdp: offer, target: userId });
        });

        socketRef.current.on('ice-candidate', async (data) => {
            if (!data.candidate) return;

            const pc = peerConnectionRef.current;

            // A robust guard: Check if remote description is set AND signaling state is stable
            const isRemoteDescriptionReady = pc && pc.remoteDescription && pc.remoteDescription.type && pc.signalingState === 'stable';

            if (isRemoteDescriptionReady) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.warn("Candidate failed to add immediately, fallback to queueing:", e.message);
                    // Fallback: If it still throws an unknown ufrag error, push it to the queue instead of breaking
                    if (!iceCandidatesQueue.current) iceCandidatesQueue.current = [];
                    iceCandidatesQueue.current.push(data.candidate);
                }
            } else {
                // Queue the candidate if the connection isn't completely stable yet
                if (!iceCandidatesQueue.current) iceCandidatesQueue.current = [];
                iceCandidatesQueue.current.push(data.candidate);
            }
        });

        // Helper function to process any queued candidates after description is set
        const processQueuedCandidates = async () => {
            if (iceCandidatesQueue.current && peerConnectionRef.current) {
                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift();
                    try {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding queued ice candidate", e);
                    }
                }
            }
        };

        // 2. Call the helper right after setRemoteDescription in your 'offer' listener
        socketRef.current.on('offer', async (data) => {
            peerConnectionRef.current = createPeerConnection(data.caller, configuration);

            localStreamRef.current.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
            });

            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

            // Flush the queue now that remote description is set!
            await processQueuedCandidates();

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            socketRef.current.emit('answer', { sdp: answer, target: data.caller });
        });

        // 3. Call the helper right after setRemoteDescription in your 'answer' listener
        socketRef.current.on('answer', async (data) => {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

            // Flush the queue here too!
            await processQueuedCandidates();
        });

        // Helper function to build the connection object and attach listeners
        const createPeerConnection = (targetUserId, config) => {
            const pc = new RTCPeerConnection(config);

            // Send our local network candidate to the other peer via socket
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit('ice-candidate', { candidate: event.candidate, target: targetUserId });
                }
            };

            // When the remote video/audio track arrives, attach it to our center video element
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            return pc;
        };


        startMeeting();

        // Cleanup on unmount
        return () => {
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };
    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="relative h-screen w-screen bg-slate-950 overflow-hidden font-sans text-white">

            {/* Top Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="bg-red-500 h-2.5 w-2.5 rounded-full animate-pulse" />
                    <h1 className="font-semibold text-sm md:text-base tracking-wide">AI Project Sync</h1>
                </div>
            </div>

            {/* Main Remote Stream (Background/Center) */}
            <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-24 left-6 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/50">
                    <p className="text-sm font-medium">Remote User</p>
                </div>
            </div>

            {/* Floating Local Stream (Bottom Right) */}
            <div className="absolute bottom-24 right-6 w-40 h-56 sm:w-48 sm:h-64 md:w-56 md:h-72 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 bg-slate-800 z-10 transition-all duration-300 hover:scale-[1.02]">
                {/* CHANGED: Always keep video tag mounted, control display state cleanly */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted // CRITICAL: Mute local playback to prevent feedback echo Loops
                    playsInline
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
                />

                {isVideoOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 gap-2">
                        <VideoOff size={28} />
                        <span className="text-xs">Your camera is off</span>
                    </div>
                )}
                {!isVideoOff && (
                    <div className="absolute bottom-3 left-3 bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                        You
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:px-8">
                <div className="flex items-center gap-4 mx-auto">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-xl transition-all duration-200 shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800'
                            }`}
                    >
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-xl transition-all duration-200 shadow-lg ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800'
                            }`}
                    >
                        {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>

                    <button className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 shadow-lg">
                        <PhoneOff size={22} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Meeting;