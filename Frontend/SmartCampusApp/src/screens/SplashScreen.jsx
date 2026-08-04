import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Rect } from "react-native-svg";

const NAVY = "#141C33";
const NAVY_DEEP = "#0B1226";
const WHITE = "#FFFFFF";
const BLUE = "#1E5FBF";
const GOLD = "#E4B45C";
const TEAL = "#5FD1C4";
const GRAY = "#6B7280";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SplashScreen = ({ onFinish }) => {
  // Icon entrance
  const iconScale = useRef(new Animated.Value(0.82)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Soft glow pulse behind the icon
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Wordmark
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(12)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Background merge: navy -> white, icon/text: gold/white -> blue/navy
  const mergeProgress = useRef(new Animated.Value(0)).current;

  // Bottom loader
  const loaderDots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    // NOTE: everything below uses useNativeDriver: false.
    // mergeProgress drives color interpolations (background/stroke/fill), which
    // the native driver can't animate — mixing native + JS driven values on
    // overlapping nodes is what caused the earlier crash, so we keep this
    // whole sequence on the JS driver for consistency. Fine for a splash screen.
    Animated.sequence([
      Animated.delay(100),

      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: false,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            Animated.timing(glowOpacity, {
              toValue: 0.55,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(glowScale, {
              toValue: 1.15,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        ]),
      ]),

      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.delay(80),

      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(wordTranslate, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),

      Animated.timing(dividerScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),

      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.delay(250),

      // Merge into the app's actual white/blue palette
      Animated.timing(mergeProgress, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),

      Animated.delay(150),
    ]).start(() => {
      Animated.loop(
        Animated.stagger(
          180,
          loaderDots.map((a) =>
            Animated.sequence([
              Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: false }),
              Animated.timing(a, { toValue: 0.3, duration: 350, useNativeDriver: false }),
            ])
          )
        )
      ).start();
      if (onFinish) onFinish();
    });
  }, []);

  const bgColorTop = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [NAVY, WHITE],
  });
  const arcColor = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [GOLD, BLUE],
  });
  const wordColor = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [WHITE, NAVY_DEEP],
  });
  const dividerColor = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [GOLD, BLUE],
  });
  const taglineColor = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [GRAY, BLUE],
  });
  const loaderColor = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [TEAL, BLUE],
  });
  const bgFadeOpacity = mergeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColorTop }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={NAVY_DEEP} />
            <Stop offset="100%" stopColor={NAVY} />
          </LinearGradient>
        </Defs>
        <AnimatedRect x="0" y="0" width="100%" height="100%" fill="url(#bg)" opacity={bgFadeOpacity} />
      </Svg>

      <View style={styles.center}>
        <Animated.View
          style={{
            position: "absolute",
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          }}
        >
          <Svg width="260" height="260">
            <Defs>
              <LinearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={TEAL} stopOpacity="0.35" />
                <Stop offset="100%" stopColor={TEAL} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Circle cx="130" cy="130" r="120" fill="url(#glow)" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={{
            opacity: iconOpacity,
            transform: [{ scale: iconScale }],
          }}
        >
          <Svg width="140" height="140" viewBox="0 0 512 512">
            <AnimatedPath
              d="M 339.6 355.6 A 130 130 0 1 1 339.6 156.4"
              fill="none"
              stroke={arcColor}
              strokeWidth="46"
              strokeLinecap="round"
            />
            <AnimatedCircle cx="339.6" cy="256" r="18" fill={TEAL} />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View
        style={{
          alignItems: "center",
          opacity: wordOpacity,
          transform: [{ translateY: wordTranslate }],
          marginTop: 28,
        }}
      >
        <Animated.Text style={[styles.wordmark, { color: wordColor }]}>CampIO</Animated.Text>
        <Animated.View
          style={[styles.divider, { backgroundColor: dividerColor, transform: [{ scaleX: dividerScale }] }]}
        />
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, color: taglineColor }]}>
          SMART CAMPUS
        </Animated.Text>
      </Animated.View>

      <View style={styles.loaderRow}>
        {loaderDots.map((a, i) => (
          <Animated.View key={i} style={[styles.loaderDot, { opacity: a, backgroundColor: loaderColor }]} />
        ))}
      </View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  center: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  wordmark: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  divider: {
    marginTop: 12,
    height: 2,
    width: 90,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
  },
  loaderRow: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    gap: 8,
  },
  loaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
});