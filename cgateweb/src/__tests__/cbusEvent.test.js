'use strict';

const CBusEvent = require('../cbusEvent');

describe('CBusEvent', () => {
    describe('standard lighting events', () => {
        test('parses lighting on event', () => {
            const e = new CBusEvent('lighting on 254/56/4');
            expect(e.isValid()).toBe(true);
            expect(e.getDeviceType()).toBe('lighting');
            expect(e.getAction()).toBe('on');
            expect(e.getNetwork()).toBe('254');
            expect(e.getApplication()).toBe('56');
            expect(e.getGroup()).toBe('4');
            expect(e.getLevel()).toBeNull();
        });

        test('parses lighting off event', () => {
            const e = new CBusEvent('lighting off 254/56/4');
            expect(e.isValid()).toBe(true);
            expect(e.getAction()).toBe('off');
        });

        test('parses lighting ramp event with plain integer level', () => {
            const e = new CBusEvent('lighting ramp 254/56/4 128');
            expect(e.isValid()).toBe(true);
            expect(e.getAction()).toBe('ramp');
            expect(e.getLevel()).toBe(128);
        });

        test('parses lighting ramp event with level 0', () => {
            const e = new CBusEvent('lighting ramp 254/56/4 0');
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(0);
        });

        test('parses event with project-prefixed address', () => {
            const e = new CBusEvent('lighting on //PROJECT/254/56/7');
            expect(e.isValid()).toBe(true);
            expect(e.getNetwork()).toBe('254');
            expect(e.getApplication()).toBe('56');
            expect(e.getGroup()).toBe('7');
        });
    });

    describe('300 status response', () => {
        test('parses level=255', () => {
            const e = new CBusEvent('300 //PROJECT/254/56/1: level=255');
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(255);
            expect(e.getAction()).toBe('on');
            expect(e.getGroup()).toBe('1');
        });

        test('parses level=0', () => {
            const e = new CBusEvent('300 //PROJECT/254/56/2: level=0');
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(0);
            expect(e.getAction()).toBe('off');
        });
    });

    describe('730 events', () => {
        test('extracts level=0 from 730 event, not leading digit of UUID', () => {
            const raw = '20260401-155917.864 730 //CB/254/56/5 6c2b7f80-1234-5678-abcd-000000000000 new level=0 sourceunit=8 ramptime=0';
            const e = new CBusEvent(raw);
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(0);
            expect(e.getGroup()).toBe('5');
            expect(e.getNetwork()).toBe('254');
            expect(e.getApplication()).toBe('56');
        });

        test('extracts level=255 from 730 event', () => {
            const raw = '20260401-160000.000 730 //CB/254/56/7 abc12345-0000-0000-0000-000000000000 new level=255 sourceunit=1 ramptime=0';
            const e = new CBusEvent(raw);
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(255);
            expect(e.getGroup()).toBe('7');
        });

        test('extracts level=128 from 730 event', () => {
            const raw = '20260401-161000.000 730 //HOME/254/56/3 00000000-0000-0000-0000-000000000000 new level=128 sourceunit=2 ramptime=10';
            const e = new CBusEvent(raw);
            expect(e.isValid()).toBe(true);
            expect(e.getLevel()).toBe(128);
        });
    });

    describe('invalid events', () => {
        test('returns invalid for empty string', () => {
            const e = new CBusEvent('');
            expect(e.isValid()).toBe(false);
        });

        test('returns invalid for unrecognized format', () => {
            const e = new CBusEvent('not a valid event at all !!!');
            expect(e.isValid()).toBe(false);
        });
    });
});
