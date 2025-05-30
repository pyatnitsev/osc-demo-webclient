import OSC from 'osc-js';
import './assets/style.css';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import bgBluePath from './assets/bg-blue.svg';
import bgPath from './assets/bg.svg';

if (document.querySelector('.main-wrapper')) {
    document.querySelector('.main-wrapper').style.backgroundImage = `url(${bgPath})`;
}

if (document.querySelector('.main-wrapper.theme-blue')) {
    document.querySelector('.main-wrapper.theme-blue').style.backgroundImage = `url(${bgBluePath})`;
}

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

function toggleActiveClass(buttons, activeClass = 'active') {
    if (!buttons || (!NodeList.prototype.isPrototypeOf(buttons) && !Array.isArray(buttons))) {
        console.error('Первый аргумент должен быть NodeList или массивом элементов');
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains(activeClass)) {
                button.classList.remove(activeClass);
            } else {
                buttons.forEach(btn => btn.classList.remove(activeClass));
                button.classList.add(activeClass);
            }
        });
    });
}

const buttons = document.querySelectorAll('.main-button');
toggleActiveClass(buttons);

/*
document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Получаем значение из текстового поля
    var text = document.getElementById('textInput').value;

    if (text === '') {
        return;
    }

    var encodedText = btoa(unescape(encodeURIComponent(text)));
    // Создание OSC-сообщения с этим текстом как аргументом
    const message = new OSC.Message('/sendText', encodedText);
    document.getElementById('textInput').value = '';
    // Отправляем сообщение
    osc.send(message);
});*/
