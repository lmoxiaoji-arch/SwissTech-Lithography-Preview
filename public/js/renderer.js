// js/renderer.js
import { state, GLOBAL_ASSETS, GLOBAL_CONFIG } from './config.js';

let canvas, ctx;
let lightCanvas, lightCtx;

export function initRenderer(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');

    // 初始化用于光照遮罩的离屏 Canvas
    lightCanvas = document.createElement('canvas');
    lightCtx = lightCanvas.getContext('2d');

    resize();
}

export function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth * 1.5;
    canvas.height = window.innerHeight * 1.5;

    if (lightCanvas) {
        lightCanvas.width = canvas.width;
        lightCanvas.height = canvas.height;
    }

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

    // 计算缩放基准
    // 如果是盒子的任何面 (视频类型)，强制使用最大面 (即正背视图，通常为 1170x1946) 作为物理缩放参考盒
    // 这样，侧边 (窄边) 和顶部 (扁平) 在同一屏幕下展示时，大小比例严格符合真实长宽比，不会被独立拉伸放大
    let refW = tw;
    let refH = th;
    if (state.viewType === 'video') {
        refW = 1170; // 盒子最大宽度参考
        refH = 1946; // 盒子最大高度参考
    }

    const baseScale = Math.min(ww / refW, wh / refH);
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

    // Layer 4: 动态光影层 (跟随视差的全局明暗)，通过离屏渲染防止污染透明底
    drawLightingLayer(dx, dy, dw, dh, mainTarget);
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

function drawLightingLayer(dx, dy, dw, dh, mainTarget) {
    if (!state.parallax || !lightCanvas || !lightCtx) return;

    // 清理离屏画布
    lightCtx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);

    const lightOffsetX = state.parallax.x * canvas.width * 0.5;
    const lightOffsetY = state.parallax.y * canvas.height * 0.5;
    const lightX = canvas.width / 2 + lightOffsetX;
    const lightY = canvas.height * 0.4 + lightOffsetY;
    const radius = Math.max(canvas.width, canvas.height) * 0.8;

    const gradient = lightCtx.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius);

    // 【调整项】光照颜色与混合参数
    // 使用 rgba(255,255,255) 来提亮，用 rgba(0,0,0) 来加深阴影
    // 对于 overlay 等混合模式，需要稍微克制透明度以防过度曝光
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    gradient.addColorStop(0.5, 'rgba(128, 128, 128, 0.1)'); // 中间平滑过渡过度带
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

    // 1. 在离屏画布先画满光照渐变
    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = gradient;
    lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);

    // 2. 利用物体的形状（Alpha通道）去裁剪刚画好的光照层
    // destination-in：只保留与新图形相交的已有内容，其余全变透明
    // 这样离屏画布上剩下的就是一个纯粹的、刚好是产品形状的“光膜”
    lightCtx.globalCompositeOperation = 'destination-in';
    lightCtx.drawImage(mainTarget, dx, dy, dw, dh);

    // 3. 将抠好形状的纯净“光照薄膜”叠加到主画布
    ctx.save();
    // 'overlay' 可以提升整体质感，高光更亮、阴影更深
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.restore();
}
