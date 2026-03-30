/**
 * @typedef {object} Star
 * @property {number} x
 * @property {number} y
 * @property {number} depth
 * @property {number} radius
 * @property {number} speed
 * @property {number} drift
 * @property {number} alpha
 * @property {number} twinkleSpeed
 * @property {number} twinkleOffset
 * @property {number} warmth
 */

/**
 * @typedef {object} Meteor
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} length
 * @property {number} alpha
 * @property {number} thickness
 */

/**
 * Set up the canvas starfield, its event handlers, and start its render loop.
 *
 * @returns {void}
 */
export function initStarfield() {
  const canvas = document.getElementById("starfield");
  const shell = document.querySelector(".starfield-shell");

  if (
    !(canvas instanceof HTMLCanvasElement) ||
    !(shell instanceof HTMLElement)
  ) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const cool = { r: 159, g: 232, b: 255 };
  const warm = { r: 255, g: 225, b: 195 };
  const stars = [];

  let width = 0;
  let height = 0;
  let meteors = [];
  let animationFrame = 0;
  let lastFrame = 0;
  let meteorTimer = 0;

  const REDUCED_MOTION_TIME = 0.35;
  const MAX_PIXEL_RATIO = 2;
  const MAX_FRAME_DELTA = 0.05;
  const POINTER_EASING = { base: 0.001, rate: 2.6 };
  const STAR_COUNT = { reducedDensity: 12600, density: 9200, min: 104, max: 224 };
  const STAR_TUNING = {
    radiusMin: 0.45,
    radiusMax: 1.7,
    radiusBase: 0.58,
    radiusDepth: 1.08,
    speedMin: 3,
    speedMax: 14,
    speedBase: 0.3,
    speedDepth: 0.72,
    driftMin: -3.5,
    driftMax: 3.5,
    driftBase: 0.18,
    driftDepth: 0.68,
    alphaMin: 0.16,
    alphaMax: 0.68,
    twinkleSpeedMin: 0.65,
    twinkleSpeedMax: 1.7,
    twinkleBase: 0.8,
    twinkleSwing: 0.2,
    bloomBlur: 7.25,
    bloomAlpha: 0.32,
    parallaxX: 10,
    parallaxY: 7,
    wrapMargin: 30,
    recycleMinY: 12,
    recycleMaxY: 56,
    highlightRadius: 1.5,
    highlightAlpha: 0.28,
    highlightWidth: 0.65,
    highlightScale: 1.8
  };
  const METEOR_TUNING = {
    angleMin: 0.85,
    angleMax: 1.15,
    speedMin: 360,
    speedMax: 540,
    spawnXMin: 0.12,
    spawnXMax: 0.88,
    spawnYMin: -0.18,
    spawnYMax: 0.24,
    lengthMin: 60,
    lengthMax: 108,
    alphaMin: 0.28,
    alphaMax: 0.46,
    thicknessMin: 0.95,
    thicknessMax: 1.45,
    initialDelayMin: 4.4,
    initialDelayMax: 7.6,
    delayMin: 4.7,
    delayMax: 8.4,
    fadeRate: 0.14,
    tailMidpoint: 0.3,
    tailMidAlpha: 0.58
  };

  /**
   * Return a random number inside the given range.
   *
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  const random = (min, max) => Math.random() * (max - min) + min;

  /**
   * Clamp a value so it cannot fall outside the supplied bounds.
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /**
   * Return the current animation time, or a fixed phase when reduced motion is enabled.
   *
   * @returns {number}
   */
  const getSceneTime = () =>
    motionQuery.matches ? REDUCED_MOTION_TIME : performance.now() * 0.001;

  /**
   * Derive a star count from the current canvas area.
   *
   * @param {number} sceneWidth
   * @param {number} sceneHeight
   * @returns {number}
   */
  const getStarCount = (sceneWidth, sceneHeight) =>
    clamp(
      Math.round(
        (sceneWidth * sceneHeight) /
          (motionQuery.matches ? STAR_COUNT.reducedDensity : STAR_COUNT.density),
      ),
      STAR_COUNT.min,
      STAR_COUNT.max,
    );

  context.lineCap = "round";

  /**
   * Create a star with randomized visual and movement properties.
   *
   * @param {number} [x=Math.random() * width]
   * @param {number} [y=Math.random() * height]
   * @returns {Star}
   */
  function createStar(x = Math.random() * width, y = Math.random() * height) {
    const depth = Math.random();

    return {
      x,
      y,
      depth,
      radius:
        random(STAR_TUNING.radiusMin, STAR_TUNING.radiusMax) *
        (STAR_TUNING.radiusBase + depth * STAR_TUNING.radiusDepth),
      speed:
        random(STAR_TUNING.speedMin, STAR_TUNING.speedMax) *
        (STAR_TUNING.speedBase + depth * STAR_TUNING.speedDepth),
      drift:
        random(STAR_TUNING.driftMin, STAR_TUNING.driftMax) *
        (STAR_TUNING.driftBase + depth * STAR_TUNING.driftDepth),
      alpha: random(STAR_TUNING.alphaMin, STAR_TUNING.alphaMax),
      twinkleSpeed: random(
        STAR_TUNING.twinkleSpeedMin,
        STAR_TUNING.twinkleSpeedMax,
      ),
      twinkleOffset: random(0, Math.PI * 2),
      warmth: Math.random(),
    };
  }

  /**
   * Create a meteor streak that starts near the top of the hero and travels diagonally.
   *
   * @returns {Meteor}
   */
  function createMeteor() {
    const angle = random(METEOR_TUNING.angleMin, METEOR_TUNING.angleMax);
    const speed = random(METEOR_TUNING.speedMin, METEOR_TUNING.speedMax);

    return {
      x: random(width * METEOR_TUNING.spawnXMin, width * METEOR_TUNING.spawnXMax),
      y: random(height * METEOR_TUNING.spawnYMin, height * METEOR_TUNING.spawnYMax),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: random(METEOR_TUNING.lengthMin, METEOR_TUNING.lengthMax),
      alpha: random(METEOR_TUNING.alphaMin, METEOR_TUNING.alphaMax),
      thickness: random(METEOR_TUNING.thicknessMin, METEOR_TUNING.thicknessMax),
    };
  }

  /**
   * Randomize the countdown to the next meteor.
   *
   * @param {boolean} [initial=false]
   * @returns {void}
   */
  function resetMeteorTimer(initial = false) {
    meteorTimer = initial
      ? random(METEOR_TUNING.initialDelayMin, METEOR_TUNING.initialDelayMax)
      : random(METEOR_TUNING.delayMin, METEOR_TUNING.delayMax);
  }

  /**
   * Add or trim stars to reach the desired population without rebuilding the scene.
   *
   * @param {number} targetCount
   * @returns {void}
   */
  function setStarCount(targetCount) {
    while (stars.length < targetCount) {
      stars.push(createStar());
    }

    stars.length = targetCount;
  }

  /**
   * Resize the canvas and rescale the current scene.
   *
   * @returns {void}
   */
  function rebuildScene() {
    const nextWidth = Math.floor(shell.clientWidth);
    const nextHeight = Math.floor(shell.clientHeight);

    if (!nextWidth || !nextHeight) {
      return;
    }

    const widthRatio = nextWidth / (width || nextWidth);
    const heightRatio = nextHeight / (height || nextHeight);

    width = nextWidth;
    height = nextHeight;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    for (const star of stars) {
      star.x *= widthRatio;
      star.y *= heightRatio;
    }

    if (motionQuery.matches) {
      meteors = [];
    } else {
      meteors = meteors.filter((meteor) => {
        meteor.x *= widthRatio;
        meteor.y *= heightRatio;

        return (
          meteor.x > -meteor.length &&
          meteor.x < width + meteor.length &&
          meteor.y > -meteor.length &&
          meteor.y < height + meteor.length
        );
      });
    }

    setStarCount(getStarCount(width, height));

    if (!meteorTimer) {
      resetMeteorTimer(true);
    }

    drawScene(0, getSceneTime());
    syncAnimation();
  }

  /**
   * Reuse an off-screen star by respawning it above the canvas.
   *
   * @param {Star} star
   * @returns {void}
   */
  function recycleStar(star) {
    Object.assign(
      star,
      createStar(random(0, width), -random(STAR_TUNING.recycleMinY, STAR_TUNING.recycleMaxY)),
    );
  }

  /**
   * Ease the live pointer state toward its target.
   *
   * @param {number} delta
   * @returns {void}
   */
  function updatePointer(delta) {
    const easing = 1 - Math.pow(POINTER_EASING.base, delta * POINTER_EASING.rate);
    pointer.x += (pointer.targetX - pointer.x) * easing;
    pointer.y += (pointer.targetY - pointer.y) * easing;
  }

  /**
   * Advance star positions for the current frame and recycle any that leave the field.
   *
   * @param {number} delta
   * @returns {void}
   */
  function updateStars(delta) {
    for (const star of stars) {
      star.x += star.drift * delta;
      star.y += star.speed * delta;

      if (star.x < -STAR_TUNING.wrapMargin) {
        star.x = width + STAR_TUNING.wrapMargin;
      } else if (star.x > width + STAR_TUNING.wrapMargin) {
        star.x = -STAR_TUNING.wrapMargin;
      }

      if (star.y > height + STAR_TUNING.wrapMargin) {
        recycleStar(star);
      }
    }
  }

  /**
   * Advance meteor motion, spawn new ones on schedule, and remove expired streaks.
   *
   * @param {number} delta
   * @returns {void}
   */
  function updateMeteors(delta) {
    meteorTimer -= delta;

    if (meteorTimer <= 0) {
      meteors.push(createMeteor());
      resetMeteorTimer();
    }

    meteors = meteors.filter((meteor) => {
      meteor.x += meteor.vx * delta;
      meteor.y += meteor.vy * delta;
      meteor.alpha -= delta * METEOR_TUNING.fadeRate;

      return (
        meteor.alpha > 0 &&
        meteor.x < width + meteor.length &&
        meteor.y < height + meteor.length
      );
    });
  }

  /**
   * Render all stars with glow, twinkle, and subtle warm/cool color variation.
   *
   * @param {number} time
   * @returns {void}
   */
  function drawStars(time) {
    for (const star of stars) {
      const flicker =
        STAR_TUNING.twinkleBase +
        Math.sin(time * star.twinkleSpeed + star.twinkleOffset) *
          STAR_TUNING.twinkleSwing;
      const alpha = star.alpha * flicker;
      const x = star.x + pointer.x * STAR_TUNING.parallaxX * star.depth;
      const y = star.y + pointer.y * STAR_TUNING.parallaxY * star.depth;
      const red = Math.round(cool.r + (warm.r - cool.r) * star.warmth);
      const green = Math.round(cool.g + (warm.g - cool.g) * star.warmth);
      const blue = Math.round(cool.b + (warm.b - cool.b) * star.warmth);

      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      context.shadowBlur = star.radius * STAR_TUNING.bloomBlur;
      context.shadowColor = `rgba(${red}, ${green}, ${blue}, ${alpha * STAR_TUNING.bloomAlpha})`;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();

      if (star.radius > STAR_TUNING.highlightRadius) {
        context.shadowBlur = 0;
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * STAR_TUNING.highlightAlpha})`;
        context.lineWidth = STAR_TUNING.highlightWidth;
        context.beginPath();
        context.moveTo(x - star.radius * STAR_TUNING.highlightScale, y);
        context.lineTo(x + star.radius * STAR_TUNING.highlightScale, y);
        context.moveTo(x, y - star.radius * STAR_TUNING.highlightScale);
        context.lineTo(x, y + star.radius * STAR_TUNING.highlightScale);
        context.stroke();
      }
    }

    context.shadowBlur = 0;
  }

  /**
   * Render every meteor as a short gradient trail aligned to its movement vector.
   *
   * @returns {void}
   */
  function drawMeteors() {
    for (const meteor of meteors) {
      const distance = Math.hypot(meteor.vx, meteor.vy) || 1;
      const tailX = meteor.x - (meteor.vx / distance) * meteor.length;
      const tailY = meteor.y - (meteor.vy / distance) * meteor.length;
      const gradient = context.createLinearGradient(
        meteor.x,
        meteor.y,
        tailX,
        tailY,
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
      gradient.addColorStop(
        METEOR_TUNING.tailMidpoint,
        `rgba(159, 232, 255, ${meteor.alpha * METEOR_TUNING.tailMidAlpha})`,
      );
      gradient.addColorStop(1, "rgba(159, 232, 255, 0)");

      context.strokeStyle = gradient;
      context.lineWidth = meteor.thickness;
      context.beginPath();
      context.moveTo(meteor.x, meteor.y);
      context.lineTo(tailX, tailY);
      context.stroke();
    }
  }

  /**
   * Update the scene state for this frame, then paint the full canvas.
   *
   * @param {number} delta
   * @param {number} time
   * @returns {void}
   */
  function drawScene(delta, time) {
    context.clearRect(0, 0, width, height);

    if (delta > 0) {
      updatePointer(delta);
      updateStars(delta);
      updateMeteors(delta);
    }

    drawStars(time);
    drawMeteors();
  }

  /**
   * Drive the animated version of the starfield with requestAnimationFrame.
   *
   * @param {number} frameTime
   * @returns {void}
   */
  function render(frameTime) {
    const delta = Math.min((frameTime - lastFrame) / 1000 || 0.016, MAX_FRAME_DELTA);
    lastFrame = frameTime;
    drawScene(delta, frameTime * 0.001);
    animationFrame = window.requestAnimationFrame(render);
  }

  /**
   * Restart animation cleanly, or render a single static frame for reduced motion.
   *
   * @returns {void}
   */
  function syncAnimation() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;

    if (motionQuery.matches) {
      lastFrame = 0;
      drawScene(0, getSceneTime());
      return;
    }

    lastFrame = performance.now();
    animationFrame = window.requestAnimationFrame(render);
  }

  /**
   * Convert pointer coordinates into normalized parallax targets.
   *
   * @param {PointerEvent} event
   * @returns {void}
   */
  function handlePointerMove(event) {
    const bounds = shell.getBoundingClientRect();

    if (!bounds.width || !bounds.height) {
      return;
    }

    pointer.targetX = clamp(
      (event.clientX - bounds.left) / bounds.width - 0.5,
      -0.5,
      0.5,
    );
    pointer.targetY = clamp(
      (event.clientY - bounds.top) / bounds.height - 0.5,
      -0.5,
      0.5,
    );
  }

  /**
   * Return parallax targets to neutral when the pointer leaves the hero area.
   *
   * @returns {void}
   */
  function resetPointer() {
    pointer.targetX = 0;
    pointer.targetY = 0;
  }

  // Pointer events only influence parallax, never the actual star positions.
  shell.addEventListener("pointermove", handlePointerMove, { passive: true });
  shell.addEventListener("pointerleave", resetPointer);

  if (typeof ResizeObserver === "function") {
    // Prefer observing the shell so layout-driven size changes are picked up too.
    new ResizeObserver(rebuildScene).observe(shell);
  } else {
    window.addEventListener("resize", rebuildScene, { passive: true });
  }

  // Pause the loop while the tab is hidden so time deltas do not spike on return.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      syncAnimation();
    }
  });

  // Rebuild when the user toggles reduced-motion so the scene shape still fits.
  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", rebuildScene);
  } else if (typeof motionQuery.addListener === "function") {
    motionQuery.addListener(rebuildScene);
  }

  // Initial sizing and first render happen here.
  rebuildScene();
}
