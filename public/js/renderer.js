// js/renderer.js
import { state, GLOBAL_ASSETS, GLOBAL_CONFIG } from './config.js';

let canvas, ctx;

export function initRenderer(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resize();
}

export function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth * 1.5;
    canvas.height = window.innerHeight * 1.5;
    draw();
}

export function draw() {
    if (!canvas || !ctx) return;

    let mainTarget = null;
    if (state.viewType === 'video') {
        mainTarget = state.video;
    } else if (state.viewType === 'static') {
        mainTarget = state.image;
    }
    if (!mainTarget) return;

    const cw = canvas.width, ch = canvas.height;
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    const tw = mainTarget.videoWidth || mainTarget.width || 1;
    const th = mainTarget.videoHeight || mainTarget.height || 1;
    if (tw <= 0 || th <= 0) return;

    const isStaticView = (state.currentViewId === 'static' || state.currentViewId === 'static_hdt');

    // 始终清空并重绘
    ctx.clearRect(0, 0, cw, ch);

    const baseScale = Math.min(ww / tw, wh / th);
    const scale = baseScale * state.zoom;

    const dw = tw * scale;
    const dh = th * scale;
    const dx = (cw - dw) / 2 + state.pan.x;
    const dy = (ch - dh) / 2 + state.pan.y;

    const offsetCloud = {
        x: state.parallax.x * 12 * 2, // parallaxFactor = 2
        y: state.parallax.y * 12 * 2
    };

    // Layer 0: 底色填充
    if (state.isComposite && !isStaticView) {
        drawSolidBackground(dx, dy, dw, dh, '#e84124');
    }

    // Layer 1: 底层云膜
    if (state.isComposite && GLOBAL_ASSETS.cloud && !isStaticView) {
        drawCloudLayer(dx, dy, dw, dh, offsetCloud);
    }

    // Layer 2: 中层内容
    drawMainContentLayer(mainTarget, dx, dy, dw, dh, isStaticView);

    // Layer 3: 顶层 Overlay 视频
    if (state.isComposite && GLOBAL_ASSETS.overlayVideo) {
        drawOverlayVideoLayer(dx, dy, dw, dh);
    }
}

function drawSolidBackground(dx, dy, dw, dh, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();
}

function drawCloudLayer(dx, dy, dw, dh, offset) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    const cl = GLOBAL_ASSETS.cloud;
    // Cover × 2：保持宽高比放大2倍
    const coverScale = Math.max(dw / cl.naturalWidth, dh / cl.naturalHeight) * 2.0;
    const cdw = cl.naturalWidth * coverScale;
    const cdh = cl.naturalHeight * coverScale;
    const cdx = dx + (dw - cdw) / 2 + offset.x;
    // 对准黄鹤楼小窗：中心在内容区高度约 35% 处
    const cloudCenterYRatio = 0.35;
    const cdy = dy + dh * cloudCenterYRatio - cdh / 2 + offset.y;
    ctx.drawImage(cl, cdx, cdy, cdw, cdh);
    ctx.restore();
}

function drawMainContentLayer(mainTarget, dx, dy, dw, dh, isStaticView) {
    if (state.viewType === 'video') {
        if (state.isComposite) {
            if (state.secondaryImage) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(dx, dy, dw, dh);
                ctx.clip();
                ctx.drawImage(state.secondaryImage, dx, dy, dw, dh);
                ctx.restore();
            }
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.rect(dx, dy, dw, dh);
            ctx.clip();
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(mainTarget, dx, dy, dw, dh);
            ctx.restore();
        }
    } else {
        // 静态图
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, dw, dh);
        ctx.clip();
        ctx.drawImage(mainTarget, dx, dy, dw, dh);
        ctx.restore();
    }
}

function drawOverlayVideoLayer(dx, dy, dw, dh) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(GLOBAL_ASSETS.overlayVideo, dx, dy, dw, dh);
    ctx.restore();
}
