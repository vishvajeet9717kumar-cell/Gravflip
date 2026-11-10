import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ALL_LEVELS, getLevelById } from './game/levels';
import { updatePhysics, FIXED_DT, StageEntities } from './game/physics';
import { renderGame, StageRenderEntities } from './game/render';
import { getWorldTheme } from './game/themes';
import { audio } from './game/audio';
import { getSkinById } from './game/skins';
import {
  loadGameData,
  saveLevelResult,
  saveSkinPurchase,
  equipSkin as persistEquipSkin,
  claimDailyReward,
  saveTotalCrystals,
  GameSaveData,
} from './game/storage';
import {
  Player,
  InputState,
  Particle,
  GameStatus,
  Crystal,
  Portal,
  Shockwave,
  FloatingText,
  Platform,
  LevelData,
  AppScreen,
  GameMode,
  Achievement,
  GhostRun,
} from './game/types';
import { GhostRecorder, saveGhostRun, loadGhostRun, getGhostAtTime } from './game/ghost';
import { DeathHintTracker, getLevelHintWaypoints, HintWaypoint } from './game/hint';
import { loadAchievements, trackAchievement } from './game/achievements';
import { getEndlessHighScore, saveEndlessHighScore, buildEndlessLevel } from './game/endless';
import { getDailyChallenge, saveDailyChallengeCompletion } from './game/daily';
import { saveTimeAttackRecord } from './game/timeattack';
import { TouchControls } from './components/TouchControls';
import { RotateOverlay } from './components/RotateOverlay';
import { GameHUD } from './components/GameHUD';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { SkinsModal } from './components/SkinsModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { TimeAttackModal } from './components/TimeAttackModal';
import { EndlessHUD } from './components/EndlessHUD';
import { OfflineIndicator } from './components/OfflineIndicator';
import { registerPWA } from './pwaManager';
import { PWAUpdateToast } from './components/PWAUpdateToast';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // PWA Update State
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  // App Screen & Game Mode State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MAIN_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('STANDARD');
  const gameModeRef = useRef<GameMode>('STANDARD');
  gameModeRef.current = gameMode;

  // Persistent Save Data State
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameData());
  const equippedSkin = useMemo(
    () => getSkinById(saveData.equippedSkinId),
    [saveData.equippedSkinId]
  );

  // Responsive Orientation State
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [status, setStatus] = useState<GameStatus>('PLAYING');

  // Active Level State (Levels 1 to 20)
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const currentLevel: LevelData = getLevelById(currentLevelId);

  // World Theme State (World 1: Green, World 2: Cyan/Blue, World 3: Red/Orange, World 4: Purple/Pink)
  const [currentWorld, setCurrentWorld] = useState<number>(currentLevel.world || 1);
  const theme = getWorldTheme(currentWorld);

  // Synchronize world theme whenever level changes
  useEffect(() => {
    setCurrentWorld(currentLevel.world || 1);
    audio.setWorld(currentLevel.world || 1);
  }, [currentLevelId, currentLevel.world]);

  // HUD stats
  const [crystalsCollected, setCrystalsCollected] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [currentGravity, setCurrentGravity] = useState(currentLevel.initialGravity);

  // Stage C & D HUD States
  const [hasStarCrystal, setHasStarCrystal] = useState<boolean>(false);
  const [activeCombo, setActiveCombo] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [extraFlips, setExtraFlips] = useState<number>(0);
  const [timeSlowTimer, setTimeSlowTimer] = useState<number>(0);
  const [chaosTimer, setChaosTimer] = useState<number | undefined>(currentLevel.chaosGravityInterval);

  // Level completion result for 3-star lighting fanfare
  const [levelResult, setLevelResult] = useState<{
    starsEarned: number;
    isNewBestTime: boolean;
    newCrystalsAdded: number;
    starCrystalFound: boolean;
  }>({
    starsEarned: 1,
    isNewBestTime: false,
    newCrystalsAdded: 0,
    starCrystalFound: false,
  });

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState<boolean>(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState<boolean>(false);
  const [isTimeAttackOpen, setIsTimeAttackOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  // Stage E: Ghost Run State
  const [ghostEnabled, setGhostEnabled] = useState<boolean>(true);
  const [currentGhostRun, setCurrentGhostRun] = useState<GhostRun | null>(() => loadGhostRun(currentLevel.id));
  const ghostRecorderRef = useRef<GhostRecorder>(new GhostRecorder());

  // Stage E: Death Hint Tracker State
  const deathTrackerRef = useRef<DeathHintTracker>(new DeathHintTracker());
  const [deathCount, setDeathCount] = useState<number>(0);
  const [hintAvailable, setHintAvailable] = useState<boolean>(false);
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [hintWaypoints, setHintWaypoints] = useState<HintWaypoint[]>(() =>
    getLevelHintWaypoints(currentLevel.spawn, currentLevel.portal, currentLevel.platforms, currentLevel.checkpoints)
  );

  // Stage E: Endless Mode State
  const [endlessChunkIndex, setEndlessChunkIndex] = useState<number>(0);
  const endlessChunkIndexRef = useRef<number>(0);
  const [endlessDistance, setEndlessDistance] = useState<number>(0);
  const endlessDistanceRef = useRef<number>(0);
  const [endlessCrystals, setEndlessCrystals] = useState<number>(0);
  const endlessCrystalsRef = useRef<number>(0);
  const [endlessHighScore, setEndlessHighScore] = useState<number>(() => getEndlessHighScore());
  const [isEndlessGameOver, setIsEndlessGameOver] = useState<boolean>(false);

  // Stage E: Daily Challenge Info
  const [dailyInfo, setDailyInfo] = useState(() => getDailyChallenge());

  // Audio & Accessibility Settings State
  const initialSettings = audio.getSettings();
  const [sfxMuted, setSfxMuted] = useState<boolean>(initialSettings.sfxMuted);
  const [musicMuted, setMusicMuted] = useState<boolean>(initialSettings.musicMuted);
  const [sfxVolume, setSfxVolume] = useState<number>(initialSettings.sfxVolume);
  const [musicVolume, setMusicVolume] = useState<number>(initialSettings.musicVolume);
  const [reduceEffects, setReduceEffects] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gravflip_reduce_effects') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [autoNext, setAutoNext] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gravflip_auto_next') !== 'false';
    } catch (_) {
      return true;
    }
  });

  const handleToggleAutoNext = useCallback((val: boolean) => {
    setAutoNext(val);
    try {
      localStorage.setItem('gravflip_auto_next', String(val));
    } catch (_) {}
  }, []);

  // Control Opacity Setting (default 60%, range 30% - 100%)
  const [controlOpacity, setControlOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gravflip_control_opacity');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 1.0) {
          return parsed;
        }
      }
    } catch (_) {}
    return 0.6;
  });

  const handleChangeControlOpacity = useCallback((val: number) => {
    setControlOpacity(val);
    try {
      localStorage.setItem('gravflip_control_opacity', val.toString());
    } catch (_) {}
  }, []);

  const reduceEffectsRef = useRef<boolean>(reduceEffects);
  reduceEffectsRef.current = reduceEffects;

  // Visual Effects State Refs
  const screenShakeRef = useRef({ intensity: 0, x: 0, y: 0 });
  const colorFlashRef = useRef({ color: theme.primary, alpha: 0 });
  const shockwavesRef = useRef<Shockwave[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Entities & Physics State Refs
  const platformsRef = useRef<Platform[]>(
    currentLevel.platforms.map((p) => ({ ...p }))
  );
  const crystalsRef = useRef<Crystal[]>(
    currentLevel.crystals.map((c) => ({ ...c, collected: false }))
  );
  const portalRef = useRef<Portal>({ ...currentLevel.portal });
  const entitiesRef = useRef<StageEntities>({
    // Stage A
    gravityGates: currentLevel.gravityGates ? currentLevel.gravityGates.map((g) => ({ ...g })) : [],
    teleporters: currentLevel.teleporters ? currentLevel.teleporters.map((t) => ({ ...t })) : [],
    bouncePads: currentLevel.bouncePads ? currentLevel.bouncePads.map((b) => ({ ...b })) : [],
    boostStrips: currentLevel.boostStrips ? currentLevel.boostStrips.map((s) => ({ ...s })) : [],
    gravityZones: currentLevel.gravityZones ? currentLevel.gravityZones.map((z) => ({ ...z })) : [],
    windZones: currentLevel.windZones ? currentLevel.windZones.map((w) => ({ ...w })) : [],
    switches: currentLevel.switches ? currentLevel.switches.map((s) => ({ ...s })) : [],
    doors: currentLevel.doors ? currentLevel.doors.map((d) => ({ ...d })) : [],
    crates: currentLevel.crates ? currentLevel.crates.map((c) => ({ ...c })) : [],
    magnets: currentLevel.magnets ? currentLevel.magnets.map((m) => ({ ...m })) : [],

    // Stage B
    isDarkRoom: currentLevel.isDarkRoom,
    spikes: currentLevel.spikes ? currentLevel.spikes.map((sp) => ({ ...sp })) : [],
    lasers: currentLevel.lasers ? currentLevel.lasers.map((l) => ({ ...l })) : [],
    sawBlades: currentLevel.sawBlades ? currentLevel.sawBlades.map((sb) => ({ ...sb })) : [],
    patrolDrones: currentLevel.patrolDrones ? currentLevel.patrolDrones.map((d) => ({ ...d })) : [],
    fallingBlocks: currentLevel.fallingBlocks ? currentLevel.fallingBlocks.map((fb) => ({ ...fb })) : [],
    checkpoints: currentLevel.checkpoints ? currentLevel.checkpoints.map((cp) => ({ ...cp })) : [],

    // Stage C
    starCrystal: currentLevel.starCrystal ? { ...currentLevel.starCrystal, collected: false } : undefined,
    timeSlowPickups: currentLevel.timeSlowPickups ? currentLevel.timeSlowPickups.map((p) => ({ ...p, collected: false })) : [],
    shieldPickups: currentLevel.shieldPickups ? currentLevel.shieldPickups.map((p) => ({ ...p, collected: false })) : [],
    doubleFlipPickups: currentLevel.doubleFlipPickups ? currentLevel.doubleFlipPickups.map((p) => ({ ...p, collected: false })) : [],

    // Stage D
    risingFloor: currentLevel.risingFloor ? { ...currentLevel.risingFloor } : undefined,
    chaosGravityInterval: currentLevel.chaosGravityInterval,
    secretPassages: currentLevel.secretPassages ? currentLevel.secretPassages.map((sp) => ({
      ...sp,
      revealed: false,
      bonusCrystals: sp.bonusCrystals ? sp.bonusCrystals.map((bc) => ({ ...bc, collected: false })) : undefined,
    })) : undefined,
  });

  const playerRef = useRef<Player>({
    x: currentLevel.spawn.x,
    y: currentLevel.spawn.y,
    vx: 0,
    vy: 0,
    radius: 18,
    onGround: false,
    wasOnGround: false,
    lastVy: 0,
    gravityDir: currentLevel.initialGravity,
    color: equippedSkin.primary,
    glowColor: equippedSkin.glow,
    trail: [],
    flipAnimProgress: 1,
    squashX: 1,
    squashY: 1,
    expression: 'normal',
    expressionTimer: 0,
    facingDir: 1,
    blinkTimer: 3,
    isStuckToWall: false,
    boostTimer: 0,
    teleportCooldown: 0,
    respawnX: currentLevel.spawn.x,
    respawnY: currentLevel.spawn.y,
    respawnGravity: currentLevel.initialGravity,
    suckedIntoPortal: false,
    portalSuckProgress: 0,

    // Stage C
    hasShield: false,
    extraFlips: 0,
    invulnerableTimer: 0,
    timeSlowTimer: 0,
    comboCount: 0,
    comboTimer: 0,
    hasStarCrystal: false,

    // Visual Character Animation
    visualAngle: currentLevel.initialGravity === 'UP' ? Math.PI : currentLevel.initialGravity === 'LEFT' ? Math.PI * 0.5 : currentLevel.initialGravity === 'RIGHT' ? -Math.PI * 0.5 : 0,
    runCycle: 0,
    landingTimer: 0,

    // Stage D
    chaosTimer: currentLevel.chaosGravityInterval,
    secretsDiscovered: 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    flipRequested: false,
  });

  const timerRef = useRef<number>(0);
  const statusRef = useRef<GameStatus>('PLAYING');
  statusRef.current = status;

  // Viewport geometry cache for canvas tap coordinates
  const viewportRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    width: 1280,
    height: 720,
  });

  const cameraPosRef = useRef<{ x: number; y: number }>({
    x: currentLevel.spawn.x,
    y: currentLevel.spawn.y,
  });

  // Level reset / loader
  const loadLevel = useCallback(
    (lvl: LevelData) => {
      cameraPosRef.current = { x: lvl.spawn.x, y: lvl.spawn.y };
      playerRef.current = {
        x: lvl.spawn.x,
        y: lvl.spawn.y,
        vx: 0,
        vy: 0,
        radius: 18,
        onGround: false,
        wasOnGround: false,
        lastVy: 0,
        gravityDir: lvl.initialGravity,
        color: equippedSkin.primary,
        glowColor: equippedSkin.glow,
        trail: [],
        flipAnimProgress: 1,
        squashX: 1,
        squashY: 1,
        expression: 'normal',
        expressionTimer: 0,
        facingDir: 1,
        blinkTimer: 3,
        isStuckToWall: false,
        boostTimer: 0,
        teleportCooldown: 0,
        respawnX: lvl.spawn.x,
        respawnY: lvl.spawn.y,
        respawnGravity: lvl.initialGravity,
        suckedIntoPortal: false,
        portalSuckProgress: 0,

        // Stage C
        hasShield: false,
        extraFlips: 0,
        invulnerableTimer: 0,
        timeSlowTimer: 0,
        comboCount: 0,
        comboTimer: 0,
        hasStarCrystal: false,

        // Stage D
        chaosTimer: lvl.chaosGravityInterval,
        secretsDiscovered: 0,

        // Visual Character Animation
        visualAngle: lvl.initialGravity === 'UP' ? Math.PI : lvl.initialGravity === 'LEFT' ? Math.PI * 0.5 : lvl.initialGravity === 'RIGHT' ? -Math.PI * 0.5 : 0,
        runCycle: 0,
        landingTimer: 0,
      };
      platformsRef.current = lvl.platforms.map((p) => ({ ...p }));
      crystalsRef.current = lvl.crystals.map((c) => ({ ...c, collected: false }));
      portalRef.current = { ...lvl.portal };
      entitiesRef.current = {
        // Stage A
        gravityGates: lvl.gravityGates ? lvl.gravityGates.map((g) => ({ ...g })) : [],
        teleporters: lvl.teleporters ? lvl.teleporters.map((t) => ({ ...t })) : [],
        bouncePads: lvl.bouncePads ? lvl.bouncePads.map((b) => ({ ...b })) : [],
        boostStrips: lvl.boostStrips ? lvl.boostStrips.map((s) => ({ ...s })) : [],
        gravityZones: lvl.gravityZones ? lvl.gravityZones.map((z) => ({ ...z })) : [],
        windZones: lvl.windZones ? lvl.windZones.map((w) => ({ ...w })) : [],
        switches: lvl.switches ? lvl.switches.map((s) => ({ ...s })) : [],
        doors: lvl.doors ? lvl.doors.map((d) => ({ ...d })) : [],
        crates: lvl.crates ? lvl.crates.map((c) => ({ ...c })) : [],
        magnets: lvl.magnets ? lvl.magnets.map((m) => ({ ...m })) : [],

        // Stage B
        isDarkRoom: lvl.isDarkRoom,
        spikes: lvl.spikes ? lvl.spikes.map((sp) => ({ ...sp })) : [],
        lasers: lvl.lasers ? lvl.lasers.map((l) => ({ ...l })) : [],
        sawBlades: lvl.sawBlades ? lvl.sawBlades.map((sb) => ({ ...sb })) : [],
        patrolDrones: lvl.patrolDrones ? lvl.patrolDrones.map((d) => ({ ...d })) : [],
        fallingBlocks: lvl.fallingBlocks ? lvl.fallingBlocks.map((fb) => ({ ...fb })) : [],
        checkpoints: lvl.checkpoints ? lvl.checkpoints.map((cp) => ({ ...cp })) : [],

        // Stage C
        starCrystal: lvl.starCrystal ? { ...lvl.starCrystal, collected: false } : undefined,
        timeSlowPickups: lvl.timeSlowPickups ? lvl.timeSlowPickups.map((p) => ({ ...p, collected: false })) : [],
        shieldPickups: lvl.shieldPickups ? lvl.shieldPickups.map((p) => ({ ...p, collected: false })) : [],
        doubleFlipPickups: lvl.doubleFlipPickups ? lvl.doubleFlipPickups.map((p) => ({ ...p, collected: false })) : [],

        // Stage D
        risingFloor: lvl.risingFloor ? { ...lvl.risingFloor } : undefined,
        chaosGravityInterval: lvl.chaosGravityInterval,
        secretPassages: lvl.secretPassages ? lvl.secretPassages.map((sp) => ({
          ...sp,
          revealed: false,
          bonusCrystals: sp.bonusCrystals ? sp.bonusCrystals.map((bc) => ({ ...bc, collected: false })) : undefined,
        })) : undefined,
      };
      particlesRef.current = [];
      shockwavesRef.current = [];
      floatingTextsRef.current = [];
      screenShakeRef.current = { intensity: 0, x: 0, y: 0 };
      colorFlashRef.current = { color: theme.primary, alpha: 0 };
      inputRef.current = { left: false, right: false, flipRequested: false };
      timerRef.current = 0;
      setTimeSeconds(0);
      setCrystalsCollected(0);
      setHasStarCrystal(false);
      setActiveCombo(0);
      setHasShield(false);
      setExtraFlips(0);
      setTimeSlowTimer(0);
      setChaosTimer(lvl.chaosGravityInterval);
      setCurrentGravity(lvl.initialGravity);
      setStatus('PLAYING');

      // Stage E: Ghost & Hint Reset
      ghostRecorderRef.current.reset();
      setCurrentGhostRun(loadGhostRun(lvl.id));
      deathTrackerRef.current.reset();
      setDeathCount(0);
      setHintAvailable(false);
      setHintActive(false);
      setHintWaypoints(getLevelHintWaypoints(lvl.spawn, lvl.portal, lvl.platforms, lvl.checkpoints));
    },
    [theme, equippedSkin]
  );

  const resetCurrentLevel = useCallback(() => {
    if (gameModeRef.current === 'ENDLESS') {
      endlessChunkIndexRef.current = 0;
      setEndlessChunkIndex(0);
      endlessDistanceRef.current = 0;
      setEndlessDistance(0);
      endlessCrystalsRef.current = 0;
      setEndlessCrystals(0);
      setIsEndlessGameOver(false);
      loadLevel(buildEndlessLevel(0));
    } else {
      loadLevel(currentLevel);
    }
  }, [currentLevel, loadLevel]);

  // Stage C & E Level Completion Handler
  const handleLevelCompleted = useCallback(() => {
    if (statusRef.current === 'LEVEL_COMPLETED') return;
    const finalTime = timerRef.current;

    // Endless Mode Progression
    if (gameModeRef.current === 'ENDLESS') {
      audio.playPortalEnter();
      const nextIdx = endlessChunkIndexRef.current + 1;
      endlessChunkIndexRef.current = nextIdx;
      setEndlessChunkIndex(nextIdx);
      const nextLvl = buildEndlessLevel(nextIdx);
      loadLevel(nextLvl);
      return;
    }

    statusRef.current = 'LEVEL_COMPLETED';
    setStatus('LEVEL_COMPLETED');

    const collectedCount = crystalsRef.current.filter((c) => c.collected).length;
    const starFound = !!playerRef.current.hasStarCrystal;

    const result = saveLevelResult(
      currentLevel.id,
      finalTime,
      collectedCount,
      currentLevel.crystals.length,
      currentLevel.parTime,
      starFound
    );

    // Stage E: Save PB Ghost Run
    const ghostRun = ghostRecorderRef.current.getRun(currentLevel.id, finalTime);
    saveGhostRun(currentLevel.id, ghostRun);

    // Stage E: Mode Handlers
    if (gameModeRef.current === 'DAILY') {
      saveDailyChallengeCompletion(finalTime);
      const save = loadGameData();
      saveTotalCrystals(save.totalCrystals + dailyInfo.reward);
      const achDaily = trackAchievement('daily_devotee', 1);
      if (achDaily) setActiveToast(achDaily);
    } else if (gameModeRef.current === 'TIME_ATTACK') {
      saveTimeAttackRecord(currentLevel.id, finalTime);
    }

    // Stage E: Achievements Checking
    const a1 = trackAchievement('first_escape', 1);
    if (a1) setActiveToast(a1);
    const a2 = trackAchievement('portal_nomad', 1);
    if (a2) setActiveToast(a2);
    if (finalTime <= 10) {
      const a3 = trackAchievement('speed_demon', 1);
      if (a3) setActiveToast(a3);
    }
    if (currentLevel.isBoss) {
      const a4 = trackAchievement('boss_slayer', 1);
      if (a4) setActiveToast(a4);
    }
    if (currentLevel.id >= 20) {
      const a5 = trackAchievement('midway_breakout', 1);
      if (a5) setActiveToast(a5);
    }
    if (currentLevel.id === 40) {
      const a6 = trackAchievement('chaos_survivor', 1);
      if (a6) setActiveToast(a6);
    }

    setLevelResult(result);
    setSaveData(loadGameData());

    // Boss Defeat Fanfare Audio or Normal Star Fanfare
    if (currentLevel.isBoss) {
      audio.playBossDefeated();
    } else {
      audio.playStar(1);
      if (result.starsEarned >= 2) {
        setTimeout(() => audio.playStar(2), 260);
      }
      if (result.starsEarned >= 3) {
        setTimeout(() => audio.playStar(3), 520);
      }
    }
  }, [currentLevel, dailyInfo.reward, loadLevel]);

  // Advance to next level
  const handleNextLevel = useCallback(() => {
    audio.playClick();
    const nextId = (currentLevelId % ALL_LEVELS.length) + 1;
    setCurrentLevelId(nextId);
    loadLevel(getLevelById(nextId));
  }, [currentLevelId, loadLevel]);

  // Jump to specific level
  const handleSelectLevel = useCallback(
    (lvlId: number) => {
      audio.playClick();
      setCurrentLevelId(lvlId);
      loadLevel(getLevelById(lvlId));
    },
    [loadLevel]
  );

  // Cycle world theme manually (cosmetic toggle)
  const handleCycleWorld = useCallback(() => {
    setCurrentWorld((prev) => {
      const nextWorld = (prev % 4) + 1;
      audio.setWorld(nextWorld);
      audio.playClick();
      return nextWorld;
    });
  }, []);

  // Settings handlers
  const handleToggleReduceEffects = useCallback((val: boolean) => {
    setReduceEffects(val);
    try {
      localStorage.setItem('gravflip_reduce_effects', val.toString());
    } catch (_) {}
  }, []);

  const handleToggleSfx = useCallback((muted: boolean) => {
    setSfxMuted(muted);
    audio.setSfxMuted(muted);
  }, []);

  const handleToggleMusic = useCallback((muted: boolean) => {
    setMusicMuted(muted);
    audio.setMusicMuted(muted);
  }, []);

  const handleChangeSfxVolume = useCallback((vol: number) => {
    setSfxVolume(vol);
    audio.setSfxVolume(vol);
  }, []);

  const handleChangeMusicVolume = useCallback((vol: number) => {
    setMusicVolume(vol);
    audio.setMusicVolume(vol);
  }, []);

  // Skins Wardrobe Handlers
  const handleEquipSkin = useCallback((skinId: string) => {
    persistEquipSkin(skinId);
    setSaveData((prev) => ({ ...prev, equippedSkinId: skinId }));
    const s = getSkinById(skinId);
    if (playerRef.current) {
      playerRef.current.color = s.primary;
      playerRef.current.glowColor = s.glow;
    }
  }, []);

  const handlePurchaseSkin = useCallback((skinId: string, cost: number) => {
    const success = saveSkinPurchase(skinId, cost);
    if (success) {
      audio.playClaimReward();
      setSaveData(loadGameData());
      const s = getSkinById(skinId);
      if (playerRef.current) {
        playerRef.current.color = s.primary;
        playerRef.current.glowColor = s.glow;
      }
      const ach = trackAchievement('wardrobe_stylist', 1);
      if (ach) setActiveToast(ach);
    }
  }, []);

  // Daily Reward Claim Handler
  const handleClaimDailyReward = useCallback(() => {
    const res = claimDailyReward();
    if (res.success) {
      audio.playClaimReward();
      setSaveData(loadGameData());
    }
  }, []);

  // Request gravity flip
  const lastFlipTimeRef = useRef<number>(0);
  const triggerFlip = useCallback(() => {
    audio.initOnGesture();
    audio.startMusic(currentWorld);
    if (statusRef.current !== 'PLAYING') return;
    const now = performance.now();
    if (now - lastFlipTimeRef.current < 75) return;
    lastFlipTimeRef.current = now;

    inputRef.current.flipRequested = true;
    setCurrentGravity((prev) => {
      if (prev === 'DOWN') return 'UP';
      if (prev === 'UP') return 'DOWN';
      if (prev === 'LEFT') return 'RIGHT';
      return 'LEFT';
    });

    // Stage E: Track Flip Achievements
    const a1 = trackAchievement('gravity_cadet', 1);
    if (a1) setActiveToast(a1);
    const a2 = trackAchievement('gravity_master', 1);
    if (a2) setActiveToast(a2);
  }, [currentWorld]);

  const handleMoveLeft = useCallback((pressed: boolean) => {
    audio.initOnGesture();
    audio.startMusic(currentWorld);
    inputRef.current.left = pressed;
  }, [currentWorld]);

  const handleMoveRight = useCallback((pressed: boolean) => {
    audio.initOnGesture();
    audio.startMusic(currentWorld);
    inputRef.current.right = pressed;
  }, [currentWorld]);

  const togglePause = useCallback(() => {
    audio.initOnGesture();
    setStatus((prev) => {
      const next = prev === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      if (next === 'PAUSED') {
        audio.pauseMusic();
      } else {
        audio.resumeMusic();
      }
      return next;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      audio.initOnGesture();
      audio.startMusic(currentWorld);
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      } else if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyW' ||
        e.code === 'KeyS'
      ) {
        e.preventDefault();
        triggerFlip();
      } else if (e.code === 'KeyR') {
        audio.playClick();
        resetCurrentLevel();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        audio.playClick();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerFlip, resetCurrentLevel, togglePause, currentWorld]);

  // Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        audio.pauseMusic();
        if (statusRef.current === 'PLAYING') {
          setStatus('PAUSED');
        }
      } else {
        if (statusRef.current === 'PLAYING' && currentScreen === 'GAME') {
          audio.resumeMusic();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentScreen]);

  // Register PWA Service Worker with quiet iframe fallback and update notification
  useEffect(() => {
    const unregister = registerPWA(() => {
      setUpdateAvailable(true);
    });
    return unregister;
  }, []);

  // Screen: on launch, request fullscreen on the first tap and lock landscape where supported
  useEffect(() => {
    let triggered = false;
    const handleFirstTap = () => {
      if (triggered) return;
      triggered = true;
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        if (window.screen?.orientation && 'lock' in window.screen.orientation) {
          (window.screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch (_) {}
    };

    window.addEventListener('pointerdown', handleFirstTap, { passive: true });
    window.addEventListener('touchstart', handleFirstTap, { passive: true });
    window.addEventListener('click', handleFirstTap, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstTap);
      window.removeEventListener('touchstart', handleFirstTap);
      window.removeEventListener('click', handleFirstTap);
    };
  }, []);

  // Main Canvas & 60Hz Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;

    const handleResize = () => {
      const width = window.innerWidth || document.documentElement.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight;
      const portrait = width < height;
      setIsPortrait(portrait);

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const gameW = currentLevel.bounds.width;
      const gameH = currentLevel.bounds.height;
      const hudTopClearance = portrait ? 0 : Math.min(46, Math.max(34, height * 0.12));
      const availableHeight = height - hudTopClearance;
      const scale = Math.min(width / gameW, availableHeight / gameH);
      const offsetX = (width - gameW * scale) / 2;
      const offsetY = portrait
        ? Math.max(50, (height - gameH * scale) * 0.32)
        : hudTopClearance + (availableHeight - gameH * scale) / 2;

      viewportRef.current = {
        scale: scale * dpr,
        offsetX: offsetX * dpr,
        offsetY: offsetY * dpr,
        width,
        height,
      };
    };

    const handleResizeWithDelays = () => {
      handleResize();
      setTimeout(handleResize, 50);
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 300);
      setTimeout(handleResize, 600);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResizeWithDelays);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleResizeWithDelays);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    handleResizeWithDelays();

    let lastHudUpdate = 0;
    const gameLoop = (currentTime: number) => {
      let frameTime = (currentTime - lastTime) / 1000;
      if (frameTime > 0.1) frameTime = 0.1;
      lastTime = currentTime;

      if (!reduceEffectsRef.current && screenShakeRef.current.intensity > 0.05) {
        const angle = Math.random() * Math.PI * 2;
        screenShakeRef.current.x = Math.cos(angle) * screenShakeRef.current.intensity;
        screenShakeRef.current.y = Math.sin(angle) * screenShakeRef.current.intensity;
        screenShakeRef.current.intensity *= 0.88;
      } else {
        screenShakeRef.current.x = 0;
        screenShakeRef.current.y = 0;
        screenShakeRef.current.intensity = 0;
      }

      if (statusRef.current === 'PLAYING') {
        accumulator += frameTime;

        while (accumulator >= FIXED_DT) {
          timerRef.current += FIXED_DT;

          // Stage E: Ghost Recording (in campaign & time attack modes)
          if (gameModeRef.current !== 'ENDLESS') {
            ghostRecorderRef.current.recordFrame(
              timerRef.current,
              playerRef.current.x,
              playerRef.current.y,
              playerRef.current.vx,
              playerRef.current.vy,
              playerRef.current.gravityDir,
              playerRef.current.squashX,
              playerRef.current.squashY
            );
          }

          // Stage E: Death Hint Tracker update
          deathTrackerRef.current.update(FIXED_DT);

          // Stage E: Endless Distance Calculation
          if (gameModeRef.current === 'ENDLESS') {
            const currentMeters = Math.max(0, Math.floor(playerRef.current.x / 20));
            const totalMeters = endlessChunkIndexRef.current * 60 + currentMeters;
            if (totalMeters > endlessDistanceRef.current) {
              endlessDistanceRef.current = totalMeters;
              setEndlessDistance(totalMeters);
              if (totalMeters >= 200) {
                const ach = trackAchievement('endless_voyager', 0, totalMeters);
                if (ach) setActiveToast(ach);
              }
            }
          }

          const res = updatePhysics(
            playerRef.current,
            platformsRef.current,
            inputRef.current,
            crystalsRef.current,
            portalRef.current,
            particlesRef.current,
            currentLevel.bounds,
            {
              shockwaves: shockwavesRef.current,
              floatingTexts: floatingTextsRef.current,
              addScreenShake: (amount) => {
                if (reduceEffectsRef.current) return;
                screenShakeRef.current.intensity = Math.min(3, screenShakeRef.current.intensity + amount * 0.4);
              },
              triggerColorFlash: () => {
                colorFlashRef.current.alpha = 0;
              },
              primaryColor: theme.primary,
              secondaryColor: theme.secondary,
            },
            () => {
              const collectedCount = crystalsRef.current.filter((c) => c.collected).length;
              setCrystalsCollected(collectedCount);
              if (gameModeRef.current === 'ENDLESS') {
                endlessCrystalsRef.current = collectedCount;
                setEndlessCrystals(collectedCount);
              }
              const a1 = trackAchievement('crystal_seeker', 1);
              if (a1) setActiveToast(a1);
              const a2 = trackAchievement('crystal_hoarder', 1);
              if (a2) setActiveToast(a2);
            },
            () => {
              handleLevelCompleted();
            },
            entitiesRef.current,
            (deathX, deathY) => {
              const triggered = deathTrackerRef.current.recordDeath(deathX, deathY);
              setDeathCount((c) => c + 1);
              if (triggered) {
                setHintAvailable(true);
              }

              if (gameModeRef.current === 'ENDLESS') {
                setIsEndlessGameOver(true);
                setStatus('PAUSED');
                statusRef.current = 'PAUSED';
                saveEndlessHighScore(endlessDistanceRef.current);
                setEndlessHighScore(getEndlessHighScore());
                const save = loadGameData();
                saveTotalCrystals(
                  save.totalCrystals +
                    endlessCrystalsRef.current +
                    Math.floor(endlessDistanceRef.current / 20)
                );
                setSaveData(loadGameData());
              }
            }
          );

          if (res.levelComplete) {
            handleLevelCompleted();
          }

          accumulator -= FIXED_DT;
        }

        if (currentTime - lastHudUpdate > 100) {
          lastHudUpdate = currentTime;
          setTimeSeconds(timerRef.current);
          setCurrentGravity(playerRef.current.gravityDir);
          setHasStarCrystal(!!playerRef.current.hasStarCrystal);
          if (playerRef.current.hasStarCrystal) {
            const a1 = trackAchievement('star_first', 1);
            if (a1) setActiveToast(a1);
            const a2 = trackAchievement('star_astronomer', 1);
            if (a2) setActiveToast(a2);
          }
          const combo = playerRef.current.comboCount || 0;
          setActiveCombo(combo);
          if (combo >= 5) {
            const achCombo = trackAchievement('combo_god', 0, combo);
            if (achCombo) setActiveToast(achCombo);
          }
          if ((playerRef.current.secretsDiscovered || 0) > 0) {
            const achSec = trackAchievement('secret_agent', 1);
            if (achSec) setActiveToast(achSec);
          }
          setHasShield(!!playerRef.current.hasShield);
          setExtraFlips(playerRef.current.extraFlips || 0);
          setTimeSlowTimer(playerRef.current.timeSlowTimer || 0);
          setChaosTimer(playerRef.current.chaosTimer);
        }
      }

      // Sample Ghost PB Run
      const ghostSample =
        ghostEnabled && currentGhostRun
          ? getGhostAtTime(currentGhostRun, timerRef.current)
          : undefined;

      // Fit the whole level on screen in landscape so the exit portal is never cut off
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const width = viewportRef.current.width || window.innerWidth;
      const height = viewportRef.current.height || window.innerHeight;
      const gameW = currentLevel.bounds.width;
      const gameH = currentLevel.bounds.height;
      const hudTopClearance = isPortrait ? 0 : Math.min(46, Math.max(34, height * 0.12));
      const availableHeight = height - hudTopClearance;
      // Camera scale: for wide levels, scale to fit playable height so player & obstacles remain large & clear
      const heightFitScale = (availableHeight - 16) / Math.min(gameH, 760);
      const effectiveScale = Math.min(1.2, Math.max(0.65, heightFitScale));

      // 1. SAFE ZONE DEFINITION:
      // Defines the visible play area excluding:
      // - Left/Right buttons (bottom-left): ~170px width, ~110px height
      // - FLIP button (bottom-right): ~135px width, ~115px height
      // - Top HUD bar: ~54px to 68px height
      const safeLeft = Math.max(160, width * 0.20);
      const safeRight = width - Math.max(140, width * 0.18);
      const safeTop = Math.max(68, hudTopClearance + 22);
      const safeBottom = height - 120;
      const safeHeight = Math.max(100, safeBottom - safeTop);

      // 2. CAMERA ANCHOR & GRAVITY DIRECTIONS:
      // Keep character near horizontal center and slightly above vertical center.
      // Adjust anchor for active gravity direction so character stays well clear of controls:
      let baseAnchorX = width * 0.50;
      let baseAnchorY = safeTop + safeHeight * 0.43;

      const grav = playerRef.current.gravityDir;
      if (grav === 'UP') {
        // Ceiling gravity: shift camera downward so character walking on ceiling
        // has ample headroom below the top HUD bar and stays safely above bottom buttons
        baseAnchorY = safeTop + safeHeight * 0.55;
      } else if (grav === 'LEFT') {
        // Left wall gravity: bias camera to the right to keep character away from bottom-left D-pad
        baseAnchorX = width * 0.55;
      } else if (grav === 'RIGHT') {
        // Right wall gravity: bias camera to the left to keep character away from bottom-right FLIP button
        baseAnchorX = width * 0.45;
      }

      // Smooth camera follow with velocity look-ahead in movement direction
      const lookAheadX = (playerRef.current.vx || 0) * 0.32;
      const lookAheadY = (playerRef.current.vy || 0) * 0.18;
      const targetCamX = playerRef.current.x + lookAheadX;
      const targetCamY = playerRef.current.y + lookAheadY;

      cameraPosRef.current.x += (targetCamX - cameraPosRef.current.x) * 0.14;
      cameraPosRef.current.y += (targetCamY - cameraPosRef.current.y) * 0.14;

      // Base camera offset positioning targetCam at (baseAnchorX, baseAnchorY)
      let camOffsetX = baseAnchorX - cameraPosRef.current.x * effectiveScale;
      let camOffsetY = baseAnchorY - cameraPosRef.current.y * effectiveScale;

      // Clamp character strictly inside the Safe Zone so it can NEVER slip behind buttons or top bar
      const playerScreenX = playerRef.current.x * effectiveScale + camOffsetX;
      if (playerScreenX < safeLeft) {
        camOffsetX += safeLeft - playerScreenX;
      } else if (playerScreenX > safeRight) {
        camOffsetX -= playerScreenX - safeRight;
      }

      const playerScreenY = playerRef.current.y * effectiveScale + camOffsetY;
      if (playerScreenY < safeTop) {
        camOffsetY += safeTop - playerScreenY;
      } else if (playerScreenY > safeBottom) {
        camOffsetY -= playerScreenY - safeBottom;
      }

      viewportRef.current.scale = effectiveScale * dpr;
      viewportRef.current.offsetX = camOffsetX * dpr;
      viewportRef.current.offsetY = camOffsetY * dpr;

      // Render Frame
      renderGame(
        {
          ctx,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          scale: viewportRef.current.scale,
          offsetX: viewportRef.current.offsetX,
          offsetY: viewportRef.current.offsetY,
          gameWidth: currentLevel.bounds.width,
          gameHeight: currentLevel.bounds.height,
          screenShake: { x: screenShakeRef.current.x, y: screenShakeRef.current.y },
          colorFlash: { color: colorFlashRef.current.color, alpha: colorFlashRef.current.alpha },
          theme,
        },
        playerRef.current,
        platformsRef.current,
        crystalsRef.current,
        portalRef.current,
        particlesRef.current,
        shockwavesRef.current,
        floatingTextsRef.current,
        timerRef.current,
        {
          ...(entitiesRef.current as StageRenderEntities),
          ghostSample: ghostSample || undefined,
          hintWaypoints: hintActive ? hintWaypoints : undefined,
          hintActive: hintActive,
          trailStyle: equippedSkin.trailStyle || 'standard',
        }
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResizeWithDelays);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleResizeWithDelays);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [theme, currentLevel, handleLevelCompleted]);

  const handleCanvasPointerDown = () => {
    audio.initOnGesture();
    audio.startMusic(currentWorld);
    if (statusRef.current === 'PLAYING') {
      triggerFlip();
    }
  };

  // Star and Level Statistics
  const totalStars = useMemo(() => {
    return Object.values(saveData.levelProgress).reduce(
      (sum, p) => sum + (p.stars || 0),
      0
    );
  }, [saveData.levelProgress]);

  const maxStars = ALL_LEVELS.length * 3;

  const highestUnlockedLevel = useMemo(() => {
    const keys = Object.keys(saveData.levelProgress).map(Number);
    return keys.length > 0 ? Math.max(...keys) : 1;
  }, [saveData.levelProgress]);

  // Stage E: Achievements Counter
  const achievementsList = useMemo(() => loadAchievements(), [isAchievementsOpen, activeToast]);
  const unlockedAchievementsCount = achievementsList.filter((a) => a.unlocked).length;
  const totalAchievementsCount = achievementsList.length;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none touch-none"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onTouchStart={() => {
          audio.initOnGesture();
          audio.startMusic(currentWorld);
          if (statusRef.current === 'PLAYING') {
            triggerFlip();
          }
        }}
        className="block absolute inset-0 w-full h-full cursor-pointer touch-none"
      />

      {/* Screen 1: Main Menu */}
      {currentScreen === 'MAIN_MENU' && (
        <MainMenu
          theme={theme}
          equippedSkin={equippedSkin}
          totalCrystals={saveData.totalCrystals}
          totalStars={totalStars}
          maxStars={maxStars}
          hasDailyReward={!saveData.dailyReward.claimedToday}
          highestUnlockedLevel={highestUnlockedLevel}
          unlockedAchievementsCount={unlockedAchievementsCount}
          totalAchievementsCount={totalAchievementsCount}
          onPlay={() => {
            audio.initOnGesture();
            audio.startMusic(currentWorld);
            setGameMode('STANDARD');
            setCurrentScreen('GAME');
            resetCurrentLevel();
          }}
          onOpenLevelSelect={() => {
            audio.playClick();
            setCurrentScreen('LEVEL_SELECT');
          }}
          onOpenSkins={() => {
            audio.playClick();
            setIsSkinsOpen(true);
          }}
          onOpenDailyReward={() => {
            audio.playClick();
            setIsDailyRewardOpen(true);
          }}
          onOpenSettings={() => {
            audio.playClick();
            setIsSettingsOpen(true);
          }}
          onOpenAchievements={() => {
            audio.playClick();
            setIsAchievementsOpen(true);
          }}
          onOpenDailyChallenge={() => {
            audio.playClick();
            setDailyInfo(getDailyChallenge());
            setIsDailyChallengeOpen(true);
          }}
          onOpenTimeAttack={() => {
            audio.playClick();
            setIsTimeAttackOpen(true);
          }}
          onStartEndless={() => {
            audio.initOnGesture();
            audio.startMusic(1);
            setGameMode('ENDLESS');
            endlessChunkIndexRef.current = 0;
            setEndlessChunkIndex(0);
            endlessDistanceRef.current = 0;
            setEndlessDistance(0);
            endlessCrystalsRef.current = 0;
            setEndlessCrystals(0);
            setIsEndlessGameOver(false);
            setCurrentScreen('GAME');
            loadLevel(buildEndlessLevel(0));
          }}
        />
      )}

      {/* Screen 2: Level Select */}
      {currentScreen === 'LEVEL_SELECT' && (
        <LevelSelect
          currentTheme={theme}
          levelProgress={saveData.levelProgress}
          currentLevelId={currentLevelId}
          onSelectLevel={(lvlId) => {
            audio.initOnGesture();
            audio.startMusic(currentWorld);
            setGameMode('STANDARD');
            handleSelectLevel(lvlId);
            setCurrentScreen('GAME');
          }}
          onBackToMenu={() => {
            audio.playClick();
            setCurrentScreen('MAIN_MENU');
          }}
        />
      )}

      {/* Screen 3: Active Game Screen */}
      {currentScreen === 'GAME' && (
        <>
          <TouchControls
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onFlip={triggerFlip}
            currentGravity={currentGravity}
            theme={theme}
            controlOpacity={controlOpacity}
          />

          {gameMode === 'ENDLESS' ? (
            <EndlessHUD
              distance={endlessDistance}
              stageNumber={endlessChunkIndex + 1}
              crystalsCollected={endlessCrystals}
              highScore={endlessHighScore}
              speedMultiplier={1 + Math.min(1.5, endlessChunkIndex * 0.08)}
              isGameOver={isEndlessGameOver}
              isPaused={status === 'PAUSED' && !isEndlessGameOver}
              theme={theme}
              onRestart={resetCurrentLevel}
              onTogglePause={togglePause}
              onBackToMenu={() => {
                setCurrentScreen('MAIN_MENU');
                setGameMode('STANDARD');
                setStatus('PAUSED');
                audio.pauseMusic();
              }}
            />
          ) : (
            <GameHUD
              levelName={currentLevel.name}
              levelNumber={currentLevel.id}
              totalLevels={ALL_LEVELS.length}
              hint={currentLevel.hint}
              parTime={currentLevel.parTime}
              crystalsCollected={crystalsCollected}
              totalCrystals={currentLevel.crystals.length}
              timeSeconds={timeSeconds}
              gravityDir={currentGravity}
              status={status}
              theme={theme}
              currentWorld={currentWorld}
              hasStarCrystal={hasStarCrystal}
              starCrystalAvailable={!!currentLevel.starCrystal}
              activeCombo={activeCombo}
              hasShield={hasShield}
              extraFlips={extraFlips}
              timeSlowTimer={timeSlowTimer}
              starsEarned={levelResult.starsEarned}
              newCrystalsAdded={levelResult.newCrystalsAdded}
              isNewBestTime={levelResult.isNewBestTime}
              isBoss={currentLevel.isBoss}
              bossTitle={currentLevel.bossTitle}
              bossIntroText={currentLevel.bossIntroText}
              storyIntro={currentLevel.storyIntro}
              chaosTimer={chaosTimer}
              gameMode={gameMode}
              hintAvailable={hintAvailable}
              onTriggerHint={() => {
                deathTrackerRef.current.triggerHint();
                setHintActive(true);
              }}
              ghostActive={ghostEnabled && !!currentGhostRun}
              deathCount={deathCount}
              onCycleWorld={handleCycleWorld}
              onRestart={resetCurrentLevel}
              onTogglePause={togglePause}
              onNextLevel={handleNextLevel}
              onSelectLevel={handleSelectLevel}
              onOpenSettings={() => setIsSettingsOpen(true)}
              autoNext={autoNext}
              onBackToMenu={() => {
                setCurrentScreen('MAIN_MENU');
                setGameMode('STANDARD');
                setStatus('PAUSED');
                audio.pauseMusic();
              }}
              onOpenLevelSelect={() => {
                setCurrentScreen('LEVEL_SELECT');
                setStatus('PAUSED');
              }}
            />
          )}
        </>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        reduceEffects={reduceEffects}
        onToggleReduceEffects={handleToggleReduceEffects}
        sfxMuted={sfxMuted}
        musicMuted={musicMuted}
        sfxVolume={sfxVolume}
        musicVolume={musicVolume}
        onToggleSfx={handleToggleSfx}
        onToggleMusic={handleToggleMusic}
        onChangeSfxVolume={handleChangeSfxVolume}
        onChangeMusicVolume={handleChangeMusicVolume}
        autoNext={autoNext}
        onToggleAutoNext={handleToggleAutoNext}
        controlOpacity={controlOpacity}
        onChangeControlOpacity={handleChangeControlOpacity}
      />

      <SkinsModal
        isOpen={isSkinsOpen}
        onClose={() => setIsSkinsOpen(false)}
        theme={theme}
        totalCrystals={saveData.totalCrystals}
        unlockedSkins={saveData.unlockedSkins}
        equippedSkinId={saveData.equippedSkinId}
        onEquipSkin={handleEquipSkin}
        onPurchaseSkin={handlePurchaseSkin}
      />

      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        theme={theme}
        dailyReward={saveData.dailyReward}
        onClaim={handleClaimDailyReward}
      />

      {/* Stage E Modals & Toast */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        theme={theme}
      />

      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        theme={theme}
        info={dailyInfo}
        onStartChallenge={(lvlId) => {
          setGameMode('DAILY');
          setCurrentLevelId(lvlId);
          loadLevel(getLevelById(lvlId));
          setCurrentScreen('GAME');
          setIsDailyChallengeOpen(false);
        }}
      />

      <TimeAttackModal
        isOpen={isTimeAttackOpen}
        onClose={() => setIsTimeAttackOpen(false)}
        theme={theme}
        currentLevelId={currentLevelId}
        totalLevels={ALL_LEVELS.length}
        ghostEnabled={ghostEnabled}
        onToggleGhost={() => setGhostEnabled((g) => !g)}
        onStartTimeAttack={(lvlId) => {
          setGameMode('TIME_ATTACK');
          setCurrentLevelId(lvlId);
          loadLevel(getLevelById(lvlId));
          setCurrentScreen('GAME');
          setIsTimeAttackOpen(false);
        }}
      />

      <AchievementToast
        achievement={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      <OfflineIndicator />

      <PWAUpdateToast show={updateAvailable} />

      <RotateOverlay isPortrait={isPortrait} />
    </div>
  );
}
