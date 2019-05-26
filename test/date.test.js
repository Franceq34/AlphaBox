var assert = require('assert');
const { hexaVeeToDate, toMinsSecs, splitBuffer, toHours, toMonth, nbDaySinceDebMonth, toYears } = require('../calculDate');

const { inverseStringBuffer } = require("../calculDate");
// Test des dates
let dates = [
    {
        veeBuffer: new Buffer.from([0x00, 0x42, 0x00, 0x00]),
        split: [0, 66, 0, 0],
        real: new Date('2000-01-01T00:00:00.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0x7e, 0x00, 0x16]),
        split: [0, 126, 0, 22],
        real: new Date('2000-01-31T00:00:22.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0x82, 0x27, 0x09]),
        split: [0, 130, 2, 1801],
        real: new Date('2000-02-01T02:28:09.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0x8a, 0x1e, 0x74]),
        split: [0, 138, 1, 3700],
        real: new Date('2000-02-05T01:57:52.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0x90, 0x1d, 0xf2]),
        split: [0, 144, 1, 3570],
        real: new Date('2000-02-08T01:55:50.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0x9e, 0x1a, 0xe9]),
        split: [0, 158, 1, 2793],
        real: new Date('2000-02-15T01:43:41.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0xb2, 0x1b, 0x0f]),
        split: [0, 178, 1, 2831],
        real: new Date('2000-02-25T01:44:15.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0xb8, 0x17, 0x8c]),
        split: [0, 184, 1, 1932],
        real: new Date('2000-02-28T01:30:12.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0xba, 0x00, 0x7b]),
        split: [0, 186, 0, 123],
        real: new Date('2000-02-29T00:01:59.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0xc2, 0x00, 0xd1]),
        split: [0, 194, 0, 209],
        real: new Date('2000-03-01T00:03:17.000'),
    },
    {
        veeBuffer: new Buffer.from([0x00, 0xfe, 0x0c, 0xd0]),
        split: [0, 254, 0, 3280],
        real: new Date('2000-03-31T00:51:16.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0x02, 0x26, 0x89]),
        split: [1, 2, 2, 1673],
        real: new Date('2000-04-01T02:26:09.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0x3c, 0x26, 0x9e]),
        split: [1, 60, 2, 1694],
        real: new Date('2000-04-30T02:26:30.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0x42, 0x29, 0x28]),
        split: [01, 66, 2, 2344],
        real: new Date('2000-05-01T02:36:40.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0x4a, 0x00, 0x16]),
        split: [1, 74, 0, 22],
        real: new Date('2000-05-05T00:00:22.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0xfe, 0x02, 0x56]),
        split: [1, 254, 0, 598],
        real: new Date('2000-07-31T00:09:22.000'),
    },
    {
        veeBuffer: new Buffer.from([0x02, 0x02, 0x29, 0xb9]),
        split: [02, 02, 02, 2489],
        real: new Date('2000-08-01T02:38:57.000'),
    },

    {
        veeBuffer: new Buffer.from([0x03, 0x02, 0x01, 0xf8]),
        split: [3, 2, 00, 504],
        real: new Date('2000-12-01T00:07:56.000'),
    },
    {
        veeBuffer: new Buffer.from([0x03, 0x3f, 0x7e, 0xfb]),
        split: [3, 63, 7, 3835],
        real: new Date('2000-12-31T23:59:59.000'),
    },
    {
        veeBuffer: new Buffer.from([0x4d, 0x54, 0x0e, 0xfb]),
        split: [77, 84, 0, 3835],
        real: new Date('2019-05-10T00:59:59.000'),
    },

    {
        veeBuffer: new Buffer.from([0x01, 0x42, 0x00, 0x48]),
        split: [1, 66, 0, 72],
        real: new Date('2000-05-01T00:01:08.000'),
    },
    {
        veeBuffer: new Buffer.from([0x01, 0x38, 0x00, 0xcd]),
        split: [1, 56, 0, 205],
        real: new Date('2000-04-28T00:03:13.000'),
    },
    {
        veeBuffer: new Buffer.from([0x4d, 0x53, 0x3a, 0x0f]),
        split: [77, 83, 3, 2575],
        real: new Date('2019-05-09T19:40:15.000'),
    },
]


describe('Date converter', function () {
    describe('splitBuffer', function () {
        dates.forEach(date => {
            let splitTest = splitBuffer(date.veeBuffer);
            it('cut correctly ' + date.veeBuffer.toString('hex'), function () {
                assert.deepStrictEqual(date.split, splitTest);
            });
        });

    });

    describe('toMinsSecs', function () {
        dates.forEach(date => {
            let [minutes, secondes] = toMinsSecs(date.split[3]);
            it('transform secondes ' + date.split, function () {
                assert.equal(secondes, date.real.getSeconds());
            });
        });

        dates.forEach(date => {
            let [minutes, secondes] = toMinsSecs(date.split[3]);
            it('transform minutes ' + date.split, function () {
                assert.equal(minutes, date.real.getMinutes())
            })
        });

    });

    describe('toHours', function () {
        dates.forEach(date => {
            let hours = toHours(date.split[1], date.split[2]);
            it('extact hours ' + date.real, function () {
                assert.equal(hours, date.real.getHours());
            });
        });

    });

    describe('toMonth', function () {
        dates.forEach(date => {
            let month = toMonth(date.split[0], date.split[1]);
            it('should have the same month ' + date.real, function () {
                assert.equal(month, date.real.getMonth() )
            })
        });
    });

   

    describe('nbDaySinceDebMonth', function () {
        dates.forEach(date => {
            let day = nbDaySinceDebMonth(date.split[1]);
            it('should have the same day ' + date.real, function () {
                assert.equal(day, date.real.getDate());
            });
        });
    });

    describe('toYears', function() {
        dates.forEach(date => {
            it ('should be the same year', function () {
                assert.equal(toYears(date.split[0]), date.real.getFullYear());
            })
        })
    })

    describe('hexaVeeDate', function () {
        dates.forEach(date => {
            it ('should coverter correctly the date', function () {
                assert.deepStrictEqual(hexaVeeToDate(date.veeBuffer), date.real )
            });
        });
    });

    describe('testReverseDate', function () {
        let buf = "00568985";
        it ('should reverse the buffer correctly', function () {
            assert.equal(inverseStringBuffer(inverseStringBuffer(buf)),  buf);
            assert.equal(inverseStringBuffer(buf),  "85895600");
        });
    });
});

