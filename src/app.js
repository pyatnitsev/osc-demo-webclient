import OSC from 'osc-js';
import './assets/style.css';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import bgBluePath from './assets/bg-blue.svg';
import bgPath from './assets/bg.svg';

const RESET_TIME = Number(process.env.RESET_TIME || 0); // в секундах, 0 = автоотжатие отключено
const WS_HOST = process.env.WS_HOST || 'localhost';
const WS_PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080

// --- STATUS UI ---
function showConnectionStatus(status) {
    const el = document.getElementById('connection-status');
    if (!el) return;
    if (status === 'connected') {
        el.style.display = 'none';
    } else if (status === 'disconnected') {
        el.style.display = 'block';
    }
}

let ws;
let retryCount = 0;

function setupWS() {

    ws = new WebSocket(`ws://${WS_HOST}:${WS_PORT}`);

    ws.onopen = () => {
        console.log('WebSocket connection opened');
        retryCount = 0; // Сброс счетчика попыток при успешном подключении
        showConnectionStatus('connected');
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
        showConnectionStatus('disconnected');
        retryConnection();
    }

    ws.onerror = (error) => {
        console.log('WebSocket error:', error);
        ws.close();
    }

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log('Получено с сервера:', msg);

        if (msg.type === 'state_update' && msg.payload) {
            handleStateUpdate(msg.payload);
        }
        if (msg.type === 'state_full' && msg.payload) {
            console.log('Применяем state_full:', msg.payload);
            handleStateUpdate(msg.payload);
        }
        if (msg.type === 'event') {
            handleEvent(msg.payload);
        }
    };
}

// --- INFINITE RECONNECT ---
function retryConnection() {
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // до 30 сек максимум между попытками
    retryCount++;
    setTimeout(() => {
        console.log(`Attempting to reconnect... (try #${retryCount}, delay ${retryDelay}ms)`);
        setupWS();
    }, retryDelay);
}

function handleStateUpdate(payload) {
    Object.entries(payload).forEach(([key, value]) => {
        // Находим кнопку по data-name
        if (key.startsWith('button')) {
            const name = key.replace('button', '');
            const button = document.querySelector(`.main-button[data-name="${name}"]`);
            if (button) {
                if (value) {
                    button.classList.add('main-button--active');
                } else {
                    button.classList.remove('main-button--active');
                }
            }
        }
    });
}

function handleEvent(payload) {
    if (payload.off) {
        document.querySelectorAll('.main-button.main-button--active')
            .forEach(btn => btn.classList.remove('main-button--active'));
    }

    if (payload.logo) {
        document.querySelectorAll('.main-button.main-button--active')
            .forEach(btn => btn.classList.remove('main-button--active'));

        const anyActive = buttonsWrapper.querySelector('.main-button--active');
        if (!anyActive) {
            onAllButtonsOff();
        }
    }
}

setupWS();

// --- BACKGROUND IMAGE ---
if (document.querySelector('.main-wrapper')) {
    document.querySelector('.main-wrapper').style.backgroundImage = `url(${bgPath})`;
}
if (document.querySelector('.main-wrapper.theme-blue')) {
    document.querySelector('.main-wrapper.theme-blue').style.backgroundImage = `url(${bgBluePath})`;
}

// --- BUTTON LOGIC ---
let resetTimer = null;
const buttonsWrapper = document.querySelector('.buttons-wrapper');
if (buttonsWrapper && !buttonsWrapper.hasButtonHandler) {
    buttonsWrapper.addEventListener('click', event => {
        const button = event.target.closest('.main-button');
        if (!button) return;

        const buttons = buttonsWrapper.querySelectorAll('.main-button');
        const prevActive = buttonsWrapper.querySelector('.main-button--active');

        // Сброс таймера на каждый клик, если надо
        if (RESET_TIME > 0) resetButtonsTimer(buttons);

        if (button.classList.contains('main-button--active')) {
            button.classList.remove('main-button--active');
            onButtonStateChanged(button, false);

            // --- проверяем осталась ли активная кнопка ---
            const anyActive = buttonsWrapper.querySelector('.main-button--active');
            if (!anyActive) onAllButtonsOff();
        } else {
            if (prevActive && prevActive !== button) {
                prevActive.classList.remove('main-button--active');
                onButtonStateChanged(prevActive, false);
            }
            button.classList.add('main-button--active');
            onButtonStateChanged(button, true);
        }
    });
    buttonsWrapper.hasButtonHandler = true;
}

function resetButtonsTimer(buttons) {
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        // Снимаем активность со всех
        let anyWasActive = false;
        buttons.forEach(button => {
            if (button.classList.contains('main-button--active')) {
                button.classList.remove('main-button--active');
                onButtonStateChanged(button, false); // имитируем клик что человек сам "отжал"
                anyWasActive = true;
            }
        });
        if (anyWasActive)  onAllButtonsOff();
    }, RESET_TIME * 1000);
}

function onButtonStateChanged(button, isActive) {
    if (!ws) return;
    const name = button.dataset.name;

    ws.send(JSON.stringify({
        type: "state_update",
        payload: { ["button" + name]: isActive }
    }));

    ws.send(JSON.stringify({
        type: "osc_send",
        address: `/button${name}`,
        valueType: "int",
        value: isActive ? 1 : 0
    }));

    console.log(`Кнопка "${name}"`, isActive ? 'нажата' : 'отжата');
}

function onAllButtonsOff() {
    if (!ws) return;

    ws.send(JSON.stringify({
        type: "event",
        payload: { "off": true }
    }));

    ws.send(JSON.stringify({
        type: "osc_send",
        address: `/off`,
        valueType: "int",
        value: 1
    }));

    console.log('Все кнопки отжаты, отправлено событие /off = 1');
}

// --- LOGO CLICK/SIMPLE TAP LOGIC ---
function onLogoClick() {
    if (!ws) return;

    ws.send(JSON.stringify({
        type: "event",
        payload: { "logo": true }
    }));

    ws.send(JSON.stringify({
        type: "osc_send",
        address: `/logo`,
        valueType: "int",
        value: 1
    }));

    console.log('Логотип нажат, отправлено событие /logo');
}

function setupLogoClick(selector) {
    document.querySelectorAll(selector).forEach(logoEl => {
        logoEl.addEventListener('click', onLogoClick);

        // Для мобильных: отдельно поддержка tap/touchstart, если нужно
        logoEl.addEventListener('touchstart', function(e) {
            // Чтобы tap не дублировал событие click, можно отменить всплытие
            e.preventDefault();
            onLogoClick();
        }, { passive: false });
    });
}
setupLogoClick('.logo-link');

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registered: ', registration);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}