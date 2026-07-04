// Browser-only share card utilities. Render 1080x1080 or 1080x1920 PNGs
// with the HTML Canvas API, then share via Web Share API on mobile or
// trigger a download on desktop.

import { DAYS_FULL, muscleColors, type MuscleGroup } from "./fitvault-data";

export interface WeekCardData {
  name: string;
  streak: number;
  days: Array<{
    dayIndex: number;
    title: string | null;
    muscle: MuscleGroup | null;
  }>;
}

export interface StreakCardData {
  streak: number;
}

const BRAND = "sweat-reel.lovable.app";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function baseGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  glow: string,
) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0A0A0F");
  bg.addColorStop(1, "#141420");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const g = ctx.createRadialGradient(
    w / 2,
    h * 0.95,
    0,
    w / 2,
    h * 0.95,
    h * 0.7,
  );
  g.addColorStop(0, glow);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function renderWeekCard(data: WeekCardData): HTMLCanvasElement {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  baseGradient(ctx, W, H, "rgba(67,97,238,0.3)");

  // Logo
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 44px Inter, system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("⚡ SweatReel", 60, 60);
  ctx.fillStyle = "#4361EE";
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillText(BRAND, 60, 120);

  // Greeting
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 60px Inter, system-ui, sans-serif";
  ctx.fillText(`${data.name}'s Week 🔥`, 60, 190);

  // Week grid
  const rowH = 90;
  const gap = 12;
  const startY = 300;
  const rowX = 60;
  const rowW = W - 120;

  for (let i = 0; i < 7; i++) {
    const y = startY + i * (rowH + gap);
    const entry = data.days.find((d) => d.dayIndex === i);
    const rest = !entry || !entry.title;
    const muscleColor =
      entry && entry.muscle ? muscleColors[entry.muscle] : "#4361EE";

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, rowX, y, rowW, rowH, 16);
    ctx.fill();

    if (!rest) {
      ctx.fillStyle = muscleColor;
      roundRect(ctx, rowX, y, 6, rowH, 3);
      ctx.fill();
    }

    ctx.fillStyle = "#8888AA";
    ctx.font = "600 20px Inter, system-ui, sans-serif";
    ctx.fillText(DAYS_FULL[i].toUpperCase(), rowX + 28, y + 22);

    ctx.fillStyle = rest ? "#555577" : "#FFFFFF";
    ctx.font = rest
      ? "500 26px Inter, system-ui, sans-serif"
      : "700 28px Inter, system-ui, sans-serif";
    const title = rest ? "Rest Day" : entry!.title!;
    ctx.fillText(truncate(ctx, title, rowW - 60), rowX + 28, y + 50);
  }

  // Streak pill (bottom-left)
  const pillY = H - 90;
  const pillText = `🔥 ${data.streak} day streak`;
  ctx.font = "700 26px Inter, system-ui, sans-serif";
  const pillW = ctx.measureText(pillText).width + 44;
  ctx.fillStyle = "#FF6B35";
  roundRect(ctx, 60, pillY - 24, pillW, 54, 27);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(pillText, 82, pillY - 16);

  // CTA (bottom-right)
  ctx.fillStyle = "#4361EE";
  ctx.font = "700 28px Inter, system-ui, sans-serif";
  const cta = "Try SweatReel FREE →";
  const ctaW = ctx.measureText(cta).width;
  ctx.fillText(cta, W - 60 - ctaW, pillY - 16);

  return canvas;
}

export function renderStreakCard(data: StreakCardData): HTMLCanvasElement {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  baseGradient(ctx, W, H, "rgba(255,107,53,0.35)");

  // 🔥 emoji
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.font = "200px Inter, system-ui, sans-serif";
  ctx.fillText("🔥", W / 2, H * 0.28);

  // Streak number
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 200px Inter, system-ui, sans-serif";
  ctx.fillText(`${data.streak}`, W / 2, H * 0.52);

  ctx.font = "700 90px Inter, system-ui, sans-serif";
  ctx.fillText("Day Streak", W / 2, H * 0.68);

  ctx.fillStyle = "#8888AA";
  ctx.font = "500 34px Inter, system-ui, sans-serif";
  ctx.fillText("Consistent. Focused. Unstoppable.", W / 2, H * 0.78);

  // Brand
  ctx.fillStyle = "#4361EE";
  ctx.font = "700 46px Inter, system-ui, sans-serif";
  ctx.fillText("⚡ SweatReel", W / 2, H - 180);
  ctx.fillStyle = "#8888AA";
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillText(BRAND, W / 2, H - 120);

  ctx.textAlign = "start";
  return canvas;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > max) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

export async function shareCanvas(canvas: HTMLCanvasElement, filename: string) {
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob failed"))), "image/png"),
  );
  const file = new File([blob], filename, { type: "image/png" });

  const nav: any = typeof navigator !== "undefined" ? navigator : {};
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({
        files: [file],
        title: "SweatReel",
        text: "Your workouts. Organized.",
      });
      return;
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
