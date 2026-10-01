'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, 'BodrikToast.js'), 'utf8');
const ru = JSON.parse(readFileSync(join(__dirname, '../lang/ru.json'), 'utf8'));

/** Run the shared toast entry point with the real dictionary and a captured renderer. */
function harness(native = true) {
    const renders = [];
    const context = {
        window: { i18n: { isNative: () => native, t: (key) => (native ? ru.toasts[key] || key : key) } },
        swalBackground: '#222',
        Swal: { mixin: (options) => ({ fire: (data) => renders.push({ options, data }) }) },
    };
    vm.runInNewContext(source, context);
    return { translate: context.window.BodrikToast.translate, log: context.userLog, renders, context };
}

for (const [name, message, expected] of [
    ['copied meeting link', 'Meeting URL copied to clipboard 👍', 'URL встречи скопирован в буфер обмена 👍'],
    ['microphone error', 'Could not update microphone processing', 'Не удалось изменить обработку микрофона'],
    ['setting status', 'Buttons always visible enabled', 'Кнопки всегда видны: включено'],
    ['uppercase status', 'BROADCASTING OFF', 'Трансляция: выключено'],
    ['participant role', 'Alice promoted you to presenter', 'Alice назначил вас ведущим'],
    [
        'file and replacement characters',
        'The file $& report.mp3 was sent successfully.',
        'Файл $& report.mp3 успешно отправлен.',
    ],
    ['error details', 'Failed to load device: ERR_UNSUPPORTED', 'Не удалось загрузить устройство: ERR_UNSUPPORTED'],
    ['countdown', 'Returning to main room in 12 seconds', 'Возвращение в основную комнату через 12 сек.'],
    ['already Russian', 'Готово', 'Готово'],
    ['unknown server error', 'API ERROR 123', 'API ERROR 123'],
    ['ordinary user text', '<b>Alice</b>: hello', '<b>Alice</b>: hello'],
    [
        'user content resembling an application message',
        '<b>Alice</b>: someone disconnected',
        '<b>Alice</b>: someone disconnected',
    ],
]) {
    test(`toast translation: ${name}`, () => assert.equal(harness().translate(message), expected));
}

test('icon markup and dynamic names are preserved', () => {
    const icon = '<i class="fas fa-user"></i>';
    assert.equal(harness().translate(`${icon} Alice disconnected`), `${icon} Alice отключился`);
});

test('English selection preserves notifications without translating placeholders', () => {
    assert.equal(harness(false).translate('Buttons always visible enabled'), 'Buttons always visible enabled');
});

test('global userLog translates while retaining toast options', () => {
    const { log, renders } = harness();
    log('info', 'Meeting URL copied to clipboard 👍', 'bottom-end', 1234);
    assert.equal(renders[0].data.title, ru.toasts['Meeting URL copied to clipboard 👍']);
    assert.equal(renders[0].data.icon, 'info');
    assert.equal(renders[0].options.position, 'bottom-end');
    assert.equal(renders[0].options.timer, 1234);
});

test('RoomClient notifications translate without a window.RoomClient property', () => {
    const { context, renders } = harness();
    const client = readFileSync(join(__dirname, 'RoomClient.js'), 'utf8');
    vm.runInNewContext(`${client}; globalThis.Client = RoomClient`, context);
    assert.equal(context.window.RoomClient, undefined);
    context.Client.prototype.userLog.call({}, 'warning', 'No peers in this room yet', 'top-end');
    assert.equal(renders[0].data.title, ru.toasts['No peers in this room yet']);
    assert.equal(renders[0].options.timer, 5000);
    context.Client.prototype.userLog.call({}, 'html', '<b>Notice</b>', 'center', 900);
    assert.equal(renders[1].data.html, '<b>Notice</b>');
});

test('both notification paths load and use the shared translator', () => {
    const page = readFileSync(join(__dirname, '../views/Room.html'), 'utf8');
    assert.match(page, /BodrikToast\.js\?v=2/);
    assert.match(
        readFileSync(join(__dirname, 'RoomClient.js'), 'utf8'),
        /window\.BodrikToast\.show\(icon, message, position, timer\)/
    );
    assert.doesNotMatch(readFileSync(join(__dirname, 'Room.js'), 'utf8'), /function userLog\(/);
});
