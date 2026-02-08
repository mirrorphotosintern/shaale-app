import React, { useRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useQuestStore } from "../../stores/quest-store";

const GAME_URL =
  "https://ufmwnqllgqrfkdfahptv.supabase.co/storage/v1/object/public/game-assets/game.html";

interface GameWebViewProps {
  onReady?: () => void;
}

export default function GameWebView({ onReady }: GameWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const {
    setLoaded,
    setDialog,
    learnWord,
    setPosition,
    addXp,
    setCharacter,
    setArea,
  } = useQuestStore();

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case "LOADED":
            setLoaded(true);
            onReady?.();
            break;
          case "CHARACTER_SELECTED":
            setCharacter(data.payload.character);
            setArea("house");
            break;
          case "AREA_CHANGE":
            setArea(data.payload.to);
            break;
          case "DIALOG":
            setDialog(data.payload);
            break;
          case "WORD_LEARNED":
            learnWord({
              kannada: data.payload.kannada,
              english: data.payload.english || "",
              source: data.payload.source || "npc",
              learnedAt: Date.now(),
            });
            addXp(10);
            break;
          case "POSITION":
            setPosition(data.payload);
            break;
          case "SCENE_READY":
            break;
        }
      } catch (e) {
        console.warn("Invalid message from game:", e);
      }
    },
    [
      setLoaded,
      setDialog,
      learnWord,
      setPosition,
      addXp,
      setCharacter,
      setArea,
      onReady,
    ]
  );

  // Send input command to the Phaser game
  const sendInput = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (webViewRef.current) {
        const msg = JSON.stringify({ type, ...payload });
        webViewRef.current.injectJavaScript(
          `window.gameInput(${msg}); true;`
        );
      }
    },
    []
  );

  // Store sendInput globally so other components can access it
  React.useEffect(() => {
    (global as any).__questSendInput = sendInput;
    return () => {
      delete (global as any).__questSendInput;
    };
  }, [sendInput]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: GAME_URL }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
