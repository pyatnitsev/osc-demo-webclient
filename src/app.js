import OSC from 'osc-js';
import './assets/style.css';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import bgBluePath from './assets/bg-blue.svg';
import bgPath from './assets/bg.svg';

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

const buttonsWrapper = document.querySelector('.buttons-wrapper');
if (buttonsWrapper && !buttonsWrapper.hasButtonHandler) {
    buttonsWrapper.addEventListener('click', event => {
        const button = event.target.closest('.main-button');
        if (!button) return;

        const buttons = buttonsWrapper.querySelectorAll('.main-button');
        const prevActive = buttonsWrapper.querySelector('.main-button-active');

        // Если клик по уже активной — снимаем активность и отправляем "отжата"
        if (button.classList.contains('main-button-active')) {
            button.classList.remove('main-button-active');
            onButtonStateChanged(button, false);
        } else {
            // Отжать предыдущую, если была
            if (prevActive && prevActive !== button) {
                prevActive.classList.remove('main-button-active');
                onButtonStateChanged(prevActive, false);
            }
            // Активировать новую
            button.classList.add('main-button-active');
            onButtonStateChanged(button, true);
        }
    });
    buttonsWrapper.hasButtonHandler = true;
}

function onButtonStateChanged(button, isActive) {
    const name = button.dataset.name;

    const message = new OSC.Message('/button'+name, isActive ? 1 : 0);
    console.log(`Кнопка "${name}"`, isActive ? 'нажата' : 'отжата');

    osc.send(message);
}