import OSC from 'osc-js';
import './assets/style.css';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import bgBluePath from './assets/bg-blue.svg';
import bgPath from './assets/bg.svg';

const RESET_TIME = Number(process.env.RESET_TIME || 0); // в секундах, 0 = автоотжатие отключено

// Установка фоновой картинки
if (document.querySelector('.main-wrapper')) {
    document.querySelector('.main-wrapper').style.backgroundImage = `url(${bgPath})`;
}

if (document.querySelector('.main-wrapper.theme-blue')) {
    document.querySelector('.main-wrapper.theme-blue').style.backgroundImage = `url(${bgBluePath})`;
}

// Настройка OSC
const config = {
    host: process.env.WS_HOST || 'localhost',
    port: process.env.WS_PORT ? Number(process.env.WS_PORT) : 8081
};

let osc;
const maxRetries = 10;
let retryCount = 0;

function setupOSC() {
    osc = new OSC({ plugin: new OSC.WebsocketClientPlugin(config) });

    osc.on('open', () => {
        console.log('WebSocket connection opened');
        retryCount = 0; // Сброс счетчика попыток при успешном подключении
    });

    osc.on('close', () => {
        console.log('WebSocket connection closed');
        retryConnection();
    });

    osc.on('error', (error) => {
        console.log('WebSocket error:', error);
        osc.close(); // Закрыть соединение при ошибке
    });

    osc.open(); // открыть соединение WebSocket
}

function retryConnection() {
    if (retryCount < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Экспоненциальная задержка до 30 секунд
        retryCount++;
        setTimeout(() => {
            console.log(`Attempting to reconnect... (${retryCount}/${maxRetries})`);
            setupOSC();
        }, retryDelay);
    } else {
        console.log('Max retries reached. Could not reconnect to WebSocket.');
    }
}

setupOSC();

let resetTimer = null;

const buttonsWrapper = document.querySelector('.buttons-wrapper');
if (buttonsWrapper && !buttonsWrapper.hasButtonHandler) {
    buttonsWrapper.addEventListener('click', event => {
        const button = event.target.closest('.main-button');
        if (!button) return;

        const buttons = buttonsWrapper.querySelectorAll('.main-button');
        const prevActive = buttonsWrapper.querySelector('.main-button--active');

        // Сброс таймера на каждый клик, если надо
        if (RESET_TIME > 0) {
            resetButtonsTimer(buttons);
        }

        if (button.classList.contains('main-button--active')) {
            button.classList.remove('main-button--active');
            onButtonStateChanged(button, false);

            // --- проверяем осталась ли активная кнопка ---
            const anyActive = buttonsWrapper.querySelector('.main-button--active');
            if (!anyActive) {
                onAllButtonsOff();
            }
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
        if (anyWasActive)  {
            onAllButtonsOff();
        }
    }, RESET_TIME * 1000);
}

function onButtonStateChanged(button, isActive) {
    const name = button.dataset.name;
    const message = new OSC.Message('/button' + name, isActive ? 1 : 0);
    console.log(`Кнопка "${name}"`, isActive ? 'нажата' : 'отжата');
    osc.send(message);
}

function onAllButtonsOff() {
    const message = new OSC.Message('/off', 1);
    console.log('Все кнопки отжаты, отправлено событие /off = 1');
    osc.send(message);
}

// Логика длинного нажатия на логотип
const LONG_PRESS_TIME = 2000; // 2 секунды в миллисекундах
let longPressTimer = null;
let longPressTriggered = false;

function onLogoLongPress() {
    const message = new OSC.Message('/logo', 1);
    console.log('Логотип долго нажат, отправлено событие /logo');
    osc.send(message);
}

function setupLogoLongPress(selector) {
    document.querySelectorAll(selector).forEach(logoEl => {
        // Для мыши
        logoEl.addEventListener('mousedown', () => {
            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                onLogoLongPress();
            }, LONG_PRESS_TIME);
        });
        logoEl.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
        });
        logoEl.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
        });

        // Для touch-устройств
        logoEl.addEventListener('touchstart', () => {
            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                onLogoLongPress();
            }, LONG_PRESS_TIME);
        });
        logoEl.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        logoEl.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });

        // Отключить стандартный клик, если длинное нажатие сработало (не обязательно, по ситуации)
        logoEl.addEventListener('click', e => {
            if (longPressTriggered) e.preventDefault();
        });
    });
}

// Вызов функции для обоих логотипов (или укажи нужный селектор)
setupLogoLongPress('.logo-link');
