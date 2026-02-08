import React, { useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  PanResponder,
} from "react-native";

const DPAD_SIZE = 140;
const DEAD_ZONE = 15;

export default function VirtualDPad() {
  const sendInput = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      const fn = (global as any).__questSendInput;
      if (fn) fn(type, payload);
    },
    []
  );

  const getDirection = useCallback(
    (x: number, y: number): string | null => {
      const cx = DPAD_SIZE / 2;
      const cy = DPAD_SIZE / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < DEAD_ZONE) return null;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // 8-directional
      if (angle >= -22.5 && angle < 22.5) return "right";
      if (angle >= 22.5 && angle < 67.5) return "down-right";
      if (angle >= 67.5 && angle < 112.5) return "down";
      if (angle >= 112.5 && angle < 157.5) return "down-left";
      if (angle >= 157.5 || angle < -157.5) return "left";
      if (angle >= -157.5 && angle < -112.5) return "up-left";
      if (angle >= -112.5 && angle < -67.5) return "up";
      if (angle >= -67.5 && angle < -22.5) return "up-right";

      return null;
    },
    []
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        const dir = getDirection(locationX, locationY);
        if (dir) {
          sendInput("MOVE", { direction: dir });
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        const dir = getDirection(locationX, locationY);
        if (dir) {
          sendInput("MOVE", { direction: dir });
        } else {
          sendInput("STOP");
        }
      },
      onPanResponderRelease: () => {
        sendInput("STOP");
      },
      onPanResponderTerminate: () => {
        sendInput("STOP");
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Visual D-Pad */}
      <View style={styles.dpad}>
        <View style={styles.row}>
          <View style={styles.empty} />
          <View style={[styles.btn, styles.btnUp]}>
            <View style={styles.arrow} />
          </View>
          <View style={styles.empty} />
        </View>
        <View style={styles.row}>
          <View style={[styles.btn, styles.btnLeft]}>
            <View style={[styles.arrow, { transform: [{ rotate: "-90deg" }] }]} />
          </View>
          <View style={styles.center} />
          <View style={[styles.btn, styles.btnRight]}>
            <View style={[styles.arrow, { transform: [{ rotate: "90deg" }] }]} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.empty} />
          <View style={[styles.btn, styles.btnDown]}>
            <View style={[styles.arrow, { transform: [{ rotate: "180deg" }] }]} />
          </View>
          <View style={styles.empty} />
        </View>
      </View>
    </View>
  );
}

const BTN_SIZE = DPAD_SIZE / 3;

const styles = StyleSheet.create({
  container: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
  },
  dpad: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
  },
  row: {
    flexDirection: "row",
    height: BTN_SIZE,
  },
  empty: {
    width: BTN_SIZE,
    height: BTN_SIZE,
  },
  center: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 4,
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  btnUp: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  btnDown: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  btnLeft: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  btnRight: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255,255,255,0.6)",
  },
});
