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
    host : '192.168.1.2',
    port: 8081
}


const osc = new OSC({ plugin: new OSC.WebsocketClientPlugin(config) });

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


});

osc.open(); // открыть соединение WebSocket