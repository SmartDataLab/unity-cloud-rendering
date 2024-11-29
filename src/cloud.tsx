import React, { RefObject } from 'react';
import './App.css';
import {
    GamePlayer,
    ClientInfo,
    GamePlayerConfig,
    GameQuality,
    Framerate,
    KeyboardType,
    KeyboardLayout
} from 'unity-cloudrendering-js-sdk';
import { Cookies } from 'react-cookie';

// Define your component properties and state interfaces
interface AppProps { }

interface AppState {
    clientInfo: ClientInfo;
    playerRef: RefObject<HTMLDivElement>;
    playerButtonRef: RefObject<HTMLDivElement>;
    player: GamePlayer | null;
    gameStatus: GamePlayerStatus;
    rank: number;
    downloadProgress: number;
    extractProgress: number;
    delayData: Array<any>;
    avgDelay: {
        totalLatency: number;
        totalRes: number;
        count: number;
        inputLatency: number;
        resLatency: number;
    };
    rtcStatus: {
        latency: number;
        packetLostRate: number;
        qp: number;
    };
    cookies: Cookies;
    sessionId: string;
}

const sts = import.meta.env.VITE_STS || "default_smshtoken";
const serverUrl = import.meta.env.VITE_SERVER_URL || "https://cloudrendering.unity.cn";
const userId = import.meta.env.VITE_USER_ID || "1";
const email = import.meta.env.VITE_EMAIL || "xxx@qq.com";
const appId = import.meta.env.VITE_APP_ID || "xxxx"
GamePlayerConfig.setConfig(serverUrl, userId, email, sts);

enum GamePlayerStatus {
    READY,
    LOADING,
    PLAYING,
    STOPPED,
    QUEUING,
    RECONNECTING
}

const GameStatusText = [
    "准备完成",
    "加载中...",
    "游戏中...",
    "已停止",
    "分配中",
    "重连中..."
];

export default class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            clientInfo: {} as ClientInfo,
            playerRef: React.createRef<HTMLDivElement>(),
            playerButtonRef: React.createRef<HTMLDivElement>(),
            player: null,
            gameStatus: GamePlayerStatus.READY,
            rank: -1,
            downloadProgress: 0,
            extractProgress: 0,
            delayData: [],
            avgDelay: {
                totalLatency: 0,
                totalRes: 0,
                count: 0,
                inputLatency: 0,
                resLatency: 0
            },
            rtcStatus: {
                latency: 0,
                packetLostRate: 0,
                qp: 0
            },
            cookies: new Cookies(),
            sessionId: ''
        };
    }

    // Method to launch the game
    launchGame = () => {
        const { clientInfo, playerRef, cookies } = this.state;
        // const appId = ; // Replace with actual App ID
        if (appId) {
            clientInfo.appId = appId;
        }
        const launchParams = "-key1 value1 -key2 value2";
        if (launchParams) {
            clientInfo.launchParams = launchParams;
        }
        const sessionId = cookies.get(clientInfo.appId);
        if (sessionId) {
            clientInfo.rcSessionId = sessionId;
            clientInfo.isReconnect = true;
        }
        clientInfo.resolution = {
            width: Math.max(window.innerWidth, window.innerHeight),
            height: Math.min(window.innerWidth, window.innerHeight)
        };
        const customerAuthToken = 'xxxx';
        if (customerAuthToken) {
            clientInfo.customerAuthToken = customerAuthToken;
        }
        const orientation = 'landscape';
        if (orientation) {
            clientInfo.gameOrientation = orientation;
            if (orientation === 'portrait') {
                clientInfo.resolution = {
                    width: Math.min(window.innerWidth, window.innerHeight),
                    height: Math.max(window.innerWidth, window.innerHeight)
                };
            }
        }

        if (playerRef.current) {
            this.setStyle();
            const player = new GamePlayer(playerRef.current, clientInfo);
            this.addGameStatusListener();
            this.addNetQualityListener();
            player.launchGame();
            player.onStringMessageReceived('test', this.onReceiveStringMsg);
            player.onCaptureSuccess(this.onCaptureSuccessCallback);
            player.onInteractionTimeout(10, this.onInteractionTimeout);
            this.setState({ player, gameStatus: GamePlayerStatus.LOADING });
        }
    }

    // Placeholder methods that should be defined accordingly
    setStyle = () => {
        const { playerRef } = this.state;
        if (playerRef.current) {
            // Set desired styles for the player div
            playerRef.current.style.border = '1px solid #ccc';
        }
    }

    addGameStatusListener = () => {
        // Add your game status listener logic here
    }

    addNetQualityListener = () => {
        // Add network quality listener logic here
    }

    onReceiveStringMsg = (message: string) => {
        console.log("Received message:", message);
    }

    onCaptureSuccessCallback = () => {
        console.log("Capture was successful!");
    }

    onInteractionTimeout = () => {
        console.log("Interaction timeout occurred!");
    }

    render() {
        return (
            <div className="App">
                <h1>Game App</h1>
                <p>Status: {GameStatusText[this.state.gameStatus]}</p>
                <div ref={this.state.playerRef} style={{ width: '100%', height: '100%' }}>
                    {/* Game Player rendering area */}
                </div>
                <button
                    ref={this.state.playerButtonRef}
                    onClick={this.launchGame}
                >
                    Play
                </button>
            </div>
        );
    }
}