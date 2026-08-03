import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import Svg, {
  Circle,
  Path,
  Rect,
  Line,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width, height } = Dimensions.get("screen");

const NAVY = "#0B2545";
const BLUE = "#1E5FBF";
const LIGHT_BLUE = "#4F8FE0";
const GREEN = "#2E9E4C";
const GRAY = "#94A3B8";
const GOLD = "#F5C451";

// ---- Star field data (generated once, stable across renders) ----
const STAR_COUNT = 40;
const generateStars = () => {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.6,
      baseOpacity: Math.random() * 0.5 + 0.35,
      twinkleDuration: Math.random() * 1800 + 1200,
      delay: Math.random() * 2000,
    });
  }
  return stars;
};

const SHOOTING_STARS = [
  { startX: width * 0.15, startY: height * 0.18, len: 90, angle: 25, delay: 900 },
  { startX: width * 0.7, startY: height * 0.32, len: 70, angle: -20, delay: 1500 },
  { startX: width * 0.35, startY: height * 0.6, len: 60, angle: 30, delay: 2100 },
];

const SplashScreen = ({ onFinish }) => {
  const stars = useMemo(() => generateStars(), []);

  // Stage 1: dot
  const dotScale = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // Stage 2: soft silhouette build (bloom behind icon)
  const bloomScale = useRef(new Animated.Value(0.3)).current;
  const bloomOpacity = useRef(new Animated.Value(0)).current;
  const iconRoughOpacity = useRef(new Animated.Value(0)).current;
  const iconRoughScale = useRef(new Animated.Value(0.75)).current;

  // Stage 3: arc draws, dots come alive, icon sharpens, cap drops
  const arcDraw = useRef(new Animated.Value(0)).current;
  const arcOpacity = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;
  const iconSharpOpacity = useRef(new Animated.Value(0)).current;
  const capDrop = useRef(new Animated.Value(-14)).current;
  const capOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // Stage 4: settle + wordmark
  const iconSettleScale = useRef(new Animated.Value(1.08)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(10)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.4)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  // Stage 5: fade to branded background + color-swap icon/text + loader
  const bgOverlayOpacity = useRef(new Animated.Value(0)).current;
  const whiteVariantStep = useRef(new Animated.Value(0)).current; // step function, not crossfade
  const loaderDots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  // Star field animation
  const starTwinkles = useRef(stars.map(() => new Animated.Value(0))).current;
  const shootingStarProgress = useRef(SHOOTING_STARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Start — dot appears
      Animated.spring(dotScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.delay(120),

      // 2. Build — dot blooms outward into a soft rough silhouette
      Animated.parallel([
        Animated.timing(dotOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(bloomOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bloomScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconRoughOpacity, {
          toValue: 0.55,
          duration: 550,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(iconRoughScale, {
          toValue: 1,
          duration: 600,
          delay: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // 3. Grow — arc draws, dots come alive, icon sharpens, cap drops in, ring spins up
      Animated.parallel([
        Animated.timing(arcOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(arcDraw, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.stagger(
          90,
          dotsAnim.map((a) =>
            Animated.spring(a, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true })
          )
        ),
        // Step change (not a fade) — rough layer snaps off exactly as sharp layer snaps on
        Animated.timing(iconRoughOpacity, {
          toValue: 0,
          duration: 1,
          delay: 240,
          useNativeDriver: true,
        }),
        Animated.timing(iconSharpOpacity, {
          toValue: 1,
          duration: 260,
          delay: 240,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(capOpacity, {
            toValue: 1,
            duration: 400,
            delay: 300,
            useNativeDriver: true,
          }),
          Animated.spring(capDrop, {
            toValue: 0,
            friction: 5,
            tension: 60,
            delay: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(ringOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(ringRotate, {
              toValue: 1,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // 4. Settle — icon eases to rest scale, wordmark + tagline reveal, radial pulse
      Animated.parallel([
        Animated.timing(iconSettleScale, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseOpacity, {
              toValue: 0.5,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(pulseScale, {
              toValue: 1.9,
              duration: 700,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(wordmarkOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(wordmarkTranslate, {
              toValue: 0,
              duration: 500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(dividerScale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.delay(400),

      // 5. Ready — fade to branded background, icon/text step to white variant
      Animated.parallel([
        Animated.timing(bgOverlayOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(whiteVariantStep, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.loop(
        Animated.stagger(
          180,
          loaderDots.map((a) =>
            Animated.sequence([
              Animated.timing(a, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.timing(a, { toValue: 0.3, duration: 350, useNativeDriver: true }),
            ])
          )
        )
      ).start();
      if (onFinish) onFinish();
    });

    // Star twinkle loops — start once background begins fading in
    stars.forEach((star, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(starTwinkles[i], {
            toValue: 1,
            duration: star.twinkleDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(starTwinkles[i], {
            toValue: 0.2,
            duration: star.twinkleDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Shooting stars — fire once each, staggered
    SHOOTING_STARS.forEach((s, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(s.delay + 1400),
          Animated.timing(shootingStarProgress[i], {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shootingStarProgress[i], {
            toValue: 0,
            duration: 1,
            useNativeDriver: true,
          }),
          Animated.delay(4500 + i * 900),
        ])
      ).start();
    });
  }, []);

  const arcDashOffset = arcDraw.interpolate({ inputRange: [0, 1], outputRange: [260, 0] });
  const ringSpin = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "220deg"] });

  // Step function instead of multiply-crossfade — avoids the "both layers semi-visible" blur
  const navyIconOpacity = whiteVariantStep.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [1, 1, 0, 0],
  });
  const whiteIconOpacity = whiteVariantStep.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      {/* Stage 5 — branded navy overlay, true full-screen fill */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: bgOverlayOpacity, backgroundColor: NAVY }]}
      >
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="brandBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0B2545" />
              <Stop offset="100%" stopColor="#173B7A" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#brandBg)" />
        </Svg>

        {/* Starfield */}
        {stars.map((star, i) => (
          <Animated.View
            key={star.id}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y,
              width: star.r * 2,
              height: star.r * 2,
              borderRadius: star.r,
              backgroundColor: "#FFFFFF",
              opacity: Animated.multiply(starTwinkles[i], star.baseOpacity),
            }}
          />
        ))}

        {/* Shooting stars */}
        {SHOOTING_STARS.map((s, i) => {
          const translate = shootingStarProgress[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, s.len * 2.4],
          });
          const fade = shootingStarProgress[i].interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, 1, 1, 0],
          });
          return (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                left: s.startX,
                top: s.startY,
                width: s.len,
                height: 2,
                borderRadius: 1,
                backgroundColor: "#FFFFFF",
                opacity: fade,
                transform: [
                  { rotate: `${s.angle}deg` },
                  { translateX: translate },
                ],
              }}
            />
          );
        })}
      </Animated.View>

      <View style={styles.logoStack}>
        {/* Stage 1 — dot */}
        <Animated.View
          style={[styles.dot, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]}
        />

        {/* Stage 2 — soft bloom behind the icon */}
        <Animated.View
          style={{ position: "absolute", opacity: bloomOpacity, transform: [{ scale: bloomScale }] }}
        >
          <Svg width="220" height="220">
            <Defs>
              <RadialGradient id="bloomGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={BLUE} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="110" cy="110" r="105" fill="url(#bloomGrad)" />
          </Svg>
        </Animated.View>

        {/* Rough low-opacity icon silhouette during "Build" — fully retired by step function above */}
        <Animated.View
          style={{ position: "absolute", opacity: iconRoughOpacity, transform: [{ scale: iconRoughScale }] }}
        >
          <IconMark tint={NAVY} tintSecondary={BLUE} size={200} />
        </Animated.View>

        {/* Rotating accent ring while icon assembles */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: ringOpacity,
            transform: [{ rotate: ringSpin }],
          }}
        >
          <Svg width="240" height="240">
            <Circle
              cx="120"
              cy="120"
              r="112"
              stroke={GOLD}
              strokeWidth="2.5"
              strokeDasharray="14 18"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </Svg>
        </Animated.View>

        {/* Radial pulse ring when wordmark lands */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        >
          <Svg width="220" height="220">
            <Circle cx="110" cy="110" r="100" stroke={LIGHT_BLUE} strokeWidth="1.5" fill="none" />
          </Svg>
        </Animated.View>

        {/* Scattered tech dots, top-left of icon */}
        {[
          { x: -78, y: -18, size: 7 },
          { x: -66, y: -34, size: 6 },
          { x: -54, y: -50, size: 9 },
          { x: -40, y: -64, size: 6 },
          { x: -26, y: -76, size: 5 },
        ].map((d, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: d.size,
              height: d.size,
              borderRadius: 2,
              backgroundColor: i % 2 === 0 ? BLUE : GREEN,
              left: 110 + d.x,
              top: 110 + d.y,
              opacity: dotsAnim[i],
              transform: [{ scale: dotsAnim[i] }],
            }}
          />
        ))}

        {/* Green arc sweeping above the icon, drawn on */}
        <Animated.View style={{ position: "absolute", opacity: arcOpacity }}>
          <Svg width="220" height="220">
            <AnimatedPath
              d="M 45 78 A 80 80 0 0 1 175 78"
              stroke={GREEN}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="260"
              strokeDashoffset={arcDashOffset}
            />
          </Svg>
        </Animated.View>

        {/* Sharp icon — NAVY version (crisp, higher internal resolution) */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: Animated.multiply(iconSharpOpacity, navyIconOpacity),
            transform: [{ scale: iconSettleScale }],
          }}
        >
          <IconMark tint={NAVY} tintSecondary={BLUE} size={200} capDrop={capDrop} capOpacity={capOpacity} crisp />
        </Animated.View>

        {/* Sharp icon — WHITE version (crisp, higher internal resolution) */}
        <Animated.View
          style={{
            position: "absolute",
            opacity: Animated.multiply(iconSharpOpacity, whiteIconOpacity),
            transform: [{ scale: iconSettleScale }],
          }}
        >
          <IconMark tint="#FFFFFF" tintSecondary="#FFFFFF" size={200} capDrop={capDrop} capOpacity={capOpacity} crisp accentGreen={GREEN} />
        </Animated.View>
      </View>

      {/* Wordmark + tagline — NAVY/GREEN version */}
      <Animated.View
        style={{
          alignItems: "center",
          opacity: Animated.multiply(wordmarkOpacity, navyIconOpacity),
          transform: [{ translateY: wordmarkTranslate }],
          marginTop: 18,
        }}
      >
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmarkBold, { color: NAVY }]}>SMART </Text>
          <Text style={[styles.wordmarkBold, { color: GREEN }]}>CAMPUS</Text>
        </View>
        <Animated.View style={[styles.dividerLine, { backgroundColor: BLUE, transform: [{ scaleX: dividerScale }] }]} />
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, color: GRAY }]}>
          LEARN  •  CONNECT  •  GROW
        </Animated.Text>
      </Animated.View>

      {/* Wordmark + tagline — WHITE version */}
      <Animated.View
        style={{
          position: "absolute",
          alignItems: "center",
          opacity: Animated.multiply(wordmarkOpacity, whiteIconOpacity),
          transform: [{ translateY: wordmarkTranslate }],
          marginTop: 18,
          top: 240,
        }}
      >
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmarkBold, { color: "#FFFFFF" }]}>SMART </Text>
          <Text style={[styles.wordmarkBold, { color: "#8FE0A8" }]}>CAMPUS</Text>
        </View>
        <Animated.View style={[styles.dividerLine, { backgroundColor: "#FFFFFF", transform: [{ scaleX: dividerScale }] }]} />
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, color: "#CBD5E1" }]}>
          LEARN  •  CONNECT  •  GROW
        </Animated.Text>
      </Animated.View>

      {/* Stage 5 — loading dots */}
      <Animated.View style={[styles.loaderRow, { opacity: bgOverlayOpacity }]}>
        {loaderDots.map((a, i) => (
          <Animated.View key={i} style={[styles.loaderDot, { opacity: a }]} />
        ))}
      </Animated.View>
    </View>
  );
};

const IconMark = ({ tint, tintSecondary, capDrop, capOpacity, size = 200, crisp, accentGreen }) => {
  const CapGroup = capDrop ? Animated.View : View;
  const capGroupStyle = capDrop
    ? { transform: [{ translateY: capDrop }], opacity: capOpacity }
    : undefined;

  // "crisp" renders at 2x internal viewBox resolution for sharper edges when scaled,
  // and uses a slightly heavier stroke so it doesn't look thin/washed out on white icon variant.
  const vb = crisp ? 400 : 200;
  const s = crisp ? 2 : 1;
  const strokeW = crisp ? "3" : "1.5";
  const tasselColor = accentGreen || tintSecondary;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}>
      <Path
        d={`M${20*s} ${148*s} Q ${60*s} ${128*s} ${100*s} ${142*s} Q ${140*s} ${128*s} ${180*s} ${148*s} L ${180*s} ${158*s} Q ${140*s} ${140*s} ${100*s} ${154*s} Q ${60*s} ${140*s} ${20*s} ${158*s} Z`}
        fill={tint}
      />
      <Path
        d={`M${22*s} ${144*s} Q ${60*s} ${126*s} ${100*s} ${138*s} L ${100*s} ${146*s} Q ${60*s} ${134*s} ${22*s} ${152*s} Z`}
        fill={tintSecondary}
        opacity="0.9"
      />
      <Path
        d={`M${178*s} ${144*s} Q ${140*s} ${126*s} ${100*s} ${138*s} L ${100*s} ${146*s} Q ${140*s} ${134*s} ${178*s} ${152*s} Z`}
        fill={tintSecondary}
        opacity="0.9"
      />
      <Rect x={46*s} y={98*s} width={26*s} height={46*s} fill={tintSecondary} rx={2*s} />
      <Rect x={128*s} y={98*s} width={26*s} height={46*s} fill={tintSecondary} rx={2*s} />
      <Rect x={52*s} y={108*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={62*s} y={108*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={52*s} y={122*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={134*s} y={108*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={144*s} y={108*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={134*s} y={122*s} width={6*s} height={8*s} fill="#EAF2FF" />
      <Rect x={78*s} y={80*s} width={44*s} height={64*s} fill={tint} rx={3*s} />
      <Path d={`M${92*s} ${144*s} L${92*s} ${118*s} A ${8*s} ${8*s} 0 0 1 ${108*s} ${118*s} L${108*s} ${144*s} Z`} fill="#EAF2FF" />
      <Circle cx={100*s} cy={98*s} r={9*s} fill="#EAF2FF" />
      <Line x1={100*s} y1={98*s} x2={100*s} y2={92*s} stroke={tint} strokeWidth={strokeW} />
      <Line x1={100*s} y1={98*s} x2={104*s} y2={99*s} stroke={tint} strokeWidth={strokeW} />
      <CapGroup style={capGroupStyle}>
        <Path d={`M${60*s} ${68*s} L${100*s} ${50*s} L${140*s} ${68*s} L${100*s} ${86*s} Z`} fill={tint} />
        <Path d={`M${100*s} ${86*s} L${100*s} ${96*s} Q ${100*s} ${102*s} ${92*s} ${102*s} Q ${84*s} ${102*s} ${84*s} ${96*s}`} fill="none" stroke={tint} strokeWidth={crisp ? "6" : "3"} />
        <Circle cx={84*s} cy={96*s} r={3*s} fill={tasselColor} />
        <Rect x={98*s} y={86*s} width={4*s} height={4*s} fill={tasselColor} />
      </CapGroup>
    </Svg>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  logoStack: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1E5FBF",
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  wordmarkBold: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dividerLine: {
    marginTop: 10,
    height: 2,
    width: 160,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  loaderRow: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    gap: 8,
  },
  loaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
  },
});