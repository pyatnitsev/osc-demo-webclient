import OSC from 'osc-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

const config = {
    websocket: { port: 8080 }, // порт WebSocket сервера
}

// Инициализируем таймер и OSC клиента
let typingTimer; // Timer identifier
const doneTypingInterval = 200; // Время в мс (200 мс)

const osc = new OSC({ plugin: new OSC.WebsocketClientPlugin(config) });

document.getElementById('textInput').addEventListener('input', function() {
    clearTimeout(typingTimer); // Сброс предыдущего таймера
    typingTimer = setTimeout(doneTyping, doneTypingInterval); // Запуск нового таймера
});

function doneTyping() {
    var text = document.getElementById('textInput').value;
    var encodedText = btoa(unescape(encodeURIComponent(text))); // Кодирование в base64

    // Создаем OSC-сообщение и отправляем
    const message = new OSC.Message('/sendText', encodedText);
    osc.send(message);
}


// document.getElementById('sendButton').addEventListener('click', function() {
//     // Получаем значение из текстового поля
//     var text = document.getElementById('textInput').value;
//
//     var encodedText = btoa(unescape(encodeURIComponent(text)));
//     // Создание OSC-сообщения с этим текстом как аргументом
//     const message = new OSC.Message('/sendText', encodedText);
//     // Отправляем сообщение
//     osc.send(message);
// });

osc.open(); // открыть соединение WebSocket