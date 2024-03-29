// vgauge.js 1.1.0, copyright (c) 2024 A.J.Bauer, licensed under the MIT License,see LICENSE.txt for full license text.

class VGauge {
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
        const ld = '\r\n';

        t = (t === undefined ? 0 : t);
        c = (c === undefined ? false : c);

        let str = ' '.repeat(t) + '{' + ld;
        t += n;

        const last = Object.keys(obj).slice(-1)[0];
        for (const [key, value] of Object.entries(obj)) {
            if (obj.hasOwnProperty(key)) {
                if (Array.isArray(value)) {
                    str += ' '.repeat(t) + key + ': [' + ld;
                    for (var i = 0; i < value.length; i++) {
                        str += VGauge._getObjectInitializer(value[i], n, t + n, (i !== value.length - 1)) + ld;
                    }
                    str += ' '.repeat(t) + ']';
                }
                else if (typeof value === 'object') {
                    str += ' '.repeat(t) + key + ':' + ld + VGauge._getObjectInitializer(value, n, t, key !== last) + (key !== last ? ld : '');
                }
                else if (typeof value === 'string') {
                    str += ' '.repeat(t) + key + ': \'' + value + '\'' + (key === last ? '' : ',' + ld);
                }
                else {
                    str += ' '.repeat(t) + key + ': ' + value + (key === last ? '' : ',' + ld);
                }
            }
        }

        str += ld + ' '.repeat(t - n) + '}' + (c ? ',' : '');

        return str;
    }

    static getObjectInitializer(obj, n) {
        n = (n === undefined ? 1 : n);
        return VGauge._getObjectInitializer(obj, n);
    }

    constructor(groupId, settings) {
        this._initialized = false;
        this._id = groupId;
        this._group = null;
        this._settings = settings;

        this._value = 0.0;
        this._targetValue = 0.0;

        this._rootStyles = null;
        this._bodyStyles = null;
        this._groupStyles = null;

        this._groupElems = {
            background: null,
            helperGrid: null,
            labels: null,
            name: null,
            unit: null,
            value: null,
            cluster: null,
            ticks: null,
            icons: null,
            indicator: null,
            targetValue: null,
            targetValueIndicator: null
        };

        this._tickLabelsMinusSignWidth = 0;
        this._tickLabelsHeight = 0;
        this._targetValueLabelMinusSignWidth = 0;
        this._targetValueLabelLabelsHeight = 0;

        this._fontFamily = '';
        this._currentColor = null;

        this.recreate();
    }

    recreate() {
        this._initialized = false;

        if (this._settings === undefined || this._settings === null || typeof this._settings !== 'object') {
            console.error(this.constructor.name + ': settings needed');
        }

        this._group = document.querySelector('#' + this._id);
        this._group.innerHTML = '';

        if (this._group) {
            this._rootStyles = getComputedStyle(document.documentElement);
            this._bodyStyles = window.getComputedStyle(document.body);
            this._groupStyles = window.getComputedStyle(this._group);

            this._fontFamily = this._settings.fontFamily !== '' ? this._settings.fontFamily : this._bodyStyles.fontFamily.replace(/"/g, '');
            this._currentColor = this._groupStyles.color;

            this._groupElems.background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this._groupElems.background.setAttribute('x', '-50');
            this._groupElems.background.setAttribute('y', '-50');
            this._groupElems.background.setAttribute('width', '100');
            this._groupElems.background.setAttribute('height', '100');
            this._groupElems.background.setAttribute('stroke', 'none');
            this._groupElems.background.setAttribute('fill', 'none');
            this._group.append(this._groupElems.background);

            if (this._settings.useHelperGrid) {
                this._groupElems.helperGrid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                this._groupElems.helperGrid.setAttribute('opacity', '0');
                this._groupElems.helperGrid.setAttribute('stroke', 'currentColor');
                this._groupElems.helperGrid.setAttribute('stroke-width', '0.05');
                this._group.append(this._groupElems.helperGrid);
            }

            this._groupElems.labels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this._groupElems.labels.setAttribute('font-family', this._fontFamily);

            this._groupElems.name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._groupElems.name.setAttribute('text-anchor', 'middle');
            this._groupElems.labels.append(this._groupElems.name);

            this._groupElems.unit = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._groupElems.unit.setAttribute('text-anchor', 'start');
            this._groupElems.labels.append(this._groupElems.unit);

            this._groupElems.value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this._groupElems.value.setAttribute('text-anchor', (this._settings.value.decimals === 0 ? 'middle' : 'end'));
            this._groupElems.value.innerHTML = this._value.toFixed(this._settings.value.decimals);
            this._groupElems.labels.append(this._groupElems.value);

            this._group.append(this._groupElems.labels);

            if (this._settings.cluster) {
                this._groupElems.cluster = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                if (VGauge.isNonEmptyArray(this._settings.cluster.sectors)) {
                    for (let i = 0; i < this._settings.cluster.sectors.length; i++) {
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', 'M 0,0');
                        this._groupElems.cluster.append(path);
                    }
                }
                this._group.append(this._groupElems.cluster);

                if (this._settings.cluster.useTickLabels) {
                    this._groupElems.ticks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    this._group.append(this._groupElems.ticks);
                }
            }

            if (VGauge.isNonEmptyArray(this._settings.icons)) {
                this._groupElems.icons = document.createElementNS('http://www.w3.org/2000/svg', 'g');
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
                        if (iconSettings.fill !== '') {
                            icon.setAttribute('fill', iconSettings.fill);
                        } else {
                            icon.setAttribute('fill', 'currentColor');
                        }
                        this._groupElems.icons.append(icon);

                    } catch (e) {
                        console.error(this.constructor.name + ': icons error : ' + error);
                    }
                }
                this._group.append(this._groupElems.icons);
            }

            this._groupElems.indicator = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this._group.append(this._groupElems.indicator);

            if (this._settings.targetValue) {
                this._groupElems.targetValueIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                this._group.append(this._groupElems.targetValueIndicator);

                this._groupElems.targetValueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                this._group.append(this._groupElems.targetValueLabel);
            }

            this._group.setAttribute('style', 'user-select:none');

            if (this._settings.backgroundColor !== '') {
                this._groupElems.background.setAttribute('fill', VGauge.hexRgbForColor(this._settings.backgroundColor));
            } else {
                this._groupElems.background.setAttribute('fill', 'none');
            }

            if (this._settings.useHelperGrid) {
                for (let i = -50; i <= 50; i += 10) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', i);
                    line.setAttribute('x2', i);
                    line.setAttribute('y1', -50);
                    line.setAttribute('y2', 50);
                    if (i === 0) {
                        line.setAttribute('stroke-width', '0.1');
                    }
                    this._groupElems.helperGrid.append(line);
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
                    this._groupElems.helperGrid.append(line);
                }
            }

            this._groupElems.name.setAttribute('x', this._settings.name.x);
            this._groupElems.name.setAttribute('y', this._settings.name.y);
            if (this._settings.name.fill !== '') {
                this._groupElems.name.setAttribute('fill', this._settings.name.fill);
            } else {
                this._groupElems.name.setAttribute('fill', 'currentColor');
            }
            this._groupElems.name.setAttribute('font-size', this._settings.name.fontSize);
            this._groupElems.name.innerHTML = this._settings.name.text;

            this._groupElems.unit.setAttribute('x', this._settings.unit.x);
            this._groupElems.unit.setAttribute('y', this._settings.unit.y);
            if (this._settings.unit.fill !== '') {
                this._groupElems.unit.setAttribute('fill', this._settings.unit.fill);
            } else {
                this._groupElems.unit.setAttribute('fill', 'currentColor');
            }
            this._groupElems.unit.setAttribute('font-size', this._settings.unit.fontSize);
            this._groupElems.unit.innerHTML = this._settings.unit.text;

            this._groupElems.value.setAttribute('x', this._settings.value.x);
            this._groupElems.value.setAttribute('y', this._settings.value.y);

            if (this._settings.value.fill !== '') {
                this._groupElems.value.setAttribute('fill', VGauge.hexRgbForColor(this._settings.value.fill));
            } else {
                this._groupElems.value.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            }

            this._groupElems.value.setAttribute('font-size', this._settings.value.fontSize);

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

                    textPoint.x = this._settings.ticks.radius * Math.cos(angle);
                    textPoint.y = this._settings.ticks.radius * Math.sin(angle);

                    const tr1 = 'translate(' + textPoint.x + ',' + textPoint.y + ')';
                    const rot = 'rotate(' + (rotate * 180.0 / Math.PI) + ')';
                    const tr2 = 'translate(' + (value < 0 ? -this._tickLabelsMinusSignWidth / 2.0 : 0) + ',' + (this._tickLabelsHeight / 2.0) + ')';
                    const transform = tr1 + ' ' + rot + ' ' + tr2;

                    label.setAttribute('transform', transform);

                    this._groupElems.ticks.append(label);
                }

                if (this._settings.cluster.useTickLabels) {
                    const measureCanvas = new OffscreenCanvas(1, 1);
                    const measureCtx = measureCanvas.getContext('2d');

                    measureCtx.textAlign = 'center';
                    measureCtx.textBaseline = 'alphabetic';

                    measureCtx.font = this._settings.ticks.fontSize + ' ' + this._fontFamily;
                    this._tickLabelsMinusSignWidth = measureCtx.measureText('-').width;
                    this._tickLabelsHeight = measureCtx.measureText('0123456789').actualBoundingBoxAscent;

                    if (this._settings.targetValue) {
                        measureCtx.font = this._settings.targetValue.label.fontSize + ' ' + this._fontFamily;
                        this._targetValueLabelMinusSignWidth = measureCtx.measureText('-').width;
                        this._targetValueLabelHeight = measureCtx.measureText('0123456789').actualBoundingBoxAscent;
                    }

                    this._groupElems.ticks.setAttribute('text-anchor', 'middle');
                    this._groupElems.ticks.setAttribute('dominant-baseline', 'alphabetic');
                    this._groupElems.ticks.setAttribute('font-size', this._settings.ticks.fontSize);
                    this._groupElems.ticks.setAttribute('font-family', this._fontFamily);
                    this._groupElems.ticks.setAttribute('opacity', this._settings.ticks.opacity)
                    if (this._settings.ticks.fill !== '') {
                        this._groupElems.ticks.setAttribute('fill', this._settings.ticks.fill);
                    } else {
                        this._groupElems.ticks.setAttribute('fill', 'currentColor');
                    }
                }

                for (let i = 0; i < this._settings.cluster.sectors.length; i++) {
                    const sector = this._settings.cluster.sectors[i];

                    prevPoint1.x = this._settings.cluster.innerRadius * Math.cos(prevAngle);
                    prevPoint1.y = this._settings.cluster.innerRadius * Math.sin(prevAngle);
                    prevPoint2.x = this._settings.cluster.outerRadius * Math.cos(prevAngle);
                    prevPoint2.y = this._settings.cluster.outerRadius * Math.sin(prevAngle);

                    angle = prevAngle + (sector.sweepTo - prevSweepTo) * this._settings.sweepAngle / (this._settings.max - this._settings.min) * Math.PI / 180.0;

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

                    const path = Array.from(this._groupElems.cluster.querySelectorAll('path'))[i];

                    path.setAttribute('d', d);
                    path.setAttribute('opacity', sector.opacity);

                    if (sector.fill !== '') {
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
                if (this._settings.targetValue.indicator.path !== '') {
                    const d = (new DOMParser).parseFromString(this._settings.targetValue.indicator.path, "image/svg+xml").querySelector('[d]').getAttribute('d');
                    this._groupElems.targetValueIndicator.setAttribute('d', d);
                }

                if (this._settings.targetValue.indicator.fill !== '') {
                    this._groupElems.targetValueIndicator.setAttribute('fill', this._settings.targetValue.indicator.fill);
                } else {
                    this._groupElems.targetValueIndicator.setAttribute('fill', 'currentColor');
                }

                if (this._settings.targetValue.label.fontSize !== '') {
                    this._groupElems.targetValueLabel.setAttribute('font-size', this._settings.targetValue.label.fontSize);
                }

                if (this._settings.targetValue.label.fill !== '') {
                    this._groupElems.targetValueLabel.setAttribute('fill', this._settings.targetValue.label.fill);
                } else {
                    this._groupElems.targetValueLabel.setAttribute('fill', 'currentColor');
                }

                this._groupElems.targetValueLabel.setAttribute('text-anchor', 'middle');
                this._groupElems.targetValueLabel.setAttribute('dominant-baseline', 'alphabetic');
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
        let angle = this._settings.startAngle * Math.PI / 180.0 + (this._value - this._settings.min) * this._settings.sweepAngle / (this._settings.max - this._settings.min) * Math.PI / 180.0;

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

        this._groupElems.value.innerHTML = this._value.toFixed(this._settings.value.decimals);

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

            if (this._settings.indicator.fill !== '') {
                this._groupElems.indicator.setAttribute('fill', VGauge.hexRgbForColor(this._settings.indicator.fill));
            } else if (sector.useAsIndicatorColor && sector.fill !== '') {
                this._groupElems.indicator.setAttribute('fill', VGauge.hexRgbForColor(sector.fill));
            } else {
                this._groupElems.indicator.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            }

            if (this._settings.value.fill !== '') {
                this._groupElems.value.setAttribute('fill', VGauge.hexRgbForColor(this._settings.value.fill));
            } else if (sector.useAsValueColor && sector.fill !== '') {
                this._groupElems.value.setAttribute('fill', VGauge.hexRgbForColor(sector.fill));
            } else {
                this._groupElems.value.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            }
        }
        else {
            this._groupElems.indicator.setAttribute('fill', VGauge.hexRgbForColor(this._currentColor));
            this._groupElems.indicator.setAttribute('opacity', 1);
        }

        this._groupElems.indicator.setAttribute('d', d);

        if (this._settings.targetValue) {
            const tipPoint = { x: 0, y: 0 };

            angle = this._settings.startAngle * Math.PI / 180.0 + (this._targetValue - this._settings.min) * this._settings.sweepAngle / (this._settings.max - this._settings.min) * Math.PI / 180.0;

            tipPoint.x = this._settings.targetValue.indicator.radius * Math.cos(angle);
            tipPoint.y = this._settings.targetValue.indicator.radius * Math.sin(angle);
            let rotate = angle * 180.0 / Math.PI - 90;
            let transform = 'translate(' + tipPoint.x + ',' + tipPoint.y + ') rotate(' + rotate + ')';
            this._groupElems.targetValueIndicator.setAttribute('transform', transform);
            const rotateLabel = angle < Math.PI ? angle + 1.5 * Math.PI : angle + 0.5 * Math.PI;

            const labelPoint = { x: 0, y: 0 };
            rotate = angle < Math.PI ? angle + 1.5 * Math.PI : angle + 0.5 * Math.PI;

            labelPoint.x = this._settings.targetValue.label.radius * Math.cos(angle);
            labelPoint.y = this._settings.targetValue.label.radius * Math.sin(angle);

            const tr1 = 'translate(' + labelPoint.x + ',' + labelPoint.y + ')';
            const rot = 'rotate(' + (rotate * 180.0 / Math.PI) + ')';
            const tr2 = 'translate(' + (this._targetValue < 0 ? -this._targetValueLabelMinusSignWidth / 2.0 : 0) + ',' + (this._targetValueLabelHeight / 2.0) + ')';
            transform = tr1 + ' ' + rot + ' ' + tr2;

            this._groupElems.targetValueLabel.innerHTML = this._targetValue;
            this._groupElems.targetValueLabel.setAttribute('transform', transform);
        }
    }

    refresh() {
        if (!this._initialized) {
            return;
        }

        this._currentColor = this._groupStyles.color;
        this._update();
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
            if (value < this._settings.min) {
                this._value = this._settings.min;
            }
            else if (value > this._settings.max) {
                this._value = this._settings.max;
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
        const grid = this._groupElems.helperGrid;
        if (grid) {
            return parseFloat(grid.getAttribute('opacity'));
        }
        return 0;
    }

    set gridOpacity(o) {
        const grid = this._groupElems.helperGrid;
        if (grid) {
            grid.setAttribute('opacity', o);
        }
    }

    setIconOpacity(id, opacity) {
        const icon = this._group.querySelector('[rid="' + id + '"]');
        if (icon) {
            icon.setAttribute('opacity', opacity);
        }
    }
}