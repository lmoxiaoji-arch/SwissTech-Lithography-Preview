// js/config.js

// ==========================================
// 部署环境配置（云服务器自动适配）
// ==========================================
export const DEPLOY_CONFIG = {
    // 自动检测：本地开发使用 'project_A'，云服务器使用 ''
    AUTO_DETECT: true,

    // 手动配置（当 AUTO_DETECT = false 时使用）
    ASSET_BASE_PATH: 'project_A',  // 本地开发: 'project_A' | 云服务器: ''

    // 检测逻辑：如果 URL 包含 localhost、127.0.0.1 或云服务器IP，则使用 project_A 路径
    isLocal() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '47.98.170.16' ||  // 云服务器IP
            window.location.hostname === '';
    },

    // 获取资源基础路径
    getBasePath() {
        if (this.AUTO_DETECT) {
            // 自动检测：本地环境使用 project_A，云服务器留空
            return this.isLocal() ? 'project_A' : '';
        }
        return this.ASSET_BASE_PATH;
    },

    // 构建完整路径
    buildPath(relativePath) {
        const base = this.getBasePath();
        if (!base) return relativePath;
        return `${base}/${relativePath}`;
    }
};

// ==========================================
// 应用全局配置
// ==========================================
export const GLOBAL_CONFIG = {
    SENSITIVITY: 0.010,       // 视频拖动灵敏度
    MIN_ZOOM: 0.8,            // 最小缩放变为 80%
    MAX_ZOOM: 1.2,
    DAMPING_FACTOR: 0.15,     // 平移阻尼
    SPRING_STRENGTH: 0.12,    // 回弹强度
    BG_SENSITIVITY: 10,       // 背景位移灵敏度
    CANVAS_TILT_STRENGTH: 8,  // 画布倾斜强度
    MAX_TILT: 30,             // 最大倾斜角度
};

export const BASE_VIEW_CONFIG = {
    '1': {
        type: 'video', subView: '1.1', name: '正视图', btnId: 'btn-view-1',
        videoFile: 'effect_overview_front.mp4',
        imageFileV1: 'effect_overview_front.png', // Special for V1
    },
    '1.1': {
        type: 'video', mainView: '1', name: '背视图', btnId: 'btn-view-1',
        videoFile: 'effect_overview_back.mp4',
        imageFileV1: 'effect_overview_back.png', // Special for V1
    },
    '2': {
        type: 'video', subView: '2.1', name: '左视图', btnId: 'btn-view-2',
        videoFile: 'effect_overview_left.mp4',
    },
    '2.1': {
        type: 'video', mainView: '2', name: '右视图', btnId: 'btn-view-2',
        videoFile: 'effect_overview_right.mp4',
    },
    '3': {
        type: 'video', subView: '3.1', name: '俯视图', btnId: 'btn-view-3',
        videoFile: 'effect_overview_top.mp4',
    },
    '3.1': {
        type: 'video', mainView: '3', name: '仰视图', btnId: 'btn-view-3',
        videoFile: 'effect_overview_bottom.mp4',
    },
    'static': {
        type: 'static', subView: 'static_hdt', name: '整体平面图', btnId: 'btn-view-static',
        viewFolder: 'static',
    },
    'static_hdt': {
        type: 'static', mainView: 'static', name: '整体平面图', btnId: 'btn-view-static',
        viewFolder: 'static_hdt',
    }
};

// ==========================================
// 全局状态和缓存
// ==========================================
export const IMAGE_CACHE = {};
export const IS_EMPTY = {};
export const IS_SINGLE_FILE = {}; 

export const GLOBAL_ASSETS = {
    cloud: null,
    overlayVideo: null,
    loaded: false
};

export const state = {
    currentVersion: 'v1',
    currentViewId: null,
    globalVideoTime: null,
    zoom: 0.8,
    targetZoom: 0.8,
    pan: { x: 0, y: 0 },
    targetPan: { x: 0, y: 0 },
    isDragging: false,
    isRebounding: false,
    lastX: 0, 
    lastY: 0, 
    lastPinch: 0,
    sidebarCollapsed: false,
    parallax: { x: 0, y: 0 },
    viewType: 'none',
    video: null,
    image: null,
    isComposite: false,
    secondaryImage: null,
    targetVideoTime: 0,
    savedViewStates: {}
};
