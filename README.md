# VGauge

A javascript svg gauge

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/basic_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/basic_light.svg">
  <img alt="gauge with basic settings" height="150">  
</picture>

_"zero dependencies and scales nicely on touch devices"_

demo here

## Cookbook

### Basic

```html
<div id="gaugeContainer">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"></svg>
</div>
```
```javascript

const settings = {
    name: 'Room 1',
    unit: '°C',
    min: -20,
    max: 50,
    startAngle: 90,
    sweepAngle: 260,
    indicator:
    {
        innerRadius: 32,
        outerRadius: 40
    },
    tweek:
    {
        fontFamily: '',
        backgroundColor: '',
        name:
        {
            x: 0,
            y: -10,
            fill: '',
            fontSize: '7px'
        },
        unit:
        {
            x: 2,
            y: 39,
            fill: '',
            fontSize: '11px'
        },
        value:
        {
            x: 40,
            y: 20,
            fill: '',
            fontSize: '1rem',
            decimals: 1
        },
        ticks:
        {
            radius: 44,
            fontSize: '8px',
            fill: '#7f7f7f',
            opacity: 0.1
        }
    }
};
```
```javascript

let gauge = new VGauge('gaugeContainer', settings);

gauge.value = 34.6;

```
### Single Color



### As intended


### Add an icon





result:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/basic_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/basic_light.svg">
  <img alt="gauge with basic settings" height="200">  
</picture>



4. settings names help

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/names_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/gauge2_cc_black.svg">
  <img alt="Shows a gauge" width="500">  
</picture>

5. demo

> [!TIP]
> when using the demo, you can use ctrl-s inside the JSON editor to recreate.
   
