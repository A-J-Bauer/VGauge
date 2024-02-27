'strict'

// VGauge 1.0.0
// copyright (c) 2024 A.J.Bauer
// licensed under the MIT License.
// see LICENSE.txt for full license text.

class VGauge {
    static isNonEmptyString(s) {
        return typeof s === 'string' && s !== '';
    }

    static isInteger(n) {
        return Number.isInteger(parseInt(n));
    }

    static isBoolean(b) {
        return typeof b === 'boolean';
    }

    static isNonEmptyArray(a) {
        return Array.isArray(a) && a.length > 0;
    }

    static hexRgbForColor(color) {
        let hr, hg, hb;
        if (color.startsWith('#')) {
            if (color.length === 4) {
                hr = color.charAt(1);
                hg = color.charAt(2);
                hb = color.charAt(3);
                return '#' + hr + hr + hg + hg + hb + hb;
            } else {
                return color.substring(0, 8);
            }
        } else if (color.startsWith('rgb')) {
            const allInts = color.match(/\d+/g);
            if (allInts.length > 2) {
                return '#' + parseInt(allInts[0]).toString(16) + parseInt(allInts[1]).toString(16) + parseInt(allInts[2]).toString(16);
            } else {
                console.error(this.constructor.name + ': unexpected value for rgb color');
                return '#ff0000';
            }
        } else if (color.length > 0) {
            console.error(this.constructor.name + ': unsupported color');
        }
    }

    static _getObjectInitializer(obj, n, t, c) {
        t = (t === undefined ? 0 : t);
        c = (c === undefined ? false : c);

        let str = ' '.repeat(t) + '{\r\n';
        t += n;

        const last = Object.keys(obj).slice(-1)[0];
        for (const [key, value] of Object.entries(obj)) {
            if (obj.hasOwnProperty(key)) {
                if (Array.isArray(value)) {
                    str += ' '.repeat(t) + key + ': [\r\n';
                    for (var i = 0; i < value.length; i++) {
                        str += VGauge._getObjectInitializer(value[i], n, t + n, (i !== value.length - 1)) + '\r\n';
                    }
                    str += ' '.repeat(t) + ']';
                }
                else if (typeof value === 'object') {
                    str += ' '.repeat(t) + key + ':\r\n' + VGauge._getObjectInitializer(value, n, t, key !== last) + (key !== last ? '\r\n' : '');
                }
                else if (typeof value === 'string') {
                    str += ' '.repeat(t) + key + ': \'' + value + '\'' + (key === last ? '' : ',\r\n');
                }
                else {
                    str += ' '.repeat(t) + key + ': ' + value + (key === last ? '' : ',\r\n');
                }
            }
        }

        str += '\r\n' + ' '.repeat(t - n) + '}' + (c ? ',' : '');

        return str;
    }

    static getObjectInitializer(obj, n) {
        n = (n === undefined ? 1 : n);
        return VGauge._getObjectInitializer(obj, n);
    }

    constructor(containerId, settings) {
        this._initialized = false;
        this._id = containerId;
        this._settings = settings;

        this._value = 0.0;
        this._targetValue = 0.0;

        this._rootStyles = null;
        this._bodyStyles = null;
        this._containerStyles = null;
        this._container = null;

        this._svg = null;
        this._svgElems = {
            background: null,
            helperGrid: null,
            labels: null,
            name: null,
            unit: null,
            value: null,
            cluster: null,
            ticks: null,
            icons: null,
            valueSector: null,
            targetValue: null,
            targetValueIndicator: null
        };

        this._tickLabelsMinusSignWidth = 0;
        this._tickLabelsHeight = 0;
        this._targetValueLabelMinusSignWidth = 0;
        this._targetValueLabelLabelsHeight = 0;

        this._fontFamily = '';
        this._currentColor = null;

        this._width = 0;
        this._height = 0;

        this.recreate();
    }

    recreate() {
        this._initialized = false;

        if (this._settings === undefined || this._settings === null || typeof this._settings !== 'object') {
            console.error(this.constructor.name + ': settings needed');
        }

        this._container = document.querySelector('#' + this._id);

        if (this._container) {

            this._container.innerHTML = '';

            this._width = this._height = this._container.clientWidth;

            this._rootStyles = getComputedStyle(document.documentElement);
            this._bodyStyles = window.getComputedStyle(document.body);
            this._containerStyles = window.getComputedStyle(this._container);

            this._fontFamily = VGauge.isNonEmptyString(this._settings.tweek.fontFamily)
                ? this._settings.tweek.fontFamily : this._bodyStyles.fontFamily.replace(/"/g, '');

            this._currentColor = this._containerStyles.color;

            this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this._svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            this._svg.setAttribute('viewBox', '-50 -50 100 100');
            //this._svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            this._svgElems.background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this._svgElems.background.setAttribute('x', '-50');
            this._svgElems.background.setAttribute('y', '-50');
            this._svgElems.background.setAttribute('width', '100');
            this._svgElems.background.setAttribute('height', '100');
            this._svgElems.background.setAttribute('stroke', 'none');
            this._svgElems.background.setAttribute('fill', 'none');
            this._svg.append(this._svgElems.background);

            if (VGauge.isBoolean(this._settings.useHelperGrid) && this._settings.useHelperGrid) {
                this._svgElems.helperGrid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                this._svgElems.helperGrid.setAttribute('opacity', '0');
                this._svgElems.helperGrid.setAttribute('stroke', 'currentColor');
                this._svgElems.helperGrid.setAttribute('stroke-width', '0.05');
                this._svg.append(this._svgElems.helperGrid);
            }

            this._svgElems.labels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this._svgElems.labels.setAttribute('font-family', this._fontFamily);

            this._svgElems.name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._svgElems.name.setAttribute('text-anchor', 'middle');
            this._svgElems.labels.append(this._svgElems.name);

            this._svgElems.unit = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._svgElems.unit.setAttribute('text-anchor', 'start');
            this._svgElems.labels.append(this._svgElems.unit);

            this._svgElems.value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._svgElems.value.setAttribute('text-anchor', 'end');
            this._svgElems.value.innerHTML = this._value.toFixed(this._settings.tweek.value.decimals);
            this._svgElems.labels.append(this._svgElems.value);

            this._svg.append(this._svgElems.labels);

            if (this._settings.cluster) {
                this._svgElems.cluster = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                if (VGauge.isNonEmptyArray(this._settings.cluster.sectors)) {
                    for (let i = 0; i < this._settings.cluster.sectors.length; i++) {
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', 'M 0,0');
                        this._svgElems.cluster.append(path);
                    }
                }
                this._svg.append(this._svgElems.cluster);
            }

            if (this._settings.cluster.useTickLabels) {
                this._svgElems.ticks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                this._svg.append(this._svgElems.ticks);
            }

            if (VGauge.isNonEmptyArray(this._settings.icons)) {
                this._svgElems.icons = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                for (var i = 0; i < this._settings.icons.length; i++) {
                    try {
                        const iconSettings = this._settings.icons[i];
                        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const transform = 'translate(' + iconSettings.x + ',' + iconSettings.y + ') '
                            + 'scale(' + iconSettings.scale + ',' + iconSettings.scale + ')';
                        icon.setAttribute('transform', transform);
                        icon.setAttribute('rid', iconSettings.id);
                        const d = (new DOMParser).parseFromString(iconSettings.path, "image/svg+xml").querySelector('[d]').getAttribute('d');
                        icon.setAttribute('d', d);
                        icon.setAttribute('opacity', iconSettings.opacity);
                        if (VGauge.isNonEmptyString(iconSettings.fill)) {
                            icon.setAttribute('fill', iconSettings.fill);
                        } else {
                            icon.setAttribute('fill', 'currentColor');
                        }
                        this._svgElems.icons.append(icon);

                    } catch (e) {
                        console.error(this.constructor.name + ': icons error : ' + error);
                    }
                }
                this._svg.append(this._svgElems.icons);
            }

            this._svgElems.valueSector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this._svg.append(this._svgElems.valueSector);

            if (this._settings.targetValue) {
                this._svgElems.targetValueIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                this._svg.append(this._svgElems.targetValueIndicator);

                this._svgElems.targetValueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                this._svg.append(this._svgElems.targetValueLabel);
            }

            this._container.prepend(this._svg);

            this._svg.setAttribute('style', 'user-select:none');

            if (VGauge.isNonEmptyString(this._settings.tweek.backgroundColor)) {
                this._svgElems.background.setAttribute('fill', VGauge.hexRgbForColor(this._settings.tweek.backgroundColor));
            } else {
                this._svgElems.background.setAttribute('fill', 'none');
            }

            if (VGauge.isBoolean(this._settings.useHelperGrid) && this._settings.useHelperGrid) {
                for (let i = -50; i <= 50; i += 10) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', i);
                    line.setAttribute('x2', i);
                    line.setAttribute('y1', -50);
                    line.setAttribute('y2', 50);
                    if (i === 0) {
                        line.setAttribute('stroke-width', '0.1');
                    }
                    this._svgElems.helperGrid.append(line);
                }

                for (let i = -50; i <= 50; i += 10) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', -50);
                    line.setAttribute('x2', 50);
                    line.setAttribute('y1', i);
                    line.setAttribute('y2', i);
                    if (i === 0) {
                        line.setAttribute('stroke-width', '0.1');
                    }
                    this._svgElems.helperGrid.append(line);
                }
            }

            this._svgElems.name.setAttribute('x', this._settings.tweek.name.x);
            this._svgElems.name.setAttribute('y', this._settings.tweek.name.y);
            if (VGauge.isNonEmptyString(this._settings.tweek.name.fill)) {
                this._svgElems.name.setAttribute('fill', this._settings.tweek.name.fill);
            } else {
                this._svgElems.name.setAttribute('fill', 'currentColor');
            }
            this._svgElems.name.setAttribute('font-size', this._settings.tweek.name.fontSize);
            this._svgElems.name.innerHTML = this._settings.name;

            this._svgElems.unit.setAttribute('x', this._settings.tweek.unit.x);
            this._svgElems.unit.setAttribute('y', this._settings.tweek.unit.y);
            if (VGauge.isNonEmptyString(this._settings.tweek.unit.fill)) {
                this._svgElems.unit.setAttribute('fill', this._settings.tweek.unit.fill);
            } else {
                this._svgElems.unit.setAttribute('fill', 'currentColor');
            }
            this._svgElems.unit.setAttribute('font-size', this._settings.tweek.unit.fontSize);
            this._svgElems.unit.innerHTML = this._settings.unit;

            this._svgElems.value.setAttribute('x', this._settings.tweek.value.x);
            this._svgElems.value.setAttribute('y', this._settings.tweek.value.y);
            this._svgElems.value.setAttribute('fill', this._settings.tweek.value.fill);
            if (VGauge.isNonEmptyString(this._settings.tweek.value.fill)) {
                this._svgElems.value.setAttribute('fill', this._settings.tweek.value.fill);
            } else {
                this._svgElems.value.setAttribute('fill', 'currentColor');
            }
            this._svgElems.value.setAttribute('font-size', this._settings.tweek.value.fontSize);

            if (this._settings.cluster && this._settings.cluster.sectors
                && VGauge.isNonEmptyArray(this._settings.cluster.sectors)) {

                const point1 = { x: 0.0, y: 0.0 };
                const point2 = { x: 0.0, y: 0.0 };
                const prevPoint1 = { x: 0.0, y: 0.0 };
                const prevPoint2 = { x: 0.0, y: 0.0 };

                let prevAngle = this._settings.startAngle * Math.PI / 180.0;
                let prevSweepTo = this._settings.min;
                let angle = 0.0;

                let addSvgTickLabel = (value, angle) => {
                    const textPoint = { x: 0, y: 0 };
                    const rotate = angle < Math.PI ? angle + 1.5 * Math.PI : angle + 0.5 * Math.PI;

                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.innerHTML = value;

                    textPoint.x = this._settings.tweek.ticks.radius * Math.cos(angle);
                    textPoint.y = this._settings.tweek.ticks.radius * Math.sin(angle);

                    const tr1 = 'translate(' + textPoint.x + ',' + textPoint.y + ')';
                    const rot = 'rotate(' + (rotate * 180.0 / Math.PI) + ')';
                    const tr2 = 'translate(' + (value < 0 ? -this._tickLabelsMinusSignWidth / 2.0 : 0) + ',' + (this._tickLabelsHeight / 2.0) + ')';
                    const transform = tr1 + ' ' + rot + ' ' + tr2;

                    label.setAttribute('transform', transform);

                    this._svgElems.ticks.append(label);
                }

                if (this._settings.cluster.useTickLabels) {
                    const measureCanvas = new OffscreenCanvas(1, 1);
                    const measureCtx = measureCanvas.getContext('2d');

                    measureCtx.textAlign = 'center';
                    measureCtx.textBaseline = 'alphabetic';

                    measureCtx.font = this._settings.tweek.ticks.fontSize + ' ' + this._fontFamily;
                    this._tickLabelsMinusSignWidth = measureCtx.measureText('-').width;
                    this._tickLabelsHeight = measureCtx.measureText('0123456789').actualBoundingBoxAscent;

                    if (this._settings.targetValue) {
                        measureCtx.font = this._settings.targetValue.label.fontSize + ' ' + this._fontFamily;
                        this._targetValueLabelMinusSignWidth = measureCtx.measureText('-').width;
                        this._targetValueLabelHeight = measureCtx.measureText('0123456789').actualBoundingBoxAscent;
                    }

                    this._svgElems.ticks.setAttribute('text-anchor', 'middle');
                    this._svgElems.ticks.setAttribute('dominant-baseline', 'alphabetic');
                    this._svgElems.ticks.setAttribute('font-size', this._settings.tweek.ticks.fontSize);
                    this._svgElems.ticks.setAttribute('font-family', this._fontFamily);
                    this._svgElems.ticks.setAttribute('opacity', this._settings.tweek.ticks.opacity)
                    if (VGauge.isNonEmptyString(this._settings.tweek.ticks.fill)) {
                        this._svgElems.ticks.setAttribute('fill', this._settings.tweek.ticks.fill);
                    } else {
                        this._svgElems.ticks.setAttribute('fill', 'currentColor');
                    }
                }

                for (let i = 0; i < this._settings.cluster.sectors.length; i++) {
                    const sector = this._settings.cluster.sectors[i];

                    prevPoint1.x = this._settings.cluster.innerRadius * Math.cos(prevAngle);
                    prevPoint1.y = this._settings.cluster.innerRadius * Math.sin(prevAngle);
                    prevPoint2.x = this._settings.cluster.outerRadius * Math.cos(prevAngle);
                    prevPoint2.y = this._settings.cluster.outerRadius * Math.sin(prevAngle);

                    angle = prevAngle + (sector.sweepTo - prevSweepTo)
                        * this._settings.sweepAngle
                        / (this._settings.max - this._settings.min)
                        * Math.PI / 180.0;

                    point1.x = this._settings.cluster.innerRadius * Math.cos(angle);
                    point1.y = this._settings.cluster.innerRadius * Math.sin(angle);
                    point2.x = this._settings.cluster.outerRadius * Math.cos(angle);
                    point2.y = this._settings.cluster.outerRadius * Math.sin(angle);

                    const d = 'M ' + prevPoint1.x + ',' + prevPoint1.y + ' '
                        + 'A ' + this._settings.cluster.innerRadius + ' ' + this._settings.cluster.innerRadius + ' ' + (angle - prevAngle) * 180.0 / Math.PI + ' '
                        + (angle - prevAngle > Math.PI ? '1' : '0') + ' 1 ' + point1.x + ' ' + point1.y + ' '
                        + 'L ' + point2.x + ',' + point2.y + ' '
                        + 'A ' + this._settings.cluster.outerRadius + ' ' + this._settings.cluster.outerRadius + ' ' + (angle - prevAngle) * 180.0 / Math.PI + ' '
                        + (angle - prevAngle > Math.PI ? '1' : '0') + ' 0 ' + prevPoint2.x + ' ' + prevPoint2.y + ' '
                        + 'L ' + prevPoint1.x + ',' + prevPoint1.y + ' Z';

                    const path = Array.from(this._svgElems.cluster.querySelectorAll('path'))[i];

                    path.setAttribute('d', d);
                    path.setAttribute('opacity', sector.opacity);

                    if (VGauge.isNonEmptyString(sector.fill)) {
                        path.setAttribute('fill', VGauge.hexRgbForColor(sector.fill));
                    }
                    else {
                        path.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
                    }

                    if (this._settings.cluster.useTickLabels) {
                        if (i === 0) {
                            addSvgTickLabel(this._settings.min, this._settings.startAngle * Math.PI / 180.0);
                        }
                        addSvgTickLabel(sector.sweepTo, angle);
                    }

                    prevSweepTo = sector.sweepTo;
                    prevAngle = angle;
                }
            }

            if (this._settings.targetValue) {
                if (VGauge.isNonEmptyString(this._settings.targetValue.indicator.path)) {
                    const d = (new DOMParser).parseFromString(this._settings.targetValue.indicator.path, "image/svg+xml").querySelector('[d]').getAttribute('d');
                    this._svgElems.targetValueIndicator.setAttribute('d', d);
                }

                if (VGauge.isNonEmptyString(this._settings.targetValue.indicator.fill)) {
                    this._svgElems.targetValueIndicator.setAttribute('fill', this._settings.targetValue.indicator.fill);
                } else {
                    this._svgElems.targetValueIndicator.setAttribute('fill', 'currentColor');
                }

                if (VGauge.isNonEmptyString(this._settings.targetValue.label.fontSize)) {
                    this._svgElems.targetValueLabel.setAttribute('font-size', this._settings.targetValue.label.fontSize);
                }

                if (VGauge.isNonEmptyString(this._settings.targetValue.label.fill)) {
                    this._svgElems.targetValueLabel.setAttribute('fill', this._settings.targetValue.label.fill);
                } else {
                    this._svgElems.targetValueLabel.setAttribute('fill', 'currentColor');
                }

                this._svgElems.targetValueLabel.setAttribute('text-anchor', 'middle');
                this._svgElems.targetValueLabel.setAttribute('dominant-baseline', 'alphabetic');
            }

            if (this._settings.targetValue) {
                this.targetValue = this._settings.targetValue.min;
            }

            this._initialized = true;
            this.refresh();
        }
        else {
            console.error(this.constructor.name + ': could not find container for id ' + this._id);
        }
    }

    _update() {
        const prevAngle = this._settings.startAngle * Math.PI / 180.0;
        let angle = this._settings.startAngle * Math.PI / 180.0 + (this._value - this._settings.min)
            * this._settings.sweepAngle
            / (this._settings.max - this._settings.min)
            * Math.PI / 180.0;

        const prevPoint1 = {
            x: this._settings.indicator.innerRadius * Math.cos(prevAngle),
            y: this._settings.indicator.innerRadius * Math.sin(prevAngle)
        };
        const prevPoint2 = {
            x: this._settings.indicator.outerRadius * Math.cos(prevAngle),
            y: this._settings.indicator.outerRadius * Math.sin(prevAngle)
        };
        const point1 = {
            x: this._settings.indicator.innerRadius * Math.cos(angle),
            y: this._settings.indicator.innerRadius * Math.sin(angle)
        };
        const point2 = {
            x: this._settings.indicator.outerRadius * Math.cos(angle),
            y: this._settings.indicator.outerRadius * Math.sin(angle)
        };

        this._svgElems.value.innerHTML = this._value.toFixed(this._settings.tweek.value.decimals);

        const d = 'M ' + prevPoint1.x + ',' + prevPoint1.y + ' '
            + 'A ' + this._settings.indicator.innerRadius + ' ' + this._settings.indicator.innerRadius + ' ' + (angle - prevAngle) * 180.0 / Math.PI + ' '
            + (angle - prevAngle > Math.PI ? '1' : '0') + ' 1 ' + point1.x + ' ' + point1.y + ' '
            + 'L ' + point2.x + ',' + point2.y + ' '
            + 'A ' + this._settings.indicator.outerRadius + ' ' + this._settings.indicator.outerRadius + ' ' + (angle - prevAngle) * 180.0 / Math.PI + ' '
            + (angle - prevAngle > Math.PI ? '1' : '0') + ' 0 ' + prevPoint2.x + ' ' + prevPoint2.y + ' '
            + 'L ' + prevPoint1.x + ',' + prevPoint1.y + ' Z';


        if (this._settings.cluster && VGauge.isNonEmptyArray(this._settings.cluster.sectors)) {
            let sector = this._settings.cluster.sectors.find(x => x.sweepTo >= this._value);
            if (sector === undefined) {
                sector = this._settings.cluster.sectors[0];
            }

            if (VGauge.isNonEmptyString(sector.fill)) {
                this._svgElems.valueSector.setAttribute('fill', VGauge.hexRgbForColor(sector.fill));
            } else {
                this._svgElems.valueSector.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            }

        }
        else {
            this._svgElems.valueSector.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            this._svgElems.valueSector.setAttribute('opacity', 1);
        }

        this._svgElems.valueSector.setAttribute('d', d);

        if (this._settings.targetValue) {
            const tipPoint = { x: 0, y: 0 };

            angle = this._settings.startAngle * Math.PI / 180.0 + (this._targetValue - this._settings.min)
                * this._settings.sweepAngle
                / (this._settings.max - this._settings.min)
                * Math.PI / 180.0;

            tipPoint.x = this._settings.targetValue.indicator.radius * Math.cos(angle);
            tipPoint.y = this._settings.targetValue.indicator.radius * Math.sin(angle);
            let rotate = angle * 180.0 / Math.PI - 90;
            let transform = 'translate(' + tipPoint.x + ',' + tipPoint.y + ') rotate(' + rotate + ')';
            this._svgElems.targetValueIndicator.setAttribute('transform', transform);
            const rotateLabel = angle < Math.PI ? angle + 1.5 * Math.PI : angle + 0.5 * Math.PI;

            const labelPoint = { x: 0, y: 0 };
            rotate = angle < Math.PI ? angle + 1.5 * Math.PI : angle + 0.5 * Math.PI;

            labelPoint.x = this._settings.targetValue.label.radius * Math.cos(angle);
            labelPoint.y = this._settings.targetValue.label.radius * Math.sin(angle);

            const tr1 = 'translate(' + labelPoint.x + ',' + labelPoint.y + ')';
            const rot = 'rotate(' + (rotate * 180.0 / Math.PI) + ')';
            const tr2 = 'translate(' + (this._targetValue < 0 ? -this._targetValueLabelMinusSignWidth / 2.0 : 0) + ',' + (this._targetValueLabelHeight / 2.0) + ')';
            transform = tr1 + ' ' + rot + ' ' + tr2;

            this._svgElems.targetValueLabel.innerHTML = this._targetValue;
            this._svgElems.targetValueLabel.setAttribute('transform', transform);
        }
    }

    refresh() {
        if (!this._initialized) {
            return;
        }

        this._currentColor = this._containerStyles.color;
        this._width = this._container.clientWidth;
        this._height = this._container.clientHeight;

        if (this._width > 0 && this._height > 0) {
            this._update();
        }
    }

    get min() {
        return this._settings.min;
    }

    get max() {
        return this._settings.max;
    }

    get settings() {
        return this._settings;
    }

    set settings(obj) {
        this._settings = obj;
    }

    set value(value) {
        if (this._value !== value) {
            if (value < this._min) {
                this._value = this._min;
            }
            else if (value > this._max) {
                this._value = this._max;
            }
            else {
                this._value = parseFloat(value);
            }

            if (this._initialized) {
                this._update();
            }
        }
    }

    get value() {
        return this._value;
    }

    set targetValue(value) {
        if (this._settings.targetValue) {
            if (value !== this._targetValue) {
                if (value < this._settings.targetValue.min) {
                    this._targetValue = parseFloat(this._settings.targetValue.min);
                }
                else if (value > this._settings.targetValue.max) {
                    this._targetValue = parseFloat(this._settings.targetValue.max);
                }
                else {
                    this._targetValue = parseFloat(value);
                }

                this._update();
            }
        }
    }

    get targetValue() {
        return this._targetValue;
    }



    get gridOpacity() {
        const grid = this._svgElems.helperGrid;
        if (grid) {
            return parseFloat(grid.getAttribute('opacity'));
        }
        return 0;
    }

    set gridOpacity(o) {
        const grid = this._svgElems.helperGrid;
        if (grid) {
            grid.setAttribute('opacity', o);
        }
    }

    setIconOpacity(id, opacity) {
        const icon = this._container.querySelector('[rid="' + id + '"]');
        if (icon) {
            icon.setAttribute('opacity', opacity);
        }
    }

}